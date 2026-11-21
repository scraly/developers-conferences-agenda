#!/usr/bin/env python3
"""Audit recording links in METADATA.csv against their event dates.

A link is considered valid when at least one video reachable from it was
published AFTER the event date.  Links whose newest content predates the
event are stale (usually a previous edition or a dormant channel).

Usage:
    python3 tools/auditRecordingDates.py [METADATA.csv] [options]

Options:
    --workers N        parallel yt-dlp workers (default 8)
    --today YYYY-MM-DD date used to detect events that have not happened yet
    --deep             rescan STALE/NO_DATA links with a wider sample
    --cache PATH       JSON cache (default tmp/recording-dates.json)
    --tsv PATH         write a TSV report (default tmp/recording-date-report.tsv)

Requirements: yt-dlp (https://github.com/yt-dlp/yt-dlp) and Python 3.9+.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import csv
import datetime as dt
import json
import os
import re
import subprocess
import sys
import threading
import urllib.request

LOCK = threading.Lock()
MEM: dict[str, dict] = {}


def sh(args: list[str], timeout: int = 120) -> str:
    """Run yt-dlp and return stdout; never raises."""
    try:
        p = subprocess.run(
            ["yt-dlp", "--no-warnings", "--ignore-errors", *args],
            text=True,
            capture_output=True,
            timeout=timeout,
        )
        return p.stdout or ""
    except subprocess.TimeoutExpired:
        return ""
    except FileNotFoundError:
        sys.exit("yt-dlp not found; install it first (e.g. brew install yt-dlp)")
    except Exception:
        return ""


def list_target(url: str) -> str:
    """Turn a channel/handle URL into the newest-first videos listing URL."""
    if "/playlist?" in url or "/watch?" in url or "youtu.be/" in url:
        return url
    return url.rstrip("/") + "/videos"


def flat_ids(url: str, limit: int) -> list[tuple[str, str]]:
    out = sh(
        ["--flat-playlist", "--playlist-end", str(limit),
         "--print", "%(id)s\t%(title)s", list_target(url)]
    )
    ids = []
    for line in out.splitlines():
        if "\t" not in line:
            continue
        vid, title = line.split("\t", 1)
        if re.fullmatch(r"[\w-]{11}", vid):
            ids.append((vid, title))
    return ids


def video_date(vid: str) -> dict | None:
    out = sh(
        ["--skip-download", "--print", "%(upload_date)s\t%(title)s",
         f"https://www.youtube.com/watch?v={vid}"],
        90,
    )
    for line in out.splitlines():
        head, _, title = line.partition("\t")
        if re.fullmatch(r"\d{8}", head):
            return {"id": vid, "date": head, "title": title}
    return None


def sample_dates(url: str, count: int = 3) -> list[dict]:
    """Upload dates for the first few items of a playlist/channel/video."""
    if "/watch?" in url or "youtu.be/" in url:
        m = re.search(r"(?:v=|youtu\.be/)([\w-]{11})", url)
        d = video_date(m.group(1)) if m else None
        return [d] if d else []
    dates = []
    for vid, _ in flat_ids(url, count)[:count]:
        d = video_date(vid)
        if d:
            dates.append(d)
    return dates


def http_get(url: str) -> str:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        return urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "ignore")
    except Exception:
        return ""


def feed_dates(xml: str, limit: int = 15) -> list[dict]:
    found = []
    for entry in re.findall(r"<entry>.*?</entry>", xml, re.S)[:limit]:
        v = re.search(r"<yt:videoId>([^<]+)", entry)
        d = re.search(r"<published>(\d{4})-(\d{2})-(\d{2})", entry)
        t = re.search(r"<title>([^<]*)", entry)
        if v and d:
            found.append({"id": v.group(1), "date": "".join(d.groups()),
                          "title": t.group(1) if t else ""})
    return found


def resolve_channel_id(url: str) -> str | None:
    """Resolve /channel/, @handle, /c/ and /user/ URLs to a UC id."""
    m = re.search(r"/channel/(UC[\w-]{20,})", url)
    if m:
        return m.group(1)
    html = http_get(url)
    m = re.search(r'itemprop="identifier" content="(UC[\w-]{20,})"', html)
    if m:
        return m.group(1)
    # Last resort: yt-dlp may still resolve it when the page HTML is blocked.
    out = sh(["--flat-playlist", "--playlist-end", "1", "--print", "%(channel_id)s",
              list_target(url)], 60)
    return next((ln.strip() for ln in out.splitlines()
                 if re.fullmatch(r"UC[\w-]{20,}", ln.strip())), None)


def channel_rss(url: str) -> list[dict] | None:
    """Latest 15 uploads from a channel's RSS feed (no auth required)."""
    cid = resolve_channel_id(url)
    if not cid:
        return None
    return feed_dates(http_get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}")) or None


def playlist_rss(url: str) -> list[dict] | None:
    """Latest 15 items from a playlist's RSS feed (no auth required)."""
    m = re.search(r"[?&]list=([\w-]+)", url)
    if not m:
        return None
    return feed_dates(http_get(f"https://www.youtube.com/feeds/videos.xml?playlist_id={m.group(1)}")) or None


