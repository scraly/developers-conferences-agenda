#!/usr/bin/env node
/**
 * Find recordings for events that do not have one in METADATA.csv.
 *
 * The event listing is README.md plus archives/YYYY.md. tools/mdParser.js
 * merges those files into page/src/misc/all-events.json, which is the input
 * used here. Each candidate is checked against METADATA.csv, then the scanner
 * looks at the event website and YouTube. Date verification uses the shared
 * helpers in recordingHelpers.js.
 *
 * Usage:
 *   node tools/recordingScanner.js [options]
 *
 * By default the scanner only reports candidates. Pass --write to add verified
 * YouTube recordings to METADATA.csv.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseArgs } = require('node:util');
const {
  generateEventId,
  parseRecordings,
  splitMetadataLine,
} = require('./mdParser');
const {
  classify,
  createInspector,
  httpGet,
  isValidIsoDate,
  localIsoDate,
  runPool,
  runYtDlp,
  saveCache,
  loadCache,
} = require('./recordingHelpers');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_EVENTS = path.join(ROOT, 'page', 'src', 'misc', 'all-events.json');
const DEFAULT_METADATA = path.join(ROOT, 'METADATA.csv');
const DEFAULT_CACHE = path.join(ROOT, 'tmp', 'recording-scanner-cache.json');
const DEFAULT_JSON = path.join(ROOT, 'tmp', 'recording-scan.json');
const DEFAULT_TSV = path.join(ROOT, 'tmp', 'recording-scan.tsv');
const DEFAULT_MD = path.join(ROOT, 'tmp', 'recording-scan.md');

const DEFAULT_WORKERS = 2;
const DEFAULT_MIN_SCORE = 55;
const SEARCH_RESULTS = 8;
const CHANNEL_LIMIT = 2;
const PLAYLIST_LIMIT = 100;
const MAX_VERIFY = 8;

const SOURCE_SCORES = {
  'official-site': 50,
  'channel-playlist': 30,
  'youtube-search': 10,
};

const KIND_SCORES = {
  playlist: 20,
  video: 5,
  page: 8,
};

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'conference',
  'conf',
  'event',
  'events',
  'for',
  'of',
  'the',
]);

function decodeHtml(value) {
  return String(value)
    .replace(/\\u0026/gi, '&')
    .replace(/\\u003d/gi, '=')
    .replace(/\\u002f/gi, '/')
    .replace(/\\\//g, '/')
    .replace(/&amp;/gi, '&')
    .replace(/&#0*38;/g, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2f;/gi, '/');
}

function normalizeText(value) {
  return decodeHtml(value)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function tokenize(value) {
  return [
    ...new Set(
      normalizeText(value)
        .split(/\s+/)
        .filter((token) => token.length > 1 && !/^\d{4}$/.test(token))
        .filter((token) => !STOPWORDS.has(token))
    ),
  ];
}

function extractYears(value) {
  return [...new Set(normalizeText(value).match(/\b(?:19|20)\d{2}\b/g) || [])];
}

function tokenOverlap(left, right) {
  if (!left.length) {
    return 0;
  }
  const rightSet = new Set(right);
  return left.filter((token) => rightSet.has(token)).length / left.length;
}

function canonicalYoutubeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(decodeHtml(rawUrl).trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^(www|m)\./, '');
  if (host === 'youtu.be') {
    const videoId = parsed.pathname.replace(/^\/+/, '').split('/')[0];
    return /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube.com/watch?v=${videoId}`
      : null;
  }

  if (host !== 'youtube.com') {
    return null;
  }

  const playlistId = parsed.searchParams.get('list');
  if (playlistId && /^[\w-]+$/.test(playlistId)) {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
  }

  const videoId = parsed.searchParams.get('v');
  if (videoId && /^[\w-]{11}$/.test(videoId)) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  const pathVideo = /^\/(?:embed|live|shorts|v)\/([\w-]{11})/.exec(
    parsed.pathname
  );
  if (pathVideo) {
    return `https://www.youtube.com/watch?v=${pathVideo[1]}`;
  }

  return null;
}

function candidateKind(url) {
  if (url.includes('/playlist?')) {
    return 'playlist';
  }
  if (url.includes('/watch?') || url.includes('youtu.be/')) {
    return 'video';
  }
  return 'page';
}

function makeCandidate(url, extra = {}) {
  return {
    url,
    kind: extra.kind || candidateKind(url),
    title: extra.title || '',
    channel: extra.channel || '',
    channel_id: extra.channel_id || '',
    sources: extra.source ? [extra.source] : [],
  };
}

function extractYouTubeUrls(value) {
  const decoded = decodeHtml(value);
  const pattern =
    /https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:playlist\?[^\s"'<>\\]+|watch\?[^\s"'<>\\]+|(?:embed|live|shorts|v)\/[\w-]{11})|youtu\.be\/[\w-]{11})/gi;
  const urls = new Set();

  for (const match of decoded.match(pattern) || []) {
    const canonical = canonicalYoutubeUrl(match);
    if (canonical) {
      urls.add(canonical);
    }
  }

  return [...urls];
}

function extractRecordingLinks(html, baseUrl, limit = 3) {
  const decoded = decodeHtml(html);
  const base = new URL(baseUrl);
  const links = [];
  const seen = new Set();
  const anchorPattern =
    /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of decoded.matchAll(anchorPattern)) {
    const href = match[1].trim();
    const text = decodeHtml(match[2].replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim();

    let parsed;
    try {
      parsed = new URL(href, base);
    } catch {
      continue;
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      continue;
    }
    if (parsed.hostname.toLowerCase() !== base.hostname.toLowerCase()) {
      continue;
    }
    if (parsed.href === base.href) {
      continue;
    }

    const target = `${text} ${parsed.pathname}`.toLowerCase();
    if (
      !/record|video|watch|media|archive|stream|playback|session|replay/.test(
        target
      )
    ) {
      continue;
    }

    parsed.hash = '';
    if (seen.has(parsed.href)) {
      continue;
    }
    seen.add(parsed.href);
    links.push({ url: parsed.href, title: text });

    if (links.length >= limit) {
      break;
    }
  }

  return links;
}

function readMetadataRecordings(content) {
  const recordings = new Map();
  const lines = String(content).split(/\r?\n/);

  for (const line of lines) {
    const { eventId, fields } = splitMetadataLine(line);
    const entries = [];

    for (const field of fields) {
      const separatorIndex = field.indexOf(':');
      if (separatorIndex === -1) {
        continue;
      }
      if (field.slice(0, separatorIndex).trim() !== 'recording') {
        continue;
      }
      entries.push(...parseRecordings(field.slice(separatorIndex + 1).trim()));
    }

    if (entries.length) {
      recordings.set(eventId, entries);
    }
  }

  return recordings;
}

function selectMissingEvents(events, metadataRecordings, options = {}) {
  const today = options.today || localIsoDate();
  const years = options.years && options.years.length
    ? new Set(options.years)
    : null;
  const eventFilter = options.eventFilter
    ? normalizeText(options.eventFilter)
    : '';
  const since = options.since || null;
  const missing = [];
  const selected = [];
  const stats = {
    total: events.length,
    matching: 0,
    recorded: 0,
    futureSkipped: 0,
    toCheck: 0,
  };

  for (const event of events) {
    const eventId = generateEventId(event);
    const eventDate = new Date(event.date[0]);
    const eventDateIso = eventDate.toISOString().slice(0, 10);
    const eventYear = eventDate.getUTCFullYear();
    const hasRecording = metadataRecordings.has(eventId);

    if (!hasRecording) {
      missing.push(event);
    }

    if (since && eventYear < since) {
      continue;
    }
    if (years && !years.has(eventYear)) {
      continue;
    }
    if (
      eventFilter &&
      !normalizeText(`${event.name} ${event.location}`).includes(eventFilter)
    ) {
      continue;
    }

    stats.matching += 1;
    if (hasRecording) {
      stats.recorded += 1;
      continue;
    }
    if (!options.includeFuture && eventDateIso > today) {
      stats.futureSkipped += 1;
      continue;
    }

    selected.push({
      ...event,
      event_id: eventId,
      event_date: eventDateIso,
      event_year: eventYear,
      event_url: event.hyperlink || '',
    });
  }

  selected.sort((left, right) => {
    if (left.event_date !== right.event_date) {
      return left.event_date < right.event_date ? 1 : -1;
    }
    return left.name < right.name ? -1 : 1;
  });

  stats.toCheck = selected.length;
  return { missing, selected, stats };
}

function mergeCandidates(candidates) {
  const merged = new Map();

  for (const candidate of candidates) {
    const existing = merged.get(candidate.url);
    if (!existing) {
      merged.set(candidate.url, {
        ...candidate,
        sources: [...new Set(candidate.sources || [])],
      });
      continue;
    }

    existing.sources = [
      ...new Set([...existing.sources, ...(candidate.sources || [])]),
    ];
    existing.title = existing.title || candidate.title;
    existing.channel = existing.channel || candidate.channel;
    existing.channel_id = existing.channel_id || candidate.channel_id;
  }

  return [...merged.values()];
}

function scoreCandidate(event, candidate) {
  const eventTokens = tokenize(event.name);
  const candidateTokens = tokenize(`${candidate.title} ${candidate.channel}`);
  const nameRatio = tokenOverlap(eventTokens, candidateTokens);
  const channelRatio = tokenOverlap(eventTokens, tokenize(candidate.channel));
  const eventName = normalizeText(event.name)
    .replace(/\b(?:19|20)\d{2}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const candidateName = normalizeText(
    `${candidate.title} ${candidate.channel}`
  )
    .replace(/\b(?:19|20)\d{2}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const sources = candidate.sources.length ? candidate.sources : ['unknown'];
  const sourceScore = Math.max(
    ...sources.map((source) => SOURCE_SCORES[source] || 0)
  );
  let score =
    sourceScore +
    (KIND_SCORES[candidate.kind] || 0) +
    Math.round(nameRatio * 35) +
    Math.round(channelRatio * 10) +
    Math.max(0, sources.length - 1) * 5;

  if (eventName && candidateName.includes(eventName)) {
    score += 25;
  }

  if (normalizeText(candidate.title) === normalizeText(event.name)) {
    score += 20;
  }

  if (
    candidate.kind === 'playlist' &&
    /\b(all|complete|full|archive|recordings)\b/.test(normalizeText(candidate.title))
  ) {
    score += 15;
  }

  const candidateYears = extractYears(candidate.title);
  if (candidateYears.length) {
    score += candidateYears.includes(String(event.event_year)) ? 20 : -35;
  }

  return score;
}

function rankCandidates(event, candidates, options = {}) {
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  return mergeCandidates(candidates)
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(event, candidate),
    }))
    .filter((candidate) => candidate.score >= minScore)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.url < right.url ? -1 : 1;
    });
}

async function verifyCandidates(event, candidates, inspector, today) {
  const verified = [];

  for (const candidate of candidates.slice(0, MAX_VERIFY)) {
    if (candidate.kind === 'page') {
      verified.push({
        ...candidate,
        verdict: 'MANUAL',
        latest_upload: '-',
        samples: 0,
        accepted: false,
        writable: false,
      });
      continue;
    }

    let record = {};
    try {
      record = await inspector.inspect(candidate.url, 3);
    } catch {
      record = {};
    }
    const [verdict, latest] = classify(record, event.event_date, today);
    let adjustment = 0;
    if (verdict === 'OK') {
      adjustment = 10;
    } else if (verdict === 'SAME_DAY') {
      adjustment = 5;
    } else if (verdict === 'NO_DATA') {
      adjustment = -20;
    } else if (verdict === 'STALE') {
      adjustment = -60;
    } else if (verdict === 'FUTURE') {
      adjustment = -100;
    }

    const accepted = verdict === 'OK' || verdict === 'SAME_DAY';
    verified.push({
      ...candidate,
      score: candidate.score + adjustment,
      verdict,
      latest_upload: latest,
      samples: Array.isArray(record.samples) ? record.samples.length : 0,
      accepted,
      writable: accepted,
    });
  }

  return verified.sort((left, right) => {
    if (left.accepted !== right.accepted) {
      return left.accepted ? -1 : 1;
    }
    return right.score - left.score;
  });
}

async function discoverFromOfficialSite(event, deps = {}) {
  const get = deps.httpGet || httpGet;
  if (!/^https?:\/\//i.test(event.event_url || '')) {
    return [];
  }

  const html = await get(event.event_url);
  if (!html) {
    return [];
  }

  const candidates = extractYouTubeUrls(html).map((url) =>
    makeCandidate(url, { source: 'official-site' })
  );
  if (candidates.length) {
    return candidates;
  }

  for (const link of extractRecordingLinks(html, event.event_url)) {
    const childHtml = await get(link.url);
    const childUrls = extractYouTubeUrls(childHtml);

    for (const url of childUrls) {
      candidates.push(
        makeCandidate(url, {
          source: 'official-site',
          title: link.title,
        })
      );
    }

    if (!childUrls.length) {
      candidates.push(
        makeCandidate(link.url, {
          source: 'official-site',
          kind: 'page',
          title: link.title,
        })
      );
    }
  }

  return candidates;
}

async function searchYoutube(event, deps = {}) {
  const run = deps.runYtDlp || runYtDlp;
  const year = String(event.event_year);
  const hasYear = extractYears(event.name).includes(year);
  const query = hasYear ? event.name : `${event.name} ${year}`;
  const output = await run([
    '--flat-playlist',
    '--playlist-end',
    String(SEARCH_RESULTS),
    '--print',
    '%(id)s\t%(title)s\t%(channel)s\t%(channel_id)s\t%(webpage_url)s',
    `ytsearch${SEARCH_RESULTS}:${query}`,
  ]);

  const candidates = [];
  const channels = new Map();

  for (const line of output.split(/\r?\n/)) {
    const parts = line.split('\t');
    if (parts.length < 5) {
      continue;
    }
    const [id, title, channel, channelId, webpageUrl] = parts;
    if (!/^[\w-]{11}$/.test(id)) {
      continue;
    }

    const url =
      canonicalYoutubeUrl(webpageUrl) ||
      `https://www.youtube.com/watch?v=${id}`;
    candidates.push(
      makeCandidate(url, {
        source: 'youtube-search',
        title,
        channel,
        channel_id: channelId,
      })
    );

    if (/^UC[\w-]{20,}$/.test(channelId)) {
      channels.set(channelId, channel);
    }
  }

  return { candidates, channels: [...channels.entries()] };
}

async function discoverChannelPlaylists(event, channels, deps = {}) {
  const run = deps.runYtDlp || runYtDlp;
  const candidates = [];

  for (const [channelId, channel] of channels.slice(0, CHANNEL_LIMIT)) {
    const output = await run([
      '--flat-playlist',
      '--playlist-end',
      String(PLAYLIST_LIMIT),
      '--print',
      '%(id)s\t%(title)s\t%(url)s',
      `https://www.youtube.com/channel/${channelId}/playlists`,
    ]);

    for (const line of output.split(/\r?\n/)) {
      const parts = line.split('\t');
      if (parts.length < 3) {
        continue;
      }
      const [id, title, webpageUrl] = parts;
      const url =
        canonicalYoutubeUrl(webpageUrl) ||
        (/^[\w-]+$/.test(id)
          ? `https://www.youtube.com/playlist?list=${id}`
          : null);
      if (!url) {
        continue;
      }

      candidates.push(
        makeCandidate(url, {
          source: 'channel-playlist',
          kind: 'playlist',
          title,
          channel,
          channel_id: channelId,
        })
      );
    }
  }

  return candidates;
}

async function discoverRecordings(event, deps = {}) {
  const inspector = deps.inspector;
  const today = deps.today || localIsoDate();

  const [official, search] = await Promise.all([
    discoverFromOfficialSite(event, deps),
    searchYoutube(event, deps),
  ]);
  const playlists = await discoverChannelPlaylists(
    event,
    search.channels,
    deps
  );

  const ranked = rankCandidates(
    event,
    [...official, ...search.candidates, ...playlists],
    { minScore: deps.minScore }
  );
  const verified = await verifyCandidates(event, ranked, inspector, today);
  const accepted = verified
    .filter((candidate) => candidate.accepted)
    .sort((left, right) => {
      if (left.kind !== right.kind) {
        return left.kind === 'playlist' ? -1 : 1;
      }
      return right.score - left.score;
    });
  const best =
    accepted[0] ||
    verified.find((candidate) => candidate.kind === 'page') ||
    verified[0] ||
    null;

  return {
    candidates: verified,
    best,
    verified: Boolean(best && best.accepted),
    manual: Boolean(best && !best.accepted && best.kind === 'page'),
  };
}

function emptyScanCache() {
  return { version: 1, updated_at: null, events: {}, dates: {} };
}

function loadScanCache(cachePath) {
  const parsed = loadCache(cachePath);
  if (
    parsed &&
    typeof parsed === 'object' &&
    parsed.events &&
    typeof parsed.events === 'object' &&
    parsed.dates &&
    typeof parsed.dates === 'object'
  ) {
    return {
      version: 1,
      updated_at:
        typeof parsed.updated_at === 'string' ? parsed.updated_at : null,
      events: parsed.events,
      dates: parsed.dates,
    };
  }
  return emptyScanCache();
}

function getCacheStats(cachePath, events, options = {}) {
  if (options.disabled) {
    return {
      enabled: false,
      refreshed: false,
      alreadyChecked: 0,
      eventsInCache: 0,
      sizeBytes: 0,
      updatedAt: null,
    };
  }
  if (options.refresh) {
    return {
      enabled: true,
      refreshed: true,
      alreadyChecked: 0,
      eventsInCache: 0,
      sizeBytes: 0,
      updatedAt: null,
    };
  }

  const cache = loadScanCache(cachePath);
  const alreadyChecked = events.filter((event) =>
    Boolean(cache.events[event.event_id])
  ).length;
  const exists = fs.existsSync(cachePath);
  const updatedAt =
    cache.updated_at ||
    (exists ? fs.statSync(cachePath).mtime.toISOString() : null);
  return {
    enabled: true,
    refreshed: false,
    alreadyChecked,
    eventsInCache: Object.keys(cache.events).length,
    sizeBytes: exists ? fs.statSync(cachePath).size : 0,
    updatedAt,
  };
}

function localTimestamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return String(value ?? '');
  }

  const pad = (number) => String(number).padStart(2, '0');
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffset = Math.abs(offsetMinutes);
  const offset = `${sign}${pad(Math.floor(absoluteOffset / 60))}:${pad(
    absoluteOffset % 60
  )}`;

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}${offset}`;
}

function formatCacheTimestamp(value) {
  if (!value) {
    return 'never';
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createScanCache(cachePath, options = {}) {
  const enabled = options.enabled !== false;
  const refresh = Boolean(options.refresh);
  const cache = enabled
    ? refresh
      ? emptyScanCache()
      : loadScanCache(cachePath)
    : emptyScanCache();
  let timer = null;
  let dirty = enabled && refresh;

  const saveNow = () => {
    if (!enabled || !dirty) {
      return;
    }
    dirty = false;
    cache.updated_at = new Date().toISOString();
    try {
      saveCache(cachePath, cache);
    } catch (error) {
      console.error(`Unable to write cache ${cachePath}: ${error.message}`);
    }
  };

  const scheduleSave = () => {
    if (!enabled) {
      return;
    }
    dirty = true;
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      timer = null;
      saveNow();
    }, 500);
    timer.unref();
  };

  return {
    cache,
    dates: cache.dates,
    get(eventId) {
      return enabled ? cache.events[eventId] || null : null;
    },
    set(eventId, result) {
      if (!enabled) {
        return null;
      }
      const entry = {
        ...result,
        checked_at: new Date().toISOString(),
      };
      cache.events[eventId] = entry;
      scheduleSave();
      return entry;
    },
    flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      saveNow();
    },
  };
}

async function scanEvents(events, options = {}, deps = {}) {
  const cache = createScanCache(options.cachePath || DEFAULT_CACHE, {
    enabled: options.useCache !== false,
    refresh: options.refreshCache === true,
  });
  const inspector =
    deps.inspector || createInspector({ cache: cache.dates });
  const results = new Array(events.length);
  const today = options.today || localIsoDate();

  try {
    await runPool(
      events,
      async (event, index) => {
        const cached = cache.get(event.event_id);
        let result;

        if (cached) {
          result = {
            event_id: event.event_id,
            event_name: event.name,
            event_date: event.event_date,
            event_url: event.event_url,
            candidates: cached.candidates || [],
            best: cached.best || null,
            verified: Boolean(cached.verified),
            manual: Boolean(cached.manual),
            updated: localTimestamp(cached.checked_at || new Date()),
            from_cache: true,
          };
        } else {
          const discovered = await discoverRecordings(event, {
            ...deps,
            inspector,
            today,
            minScore: options.minScore,
          });
          result = {
            event_id: event.event_id,
            event_name: event.name,
            event_date: event.event_date,
            event_url: event.event_url,
            ...discovered,
            from_cache: false,
          };
          const entry = cache.set(event.event_id, {
            candidates: discovered.candidates,
            best: discovered.best,
            verified: discovered.verified,
            manual: discovered.manual,
          });
          result.updated = localTimestamp(
            (entry && entry.checked_at) || new Date()
          );
        }

        results[index] = result;
        if (options.onResult) {
          options.onResult(result, index);
        }
        if (options.onProgress) {
          options.onProgress(index + 1, events.length);
        }
      },
      options.workers || DEFAULT_WORKERS
    );
  } finally {
    cache.flush();
    if (inspector.flush) {
      inspector.flush();
    }
  }

  return results;
}

function addRecordingsToMetadata(content, urlByEventId) {
  const lines = String(content).split(/\r?\n/);
  let written = 0;

  const output = lines.map((line) => {
    const { eventId, fields } = splitMetadataLine(line);
    if (!urlByEventId.has(eventId)) {
      return line;
    }

    const alreadyRecorded = fields.some((field) => {
      const separatorIndex = field.indexOf(':');
      return (
        separatorIndex !== -1 &&
        field.slice(0, separatorIndex).trim() === 'recording' &&
        parseRecordings(field.slice(separatorIndex + 1).trim()).length > 0
      );
    });
    if (alreadyRecorded) {
      return line;
    }

    const url = urlByEventId.get(eventId);
    if (!/^https?:\/\/[^,\s|]+$/.test(url)) {
      return line;
    }

    written += 1;
    return `${line},recording:${url}`;
  });

  return { content: output.join('\n'), written };
}

function writeMetadata(pathName, content) {
  const temporaryPath = `${pathName}.tmp-${process.pid}`;
  fs.writeFileSync(temporaryPath, content, 'utf8');
  fs.renameSync(temporaryPath, pathName);
}

function reportRows(results) {
  return results.map((result) => {
    const best = result.best;
    if (!best) {
      return {
        status: 'NONE',
        event_id: result.event_id,
        event_date: result.event_date,
        event_name: result.event_name,
        score: '',
        verdict: '',
        kind: '',
        sources: '',
        latest_upload: '',
        url: '',
        title: '',
        channel: '',
        event_url: result.event_url,
        from_cache: result.from_cache,
      };
    }

    const status = best.accepted
      ? 'FOUND'
      : best.kind === 'page'
        ? 'MANUAL'
        : 'REVIEW';
    return {
      status,
      event_id: result.event_id,
      event_date: result.event_date,
      event_name: result.event_name,
      score: best.score,
      verdict: best.verdict,
      kind: best.kind,
      sources: best.sources.join(','),
      latest_upload: best.latest_upload,
      url: best.url,
      title: best.title,
      channel: best.channel,
      event_url: result.event_url,
      from_cache: result.from_cache,
    };
  });
}

function escapeMarkdown(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdownUrl(url) {
  return String(url).replace(/\)/g, '%29').replace(/\s/g, '%20');
}

function markdownLink(label, url) {
  return `[${escapeMarkdown(escapeHtml(label))}](${markdownUrl(url)})`;
}

function eventCell(result) {
  if (!result.event_url) {
    return escapeMarkdown(escapeHtml(result.event_name));
  }
  return markdownLink(result.event_name, result.event_url);
}

function candidateItem(candidate, status) {
  const label = candidate.title || candidate.channel || 'Recording';
  const link = markdownLink(label, candidate.url);
  const latest =
    candidate.latest_upload && candidate.latest_upload !== '-'
      ? `, latest upload ${candidate.latest_upload}`
      : '';

  if (status === 'FOUND') {
    return `${link}${latest}`;
  }
  if (status === 'MANUAL') {
    return link;
  }
  return `${link} — ${candidate.verdict}${latest}`;
}

function recordingItems(result) {
  if (!result.best) {
    return [];
  }

  const accepted = (result.candidates || []).filter(
    (candidate) => candidate.accepted
  );
  const selected =
    result.status === 'FOUND' && accepted.length
      ? accepted
      : [result.best];
  return selected.map((candidate) => candidateItem(candidate, result.status));
}

function recordingCell(result) {
  const items = recordingItems(result);
  if (!items.length) {
    return '—';
  }
  if (items.length === 1) {
    return items[0];
  }
  return items.map((item) => `• ${item}`).join('<br>');
}

function markdownReport(results, summary, options = {}) {
  const rows = results.map((result) => {
    const status = result.best
      ? result.best.accepted
        ? 'FOUND'
        : result.best.kind === 'page'
          ? 'MANUAL'
          : 'REVIEW'
      : 'NONE';
    return {
      ...result,
      status,
    };
  });

  const lines = [
    '# Recording scan',
    '',
    `Generated: ${localTimestamp(options.generatedAt || new Date())}`,
    `Event date: ${options.today || localIsoDate()}`,
    '',
    `Missing recordings: ${summary.missing_total} of ${options.eventCount ?? '?'} events.`,
    `Scanned: ${summary.scanned} of ${summary.matching} matching events.`,
    `Found and verified: ${summary.verified}. Manual: ${summary.manual}. Review: ${
      summary.with_candidates - summary.verified - summary.manual
    }. No candidate: ${summary.no_candidate}.`,
  ];

  if (summary.written) {
    lines.push(`Added to METADATA.csv: ${summary.written}.`);
  }

  lines.push(
    '',
    '| Date | Event | Recordings | Status |',
    '|---|---|---|---|',
    ...rows.map(
      (result) =>
        `| ${escapeMarkdown(result.event_date || '')} | ${eventCell(
          result
        )} | ${recordingCell(result)} | ${result.status} |`
    ),
    ''
  );

  return lines.join('\n');
}

function buildReportState(results, context) {
  const complete = results.filter(Boolean);
  const rows = reportRows(complete);
  const withCandidates = complete.filter((result) => result.best).length;
  const written = context.written || 0;
  const summary = {
    total_events: context.stats.total,
    filtered: context.stats.matching,
    recorded: context.stats.recorded,
    future_skipped: context.stats.futureSkipped,
    to_check: context.stats.toCheck,
    scanned: complete.length,
    cache_reused: complete.filter((result) => result.from_cache).length,
    cache_size_bytes: context.cacheStats.sizeBytes,
    cache_last_updated: context.cacheStats.updatedAt
      ? localTimestamp(context.cacheStats.updatedAt)
      : null,
    missing_total: context.missingTotal,
    matching: context.selected.length,
    with_candidates: withCandidates,
    verified: complete.filter((result) => result.verified).length,
    manual: complete.filter((result) => result.manual).length,
    no_candidate: complete.length - withCandidates,
    written,
  };
  const rowByEvent = new Map(rows.map((row) => [row.event_id, row]));
  const report = {
    generated_at: localTimestamp(),
    events_file: context.eventsFile,
    metadata_file: context.metadataFile,
    today: context.today,
    summary,
    results: complete.map((result) => ({
      ...result,
      updated: result.updated || localTimestamp(),
      status: rowByEvent.get(result.event_id).status,
    })),
  };

  return { complete, rows, summary, report };
}

function writeTextAtomic(pathName, content) {
  fs.mkdirSync(path.dirname(pathName), { recursive: true });
  const temporaryPath = `${pathName}.tmp-${process.pid}`;
  fs.writeFileSync(temporaryPath, content, 'utf8');
  fs.renameSync(temporaryPath, pathName);
}

function writeReportFiles(paths, state) {
  writeTextAtomic(
    paths.out,
    `${JSON.stringify(state.report, null, 2)}\n`
  );
  writeTextAtomic(paths.tsv, reportToTsv(state.rows));
  writeTextAtomic(
    paths.md,
    markdownReport(state.complete, state.summary, {
      today: paths.today,
      eventCount: paths.eventCount,
      generatedAt: state.report.generated_at,
    })
  );
}

function createReportWriter(options) {
  const results = options.results;
  const context = options.context;
  const paths = options.paths;
  const throttleMs = options.throttleMs ?? 1000;
  let timer = null;
  let dirty = false;
  let lastState = null;

  const writeNow = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    dirty = false;
    const state = buildReportState(results, context);
    writeReportFiles(paths, state);
    lastState = state;
    return state;
  };

  const schedule = () => {
    dirty = true;
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      timer = null;
      if (!dirty) {
        return;
      }
      try {
        writeNow();
      } catch (error) {
        console.error(`Unable to write reports: ${error.message}`);
      }
    }, throttleMs);
    timer.unref();
  };

  return {
    schedule,
    setWritten(value) {
      context.written = value;
      dirty = true;
    },
    flush() {
      try {
        return writeNow();
      } catch (error) {
        console.error(`Unable to write reports: ${error.message}`);
        return lastState;
      }
    },
    getState() {
      return lastState;
    },
  };
}

function formatProgress(done, total, width = 30) {
  const ratio = total ? done / total : 1;
  const filled = Math.min(width, Math.round(width * ratio));
  const bar = `${'#'.repeat(filled)}${'-'.repeat(width - filled)}`;
  return `Scanning [${bar}] ${done}/${total} (${Math.floor(ratio * 100)}%)`;
}

function createProgressReporter(stream = process.stderr, options = {}) {
  const width = options.width || 30;
  const interactive =
    options.interactive ?? Boolean(stream.isTTY);
  let lastLength = 0;
  let lastMilestone = -1;

  return {
    update(done, total) {
      const line = formatProgress(done, total, width);

      if (interactive) {
        const padding = ' '.repeat(Math.max(0, lastLength - line.length));
        stream.write(`\r${line}${padding}`);
        lastLength = line.length;
        return;
      }

      const step = Math.max(1, Math.floor(total / 10));
      const milestone = Math.floor(done / step);
      if (done === 0 || done === total || milestone !== lastMilestone) {
        stream.write(`${line}\n`);
        lastMilestone = milestone;
      }
    },
    finish() {
      if (interactive && lastLength) {
        stream.write('\n');
        lastLength = 0;
      }
    },
  };
}

function reportToTsv(rows) {
  const header = [
    'status',
    'event_id',
    'event_date',
    'event_name',
    'score',
    'verdict',
    'kind',
    'sources',
    'latest_upload',
    'url',
    'title',
    'channel',
    'event_url',
    'from_cache',
  ];

  const escape = (value) => {
    const text = value == null ? '' : String(value);
    return /[\t\r\n"]/.test(text)
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  };

  return `${[header, ...rows.map((row) => header.map((key) => row[key]))]
    .map((row) => row.map(escape).join('\t'))
    .join('\n')}\n`;
}

function latestEventSourceMtime() {
  const sources = [path.join(ROOT, 'README.md')];
  const archiveDirectory = path.join(ROOT, 'archives');

  if (fs.existsSync(archiveDirectory)) {
    for (const name of fs.readdirSync(archiveDirectory)) {
      if (name.endsWith('.md')) {
        sources.push(path.join(archiveDirectory, name));
      }
    }
  }

  return Math.max(
    ...sources
      .filter((source) => fs.existsSync(source))
      .map((source) => fs.statSync(source).mtimeMs),
    0
  );
}

function ensureEventsFile(eventsPath, refresh = false) {
  if (path.resolve(eventsPath) !== path.resolve(DEFAULT_EVENTS)) {
    if (!fs.existsSync(eventsPath)) {
      throw new Error(`events file not found: ${eventsPath}`);
    }
    return;
  }

  const exists = fs.existsSync(eventsPath);
  const stale =
    !exists ||
    refresh ||
    fs.statSync(eventsPath).mtimeMs < latestEventSourceMtime();
  if (!stale) {
    return;
  }

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, 'mdParser.js')],
    {
      cwd: __dirname,
      stdio: 'inherit',
    }
  );
  if (result.status !== 0) {
    throw new Error('unable to generate page/src/misc/all-events.json');
  }
}

function parseCli(argv = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: false,
    options: {
      events: { type: 'string', default: DEFAULT_EVENTS },
      metadata: { type: 'string', default: DEFAULT_METADATA },
      today: { type: 'string', default: localIsoDate() },
      since: { type: 'string' },
      year: { type: 'string', multiple: true },
      event: { type: 'string' },
      limit: { type: 'string' },
      workers: { type: 'string', default: String(DEFAULT_WORKERS) },
      'min-score': { type: 'string', default: String(DEFAULT_MIN_SCORE) },
      'include-future': { type: 'boolean', default: false },
      refresh: { type: 'boolean', default: false },
      'no-cache': { type: 'boolean', default: false },
      'refresh-cache': { type: 'boolean', default: false },
      out: { type: 'string', default: DEFAULT_JSON },
      tsv: { type: 'string', default: DEFAULT_TSV },
      md: { type: 'string', default: DEFAULT_MD },
      write: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  if (positionals.length) {
    throw new Error('this command does not accept positional arguments');
  }
  if (!isValidIsoDate(values.today)) {
    throw new Error('--today must use YYYY-MM-DD');
  }

  const workers = Number(values.workers);
  if (!Number.isInteger(workers) || workers < 1) {
    throw new Error('--workers must be a positive integer');
  }

  const minScore = Number(values['min-score']);
  if (!Number.isFinite(minScore) || minScore < 0) {
    throw new Error('--min-score must be a non-negative number');
  }

  if (values['no-cache'] && values['refresh-cache']) {
    throw new Error('--no-cache and --refresh-cache cannot be used together');
  }

  const since =
    values.since === undefined ? null : Number(values.since);
  if (since !== null && (!Number.isInteger(since) || since < 1900)) {
    throw new Error('--since must be a four-digit year');
  }

  const years = (values.year || []).flatMap((value) =>
    value.split(',').map((item) => Number(item.trim()))
  );
  if (years.some((year) => !Number.isInteger(year) || year < 1900)) {
    throw new Error('--year must be one or more four-digit years');
  }

  const limit = values.limit === undefined ? null : Number(values.limit);
  if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
    throw new Error('--limit must be a positive integer');
  }

  return {
    events: path.resolve(values.events),
    metadata: path.resolve(values.metadata),
    today: values.today,
    since,
    years,
    eventFilter: values.event || '',
    limit,
    workers,
    minScore,
    includeFuture: values['include-future'],
    refresh: values.refresh,
    noCache: values['no-cache'],
    refreshCache: values['refresh-cache'],
    out: path.resolve(values.out),
    tsv: path.resolve(values.tsv),
    md: path.resolve(values.md),
    write: values.write,
    help: values.help,
  };
}

function usage() {
  return `Usage: node tools/recordingScanner.js [options]

Scans README.md + archives/YYYY.md through page/src/misc/all-events.json.
Missing recordings are cross-checked against METADATA.csv.

Find candidates:
  --since YYYY        only events from this year onward
  --year YYYY[,YYYY]  only these event years
  --event TEXT        only events whose name or location contains TEXT
  --limit N           stop after N matching events
  --include-future    include events that have not happened yet
  --workers N         parallel event scans (default ${DEFAULT_WORKERS})
  --min-score N       minimum candidate score (default ${DEFAULT_MIN_SCORE})

Cache:
  --no-cache          do not read or write the cache
  --refresh-cache     clear the cache and rebuild it for this scan

Inputs and output:
  --events PATH       event JSON (default page/src/misc/all-events.json)
  --metadata PATH     metadata CSV (default METADATA.csv)
  --today YYYY-MM-DD  date used for future/event checks
  --refresh           force regeneration of all-events.json
  --out PATH          JSON report (default tmp/recording-scan.json)
  --tsv PATH          TSV report (default tmp/recording-scan.tsv)
  --md PATH           readable report (default tmp/recording-scan.md)
  --write             add verified YouTube recordings to METADATA.csv
  -h, --help          show this help

The scanner reports candidates by default. --write adds only the best candidate
for each FOUND event: a YouTube playlist or video whose newest upload is after
the event date, or an accepted same-day recording. Official recording pages are
reported as MANUAL candidates.`;
}

async function main(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseCli(argv);
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  if (args.help) {
    console.log(usage());
    return;
  }

  try {
    ensureEventsFile(args.events, args.refresh);
    const events = JSON.parse(fs.readFileSync(args.events, 'utf8'));
    const metadataContent = fs.readFileSync(args.metadata, 'utf8');
    const metadataRecordings = readMetadataRecordings(metadataContent);
    const { missing, selected, stats } = selectMissingEvents(
      events,
      metadataRecordings,
      {
        today: args.today,
        since: args.since,
        years: args.years,
        eventFilter: args.eventFilter,
        includeFuture: args.includeFuture,
      }
    );
    const scanList = args.limit ? selected.slice(0, args.limit) : selected;

    process.stderr.write(
      `Events matching filters: ${stats.matching}\n`
    );
    process.stderr.write(
      `Events with recordings: ${stats.recorded}\n`
    );
    process.stderr.write(
      `Future events skipped: ${stats.futureSkipped}\n`
    );
    process.stderr.write(
      args.includeFuture
        ? `Events to check: ${stats.matching} - ${stats.recorded} = ${stats.toCheck}\n`
        : `Events to check: ${stats.matching} - ${stats.recorded} - ${stats.futureSkipped} = ${stats.toCheck}\n`
    );
    if (scanList.length < selected.length) {
      process.stderr.write(
        `Scanning: ${scanList.length} of ${selected.length} (limited)\n`
      );
    } else {
      process.stderr.write(`Scanning: ${selected.length}\n`);
    }

    const cacheStats = getCacheStats(DEFAULT_CACHE, scanList, {
      disabled: args.noCache,
      refresh: args.refreshCache,
    });
    if (!cacheStats.enabled) {
      process.stderr.write('Cache: disabled\n');
    } else {
      if (cacheStats.refreshed) {
        process.stderr.write('Cache: refresh\n');
      }
      process.stderr.write(
        `Already checked: ${cacheStats.alreadyChecked}\n`
      );
      process.stderr.write(
        `Events in cache: ${cacheStats.eventsInCache}\n`
      );
      process.stderr.write(
        `Cache size: ${formatBytes(cacheStats.sizeBytes)}\n`
      );
      process.stderr.write(
        `Cache last updated: ${
          cacheStats.refreshed
            ? 'updating...'
            : formatCacheTimestamp(cacheStats.updatedAt)
        }\n`
      );
      process.stderr.write(
        'Cache will update as events are checked.\n'
      );
    }

    const progress = createProgressReporter(process.stderr);
    if (scanList.length) {
      progress.update(0, scanList.length);
    }

    const partialResults = new Array(scanList.length);
    const reportWriter = createReportWriter({
      results: partialResults,
      context: {
        stats,
        missingTotal: missing.length,
        selected,
        cacheStats,
        eventsFile: args.events,
        metadataFile: args.metadata,
        today: args.today,
        written: 0,
      },
      paths: {
        out: args.out,
        tsv: args.tsv,
        md: args.md,
        today: args.today,
        eventCount: events.length,
      },
      throttleMs: 1000,
    });
    reportWriter.flush();

    const interrupt = () => {
      reportWriter.flush();
      progress.finish();
      process.stderr.write(
        '\nInterrupted. Partial reports were written.\n'
      );
      process.exit(130);
    };
    process.once('SIGINT', interrupt);

    let results;
    try {
      results = await scanEvents(
        scanList,
        {
          today: args.today,
          workers: args.workers,
          minScore: args.minScore,
          useCache: !args.noCache,
          refreshCache: args.refreshCache,
          onProgress: progress.update,
          onResult: (result, index) => {
            partialResults[index] = result;
            reportWriter.schedule();
          },
        },
        {
          httpGet,
          runYtDlp,
        }
      );
    } catch (error) {
      reportWriter.flush();
      throw error;
    } finally {
      progress.finish();
      process.removeListener('SIGINT', interrupt);
    }

    let written = 0;
    if (args.write) {
      const urls = new Map();
      for (const result of results) {
        if (result.best && result.best.writable) {
          urls.set(result.event_id, result.best.url);
        }
      }
      const updated = addRecordingsToMetadata(metadataContent, urls);
      if (updated.written) {
        writeMetadata(args.metadata, updated.content);
      }
      written = updated.written;
    }

    reportWriter.setWritten(written);
    const finalState = reportWriter.flush();
    const summary = finalState
      ? finalState.summary
      : {
          scanned: results.length,
          written,
        };

    console.log(JSON.stringify(summary, null, 2));
    process.stderr.write(`report: ${args.out}\n`);
    process.stderr.write(`tsv: ${args.tsv}\n`);
    process.stderr.write(`markdown: ${args.md}\n`);
  } catch (error) {
    console.error(error.message || String(error));
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || String(error));
    process.exitCode = 1;
  });
}

module.exports = {
  addRecordingsToMetadata,
  buildReportState,
  canonicalYoutubeUrl,
  createProgressReporter,
  createReportWriter,
  createScanCache,
  getCacheStats,
  discoverChannelPlaylists,
  discoverFromOfficialSite,
  discoverRecordings,
  extractRecordingLinks,
  extractYears,
  extractYouTubeUrls,
  formatBytes,
  formatCacheTimestamp,
  formatProgress,
  localTimestamp,
  makeCandidate,
  markdownReport,
  mergeCandidates,
  normalizeText,
  parseCli,
  rankCandidates,
  readMetadataRecordings,
  reportRows,
  reportToTsv,
  scanEvents,
  scoreCandidate,
  searchYoutube,
  selectMissingEvents,
  tokenize,
  usage,
  verifyCandidates,
  writeMetadata,
};
