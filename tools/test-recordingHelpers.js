const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  YtDlpNotFoundError,
  classify,
  createInspector,
  feedDates,
  isValidIsoDate,
  listTarget,
  loadCache,
  parseEventDate,
  runPool,
  saveCache,
} = require('./recordingHelpers');

test('parses valid event dates from ids', () => {
  assert.equal(parseEventDate('2026-11-25-Event'), '2026-11-25');
  assert.equal(parseEventDate('2026-02-29-Event'), null);
  assert.equal(parseEventDate('no-date-Event'), null);
  assert.equal(parseEventDate('2026-1-01-Event'), null);
});

test('validates ISO dates', () => {
  assert.equal(isValidIsoDate('2026-11-25'), true);
  assert.equal(isValidIsoDate('2024-02-29'), true);
  assert.equal(isValidIsoDate('2026-02-29'), false);
  assert.equal(isValidIsoDate('2026-13-01'), false);
  assert.equal(isValidIsoDate('25-11-2026'), false);
});

test('builds the newest-first listing target', () => {
  assert.equal(
    listTarget('https://www.youtube.com/@HANDLE/'),
    'https://www.youtube.com/@HANDLE/videos'
  );
  assert.equal(
    listTarget('https://www.youtube.com/playlist?list=PL123'),
    'https://www.youtube.com/playlist?list=PL123'
  );
  assert.equal(
    listTarget('https://www.youtube.com/watch?v=AAAAAAAAAAA'),
    'https://www.youtube.com/watch?v=AAAAAAAAAAA'
  );
  assert.equal(listTarget('https://youtu.be/AAAAAAAAAAA'), 'https://youtu.be/AAAAAAAAAAA');
});

test('parses dates and titles from a YouTube feed', () => {
  const xml = `<feed>
    <entry>
      <yt:videoId>AAAAAAAAAAA</yt:videoId>
      <title>Day 1 &amp; keynote</title>
      <published>2026-11-20T10:00:00+00:00</published>
    </entry>
    <entry>
      <yt:videoId>BBBBBBBBBBB</yt:videoId>
      <title>Closing</title>
      <published>2026-11-21T11:00:00+00:00</published>
    </entry>
  </feed>`;

  assert.deepEqual(feedDates(xml), [
    {
      id: 'AAAAAAAAAAA',
      date: '20261120',
      title: 'Day 1 &amp; keynote',
    },
    {
      id: 'BBBBBBBBBBB',
      date: '20261121',
      title: 'Closing',
    },
  ]);
});

test('limits feed entries before parsing', () => {
  const entry = (id, date) => `<entry><yt:videoId>${id}</yt:videoId><title>T</title><published>${date}T00:00:00Z</published></entry>`;
  const xml = `<feed>${entry('AAAAAAAAAAA', '2026-11-20')}${entry('BBBBBBBBBBB', '2026-11-21')}</feed>`;

  assert.deepEqual(feedDates(xml, 1).map((row) => row.id), ['AAAAAAAAAAA']);
});

test('classifies every audit verdict', () => {
  const today = '2026-11-25';
  const record = { samples: [{ date: '20260615' }] };

  assert.deepEqual(classify(record, '2026-06-01', today), [
    'OK',
    '2026-06-15',
  ]);
  assert.deepEqual(classify(record, '2026-06-15', today), [
    'SAME_DAY',
    '2026-06-15',
  ]);
  assert.deepEqual(classify(record, '2026-06-20', today), [
    'STALE',
    '2026-06-15',
  ]);
  assert.deepEqual(classify({ samples: [] }, '2026-06-01', today), [
    'NO_DATA',
    '-',
  ]);
  assert.deepEqual(classify(record, '2026-12-01', today), [
    'FUTURE',
    '2026-06-15',
  ]);
  assert.deepEqual(classify(record, null, today), ['NO_DATE', '2026-06-15']);
});