def inspect(url: str, count: int, force: bool = False) -> dict:
    """Fetch upload dates for one URL, using the cache when possible."""
    with LOCK:
        if not force and url in MEM:
            return MEM[url]
    if "/playlist?" in url:
        dates = playlist_rss(url)
    elif "/watch?" in url or "youtu.be/" in url:
        dates = None
    else:
        dates = channel_rss(url)
    if dates is None:
        dates = sample_dates(url, count)
    rec = {"url": url, "samples": dates, "error": None if dates else "no items/dates"}
    with LOCK:
        MEM[url] = rec
        save_cache()
    return rec


def save_cache() -> None:
    if not CACHE:
        return
    os.makedirs(os.path.dirname(CACHE) or ".", exist_ok=True)
    with open(CACHE, "w") as f:
        json.dump(MEM, f, indent=1)


def parse_events(path: str) -> list[dict]:
    rows = []
    for lineno, line in enumerate(open(path, encoding="utf-8"), 1):
        line = line.rstrip("\n")
        m = re.search(r"recording:(\S+)", line)
        if not m:
            continue
        eid = line.split(",", 1)[0]
        dm = re.match(r"(\d{4})-(\d{2})-(\d{2})-", eid)
        date = dt.date(*map(int, dm.groups())) if dm else None
        rows.append({"line": lineno, "event_id": eid, "url": m.group(1),
                     "event_date": date})
    return rows


def classify(rec: dict, event_date: dt.date | None, today: dt.date) -> tuple[str, str]:
    latest = None
    dates = [s["date"] for s in rec.get("samples") or []
             if re.fullmatch(r"\d{8}", s.get("date") or "")]
    if dates:
        raw = max(dates)
        latest = f"{raw[:4]}-{raw[4:6]}-{raw[6:]}"
    if event_date is None:
        return "NO_DATE", latest or "-"
    if event_date > today:
        return "FUTURE", latest or "-"
    if latest is None:
        return "NO_DATA", "-"
    if latest > event_date.isoformat():
        return "OK", latest
    if latest == event_date.isoformat():
        return "SAME_DAY", latest
    return "STALE", latest


def main() -> None:
    global CACHE, MEM
    ap = argparse.ArgumentParser()
    ap.add_argument("csv", nargs="?", default="METADATA.csv")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--today", default=dt.date.today().isoformat())
    ap.add_argument("--deep", action="store_true")
    ap.add_argument("--cache", default="tmp/recording-dates.json")
    ap.add_argument("--tsv", default="tmp/recording-date-report.tsv")
    args = ap.parse_args()

    CACHE = args.cache
    if os.path.exists(CACHE):
        try:
            MEM = json.load(open(CACHE))
        except json.JSONDecodeError:
            MEM = {}
    today = dt.date.fromisoformat(args.today)
    rows = parse_events(args.csv)
    urls = list(dict.fromkeys(r["url"] for r in rows))
    count = 3

    def run(url: str) -> dict:
        return inspect(url, count)

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        for i, _ in enumerate(ex.map(run, urls), 1):
            print(f"{i}/{len(urls)}", file=sys.stderr)

    if args.deep:
        # Playlists are usually newest-first, but verify suspects with a wider
        # window so an unusual ordering does not cause a false STALE verdict.
        stale: list[str] = []
        for r in rows:
            verdict, _ = classify(MEM.get(r["url"], {}), r["event_date"], today)
            if verdict in ("STALE", "NO_DATA") and r["url"] not in stale:
                stale.append(r["url"])
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
            list(ex.map(lambda u: inspect(u, 12, force=True), stale))
        save_cache()

    report = []
    for r in rows:
        verdict, latest = classify(MEM.get(r["url"], {}), r["event_date"], today)
        report.append({**r, "verdict": verdict, "latest": latest,
                       "samples": len((MEM.get(r["url"], {}) or {}).get("samples") or [])})

    os.makedirs(os.path.dirname(args.tsv) or ".", exist_ok=True)
    with open(args.tsv, "w", newline="") as f:
        w = csv.writer(f, delimiter="\t", lineterminator="\n")
        w.writerow(["verdict", "line", "event_date", "latest_upload", "samples", "event_id", "url"])
        for r in report:
            w.writerow([r["verdict"], r["line"], r["event_date"] or "", r["latest"],
                        r["samples"], r["event_id"], r["url"]])

    summary: dict[str, int] = {}
    for r in report:
        summary[r["verdict"]] = summary.get(r["verdict"], 0) + 1
    print(json.dumps(summary, indent=2))
    print(f"report: {args.tsv}", file=sys.stderr)
    print("\nLinks to review (remove the recording: field unless verified):", file=sys.stderr)
    for r in report:
        if r["verdict"] in ("STALE", "NO_DATA", "SAME_DAY"):
            print(f"  {r['verdict']:8} {r['event_id'][:55]:55} last={r['latest']:10} {r['url']}",
                  file=sys.stderr)


if __name__ == "__main__":
    main()
