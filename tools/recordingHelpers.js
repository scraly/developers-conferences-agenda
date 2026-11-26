/**
 * Shared helpers for recording discovery and date verification.
 *
 * recordingScanner.js is the only user-facing recording command. These helpers
 * keep the network, RSS, yt-dlp, cache, and date-classification logic in one
 * place.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

class YtDlpNotFoundError extends Error {
  constructor() {
    super('yt-dlp not found; install it first (e.g. brew install yt-dlp)');
    this.name = 'YtDlpNotFoundError';
  }
}

function localIsoDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseEventDate(eventId) {
  const match = /^(\d{4})-(\d{2})-(\d{2})-/.exec(eventId);
  if (!match) {
    return null;
  }
  const isoDate = `${match[1]}-${match[2]}-${match[3]}`;
  return isValidIsoDate(isoDate) ? isoDate : null;
}

function listTarget(url) {
  if (
    url.includes('/playlist?') ||
    url.includes('/watch?') ||
    url.includes('youtu.be/')
  ) {
    return url;
  }
  return `${url.replace(/\/+$/, '')}/videos`;
}

/**
 * Run yt-dlp and return stdout. Failures and timeouts return an empty string,
 * except for a missing executable, which is fatal for the audit.
 */
function runYtDlp(args, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'yt-dlp',
      ['--no-warnings', '--ignore-errors', ...args],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    let stdout = '';
    let settled = false;
    let timedOut = false;
    let timer = null;

    const finish = (value, error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    };

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', () => {});

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        finish('', new YtDlpNotFoundError());
      } else {
        finish('');
      }
    });

    child.on('close', () => {
      finish(timedOut ? '' : stdout);
    });

    timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeout);
    timer.unref();
  });
}

async function flatIds(url, limit, deps = {}) {
  const run = deps.runYtDlp || runYtDlp;
  const output = await run([
    '--flat-playlist',
    '--playlist-end',
    String(limit),
    '--print',
    '%(id)s\t%(title)s',
    listTarget(url),
  ]);

  const ids = [];
  for (const line of output.split(/\r?\n/)) {
    const separatorIndex = line.indexOf('\t');
    if (separatorIndex === -1) {
      continue;
    }
    const id = line.slice(0, separatorIndex);
    const title = line.slice(separatorIndex + 1);
    if (/^[\w-]{11}$/.test(id)) {
      ids.push([id, title]);
    }
  }
  return ids;
}

async function videoDate(videoId, deps = {}) {
  const run = deps.runYtDlp || runYtDlp;
  const output = await run(
    [
      '--skip-download',
      '--print',
      '%(upload_date)s\t%(title)s',
      `https://www.youtube.com/watch?v=${videoId}`,
    ],
    90000
  );

  for (const line of output.split(/\r?\n/)) {
    const separatorIndex = line.indexOf('\t');
    const head = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    if (/^\d{8}$/.test(head)) {
      return {
        id: videoId,
        date: head,
        title: separatorIndex === -1 ? '' : line.slice(separatorIndex + 1),
      };
    }
  }
  return null;
}

async function sampleDates(url, count = 3, deps = {}) {
  if (url.includes('/watch?') || url.includes('youtu.be/')) {
    const match = /(?:v=|youtu\.be\/)([\w-]{11})/.exec(url);
    const found = match ? await videoDate(match[1], deps) : null;
    return found ? [found] : [];
  }

  const dates = [];
  const ids = (await flatIds(url, count, deps)).slice(0, count);
  for (const [videoId] of ids) {
    const found = await videoDate(videoId, deps);
    if (found) {
      dates.push(found);
    }
  }
  return dates;
}

async function httpGet(url, timeout = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  timer.unref();

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) {
      return '';
    }
    return await response.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function feedDates(xml, limit = 15) {
  const found = [];
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];

  for (const entry of entries.slice(0, limit)) {
    const videoId = /<yt:videoId>([^<]+)/.exec(entry);
    const published = /<published>(\d{4})-(\d{2})-(\d{2})/.exec(entry);
    const title = /<title>([^<]*)/.exec(entry);

    if (videoId && published) {
      found.push({
        id: videoId[1],
        date: `${published[1]}${published[2]}${published[3]}`,
        title: title ? title[1] : '',
      });
    }
  }

  return found;
}