test('takes the maximum valid upload date', () => {
  assert.deepEqual(
    classify(
      {
        samples: [
          { date: '20240101' },
          { date: 'invalid' },
          { date: '20261231' },
        ],
      },
      '2026-01-01',
      '2027-01-01'
    ),
    ['OK', '2026-12-31']
  );
});

test('saves and loads caches atomically', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'recording-cache-'));
  const cachePath = path.join(directory, 'cache.json');

  try {
    assert.deepEqual(loadCache(cachePath), {});
    saveCache(cachePath, {
      'https://youtu.be/AAAAAAAAAAA': {
        samples: [{ id: 'AAAAAAAAAAA', date: '20261120', title: 'Talk' }],
      },
    });
    assert.equal(
      loadCache(cachePath)['https://youtu.be/AAAAAAAAAAA'].samples[0].date,
      '20261120'
    );

    fs.writeFileSync(cachePath, '{not json');
    assert.deepEqual(loadCache(cachePath), {});
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('inspects playlists through RSS and reuses the cache', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'recording-audit-'));
  const cachePath = path.join(directory, 'cache.json');
  let requests = 0;

  const inspector = createInspector({
    cachePath,
    saveDelay: 0,
    deps: {
      httpGet: async () => {
        requests += 1;
        return '<feed><entry><yt:videoId>AAAAAAAAAAA</yt:videoId><title>Talk</title><published>2026-11-20T00:00:00Z</published></entry></feed>';
      },
    },
  });

  try {
    const url = 'https://www.youtube.com/playlist?list=PL123';
    const first = await inspector.inspect(url, 3);
    const second = await inspector.inspect(url, 3);

    assert.equal(requests, 1);
    assert.deepEqual(first, second);
    assert.equal(first.samples[0].date, '20261120');
    assert.equal(first.error, null);

    inspector.flush();
    assert.equal(
      loadCache(cachePath)[url].samples[0].date,
      '20261120'
    );
  } finally {
    inspector.flush();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('uses an in-memory cache without writing a file', async () => {
  let requests = 0;
  const url = 'https://www.youtube.com/playlist?list=PL123';
  const cache = {
    [url]: {
      samples: [{ id: 'AAAAAAAAAAA', date: '20261120', title: 'Talk' }],
      error: null,
    },
  };
  const inspector = createInspector({
    cache,
    deps: {
      httpGet: async () => {
        requests += 1;
        return '';
      },
    },
  });

  const record = await inspector.inspect(url, 3);
  assert.equal(requests, 0);
  assert.equal(record.samples[0].date, '20261120');
});

test('reports empty playlist feeds as no data', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'recording-audit-'));
  const inspector = createInspector({
    cachePath: path.join(directory, 'cache.json'),
    saveDelay: 0,
    deps: {
      httpGet: async () => '<feed></feed>',
      runYtDlp: async () => '',
    },
  });

  try {
    const record = await inspector.inspect(
      'https://www.youtube.com/playlist?list=PL123',
      3
    );
    assert.deepEqual(record.samples, []);
    assert.equal(record.error, 'no items/dates');
  } finally {
    inspector.flush();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('runs work with bounded concurrency', async () => {
  let active = 0;
  let maximum = 0;
  const completed = [];
  const items = [1, 2, 3, 4, 5];

  await runPool(
    items,
    async (item) => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      completed.push(item);
      active -= 1;
    },
    2
  );

  assert.equal(completed.length, items.length);
  assert.ok(maximum <= 2);
});

test('stops a pool after the first failure', async () => {
  const seen = [];
  await assert.rejects(
    runPool(
      [1, 2, 3],
      async (item) => {
        seen.push(item);
        throw new Error('failed');
      },
      1
    ),
    /failed/
  );
  assert.deepEqual(seen, [1]);
});

test('describes a missing yt-dlp dependency clearly', () => {
  assert.match(new YtDlpNotFoundError().message, /yt-dlp not found/);
});