async function resolveChannelId(url, deps = {}) {
  const channelMatch = /\/channel\/(UC[\w-]{20,})/.exec(url);
  if (channelMatch) {
    return channelMatch[1];
  }

  const get = deps.httpGet || httpGet;
  const html = await get(url);
  const htmlMatch = /itemprop="identifier" content="(UC[\w-]{20,})"/.exec(html);
  if (htmlMatch) {
    return htmlMatch[1];
  }

  const run = deps.runYtDlp || runYtDlp;
  const output = await run(
    [
      '--flat-playlist',
      '--playlist-end',
      '1',
      '--print',
      '%(channel_id)s',
      listTarget(url),
    ],
    60000
  );
  for (const line of output.split(/\r?\n/)) {
    const candidate = line.trim();
    if (/^UC[\w-]{20,}$/.test(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function channelRss(url, deps = {}) {
  const channelId = await resolveChannelId(url, deps);
  if (!channelId) {
    return null;
  }
  const get = deps.httpGet || httpGet;
  const xml = await get(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  );
  const dates = feedDates(xml);
  return dates.length ? dates : null;
}

async function playlistRss(url, deps = {}) {
  const match = /[?&]list=([\w-]+)/.exec(url);
  if (!match) {
    return null;
  }
  const get = deps.httpGet || httpGet;
  const xml = await get(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${match[1]}`
  );
  const dates = feedDates(xml);
  return dates.length ? dates : null;
}

function loadCache(cachePath) {
  if (!cachePath || !fs.existsSync(cachePath)) {
    return {};
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function saveCache(cachePath, cache) {
  if (!cachePath) {
    return;
  }
  fs.mkdirSync(path.dirname(cachePath) || '.', { recursive: true });
  const temporaryPath = `${cachePath}.tmp-${process.pid}`;
  fs.writeFileSync(temporaryPath, JSON.stringify(cache, null, 1));
  fs.renameSync(temporaryPath, cachePath);
}

function createInspector(options = {}) {
  const cachePath = options.cachePath || null;
  const cache = options.cache || (cachePath ? loadCache(cachePath) : {});
  const deps = options.deps || {};
  const saveDelay = options.saveDelay ?? 500;
  let saveTimer = null;
  let dirty = false;

  const saveNow = () => {
    if (!dirty) {
      return;
    }
    dirty = false;
    try {
      saveCache(cachePath, cache);
    } catch (error) {
      console.error(`Unable to write cache ${cachePath}: ${error.message}`);
    }
  };

  const scheduleSave = () => {
    if (!cachePath) {
      return;
    }
    dirty = true;
    if (saveTimer) {
      return;
    }
    saveTimer = setTimeout(() => {
      saveTimer = null;
      saveNow();
    }, saveDelay);
    saveTimer.unref();
  };

  const inspect = async (url, count, force = false) => {
    if (!force && cache[url]) {
      return cache[url];
    }

    let dates = null;
    if (url.includes('/playlist?')) {
      dates = await playlistRss(url, deps);
    } else if (url.includes('/watch?') || url.includes('youtu.be/')) {
      dates = null;
    } else {
      dates = await channelRss(url, deps);
    }

    if (dates === null) {
      dates = await sampleDates(url, count, deps);
    }

    const record = {
      url,
      samples: dates,
      error: dates.length ? null : 'no items/dates',
    };
    cache[url] = record;
    scheduleSave();
    return record;
  };

  return {
    cache,
    inspect,
    saveNow,
    flush: () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      saveNow();
    },
  };
}

function classify(record, eventDate, today) {
  const dates = (record.samples || [])
    .map((sample) => sample.date)
    .filter((date) => /^\d{8}$/.test(date || ''));

  let latest = null;
  if (dates.length) {
    const raw = dates.sort().at(-1);
    latest = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}`;
  }

  if (!eventDate) {
    return ['NO_DATE', latest || '-'];
  }
  if (eventDate > today) {
    return ['FUTURE', latest || '-'];
  }
  if (!latest) {
    return ['NO_DATA', '-'];
  }
  if (latest > eventDate) {
    return ['OK', latest];
  }
  if (latest === eventDate) {
    return ['SAME_DAY', latest];
  }
  return ['STALE', latest];
}

async function runPool(items, worker, concurrency, onDone) {
  let nextIndex = 0;
  let completed = 0;
  let failure = null;

  const runWorker = async () => {
    while (!failure) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) {
        return;
      }

      try {
        await worker(items[index], index);
        completed += 1;
        if (onDone) {
          onDone(completed, items.length);
        }
      } catch (error) {
        failure = error;
      }
    }
  };

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, runWorker));

  if (failure) {
    throw failure;
  }
}

module.exports = {
  YtDlpNotFoundError,
  channelRss,
  classify,
  createInspector,
  feedDates,
  flatIds,
  httpGet,
  isValidIsoDate,
  listTarget,
  loadCache,
  localIsoDate,
  parseEventDate,
  playlistRss,
  resolveChannelId,
  runPool,
  runYtDlp,
  sampleDates,
  saveCache,
  videoDate,
};
