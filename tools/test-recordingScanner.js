const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  addRecordingsToMetadata,
  canonicalYoutubeUrl,
  createProgressReporter,
  createReportWriter,
  discoverChannelPlaylists,
  discoverRecordings,
  extractRecordingLinks,
  extractYears,
  extractYouTubeUrls,
  formatBytes,
  formatCacheTimestamp,
  formatProgress,
  localTimestamp,
  getCacheStats,
  makeCandidate,
  markdownReport,
  parseCli,
  rankCandidates,
  readMetadataRecordings,
  reportRows,
  reportToTsv,
  scanEvents,
  scoreCandidate,
  selectMissingEvents,
  verifyCandidates,
} = require('./recordingScanner');

function event(overrides = {}) {
  return {
    name: 'Devoxx France 2026',
    date: [Date.UTC(2026, 3, 22)],
    hyperlink: 'https://devoxx.fr',
    location: 'Paris (France)',
    ...overrides,
  };
}

const METADATA = `event_id,attendees
2026-04-22-Devoxx France 2026,attendees:4600,recording:[All 2026 videos](https://www.youtube.com/playlist?list=PL123) | [Keynotes](https://www.youtube.com/playlist?list=PL456)
2025-06-27-The Perl & Raku Conference in Greenville, SC 2025,attendees:300
`;

test('canonicalizes YouTube playlist, video, and short links', () => {
  assert.equal(
    canonicalYoutubeUrl('https://youtu.be/AAAAAAAAAAA?t=10'),
    'https://www.youtube.com/watch?v=AAAAAAAAAAA'
  );
  assert.equal(
    canonicalYoutubeUrl('https://youtube.com/watch?v=AAAAAAAAAAA&list=PL123'),
    'https://www.youtube.com/playlist?list=PL123'
  );
  assert.equal(
    canonicalYoutubeUrl(
      'https://www.youtube.com/playlist?list=PL123&utm_source=test'
    ),
    'https://www.youtube.com/playlist?list=PL123'
  );
  assert.equal(
    canonicalYoutubeUrl('https://www.youtube.com/live/BBBBBBBBBBB?feature=share'),
    'https://www.youtube.com/watch?v=BBBBBBBBBBB'
  );
  assert.equal(
    canonicalYoutubeUrl('https://www.youtube.com/embed/CCCCCCCCCCC'),
    'https://www.youtube.com/watch?v=CCCCCCCCCCC'
  );
  assert.equal(
    canonicalYoutubeUrl('https://www.youtube.com/@HANDLE/videos'),
    null
  );
  assert.equal(canonicalYoutubeUrl('not a URL'), null);
});

test('extracts and deduplicates YouTube URLs from encoded HTML', () => {
  const html = `
    <a href="https://www.youtube.com/playlist?list=PL123&amp;utm=1">Playlist</a>
    <script>{"url":"https:\\/\\/www.youtube.com\\/watch?v=AAAAAAAAAAA"}</script>
    <a href="https://youtu.be/BBBBBBBBBBB">Short</a>
    <a href="https://www.youtube.com/live/CCCCCCCCCCC">Live</a>
    <a href="https://www.youtube.com/@HANDLE/videos">Channel</a>
  `;

  assert.deepEqual(extractYouTubeUrls(html), [
    'https://www.youtube.com/playlist?list=PL123',
    'https://www.youtube.com/watch?v=AAAAAAAAAAA',
    'https://www.youtube.com/watch?v=BBBBBBBBBBB',
    'https://www.youtube.com/watch?v=CCCCCCCCCCC',
  ]);
});

test('extracts same-site recording pages from HTML', () => {
  const html = `
    <a href="/recordings">Recordings</a>
    <a href="https://other.example/videos">Videos elsewhere</a>
    <a href="/speakers">Speakers</a>
    <a href="/watch/replay">Watch the replay</a>
  `;

  assert.deepEqual(extractRecordingLinks(html, 'https://conf.example/2026'), [
    { url: 'https://conf.example/recordings', title: 'Recordings' },
    { url: 'https://conf.example/watch/replay', title: 'Watch the replay' },
  ]);
});

test('finds years in candidate text', () => {
  assert.deepEqual(extractYears('Devoxx France 2025 - 2026 edition'), [
    '2025',
    '2026',
  ]);
});

test('reads recordings from metadata without splitting comma ids', () => {
  const recordings = readMetadataRecordings(METADATA);

  assert.equal(recordings.size, 1);
  assert.deepEqual(
    recordings.get('2026-04-22-Devoxx France 2026').map((entry) => entry.url),
    [
      'https://www.youtube.com/playlist?list=PL123',
      'https://www.youtube.com/playlist?list=PL456',
    ]
  );
  assert.equal(
    recordings.has('2025-06-27-The Perl & Raku Conference in Greenville, SC 2025'),
    false
  );
});

test('selects past events that are missing recordings', () => {
  const events = [
    event({ name: 'Recorded 2026', date: [Date.UTC(2026, 0, 10)] }),
    event({ name: 'Missing 2025', date: [Date.UTC(2025, 0, 10)] }),
    event({ name: 'Future 2027', date: [Date.UTC(2027, 0, 10)] }),
  ];
  const recorded = new Map([
    ['2026-01-10-Recorded 2026', [{ url: 'https://youtu.be/AAAAAAAAAAA' }]],
  ]);

  const result = selectMissingEvents(events, recorded, {
    today: '2026-11-25',
    years: [],
  });
  assert.equal(result.missing.length, 2);
  assert.deepEqual(
    result.selected.map((item) => item.name),
    ['Missing 2025']
  );
  assert.deepEqual(result.stats, {
    total: 3,
    matching: 3,
    recorded: 1,
    futureSkipped: 1,
    toCheck: 1,
  });

  const withFuture = selectMissingEvents(events, recorded, {
    today: '2026-11-25',
    includeFuture: true,
  });
  assert.deepEqual(
    withFuture.selected.map((item) => item.name),
    ['Future 2027', 'Missing 2025']
  );
  assert.equal(withFuture.stats.futureSkipped, 0);
  assert.equal(withFuture.stats.toCheck, 2);

  const filtered = selectMissingEvents(events, recorded, {
    today: '2026-11-25',
    includeFuture: true,
    years: [2027],
    eventFilter: 'future',
  });
  assert.deepEqual(
    filtered.selected.map((item) => item.name),
    ['Future 2027']
  );
  assert.deepEqual(filtered.stats, {
    total: 3,
    matching: 1,
    recorded: 0,
    futureSkipped: 0,
    toCheck: 1,
  });
});

test('scores exact playlists above unrelated videos', () => {
  const target = {
    ...event(),
    event_year: 2026,
    event_date: '2026-04-22',
  };
  const exact = makeCandidate('https://www.youtube.com/playlist?list=PL123', {
    source: 'channel-playlist',
    kind: 'playlist',
    title: 'Devoxx France 2026 - Keynotes',
    channel: 'Devoxx France',
  });
  const unrelated = makeCandidate(
    'https://www.youtube.com/watch?v=AAAAAAAAAAA',
    {
      source: 'youtube-search',
      kind: 'video',
      title: 'PyCon US 2026 closing keynote',
      channel: 'PyCon US',
    }
  );
  const official = makeCandidate(
    'https://www.youtube.com/playlist?list=PL999',
    { source: 'official-site', kind: 'playlist' }
  );
  const archive = makeCandidate('https://www.youtube.com/playlist?list=PLALL', {
    source: 'channel-playlist',
    kind: 'playlist',
    title: 'Devoxx France 2026 - All videos',
    channel: 'Devoxx France',
  });
  const fullEvent = makeCandidate(
    'https://www.youtube.com/playlist?list=PLFULL',
    {
      source: 'channel-playlist',
      kind: 'playlist',
      title: 'Devoxx France 2026',
      channel: 'Devoxx France',
    }
  );

  assert.ok(scoreCandidate(target, exact) > 100);
  assert.ok(scoreCandidate(target, unrelated) < 55);
  assert.ok(scoreCandidate(target, official) >= 55);
  assert.ok(
    scoreCandidate(target, archive) > scoreCandidate(target, exact)
  );
  assert.ok(
    scoreCandidate(target, fullEvent) > scoreCandidate(target, archive)
  );
});

test('ranks and filters candidates by score', () => {
  const target = {
    ...event(),
    event_year: 2026,
    event_date: '2026-04-22',
  };
  const candidates = [
    makeCandidate('https://www.youtube.com/playlist?list=PL123', {
      source: 'channel-playlist',
      kind: 'playlist',
      title: 'Devoxx France 2026 - Keynotes',
      channel: 'Devoxx France',
    }),
    makeCandidate('https://www.youtube.com/watch?v=AAAAAAAAAAA', {
      source: 'youtube-search',
      kind: 'video',
      title: 'Unrelated talk',
      channel: 'Other Channel',
    }),
  ];

  assert.deepEqual(
    rankCandidates(target, candidates).map((candidate) => candidate.url),
    ['https://www.youtube.com/playlist?list=PL123']
  );
});

test('verifies candidate dates and rejects stale uploads', async () => {
  const target = {
    ...event(),
    event_year: 2026,
    event_date: '2026-04-22',
  };
  const inspector = {
    async inspect(url) {
      return url.includes('PLGOOD')
        ? { samples: [{ date: '20260501' }] }
        : { samples: [{ date: '20250101' }] };
    },
  };
  const candidates = [
    makeCandidate('https://www.youtube.com/playlist?list=PLGOOD', {
      source: 'official-site',
      kind: 'playlist',
    }),
    makeCandidate('https://www.youtube.com/playlist?list=PLSTALE', {
      source: 'official-site',
      kind: 'playlist',
    }),
  ].map((candidate) => ({ ...candidate, score: 100 }));

  const verified = await verifyCandidates(
    target,
    candidates,
    inspector,
    '2026-11-25'
  );
  assert.equal(verified[0].url, 'https://www.youtube.com/playlist?list=PLGOOD');
  assert.equal(verified[0].accepted, true);
  assert.equal(verified[1].accepted, false);
  assert.equal(verified[1].verdict, 'STALE');
});

test('discovers a verified official-site playlist', async () => {
  const target = {
    ...event(),
    event_id: '2026-04-22-Devoxx France 2026',
    event_year: 2026,
    event_date: '2026-04-22',
    event_url: 'https://devoxx.fr',
  };
  const inspector = {
    async inspect() {
      return { samples: [{ date: '20260501' }] };
    },
  };
  const deps = {
    inspector,
    today: '2026-11-25',
    httpGet: async (url) =>
      url === 'https://devoxx.fr'
        ? '<a href="https://www.youtube.com/playlist?list=PLOFFICIAL">Videos</a>'
        : '',
    runYtDlp: async (args) => {
      if (args.at(-1).startsWith('ytsearch')) {
        return [
          'AAAAAAAAAAA\tDevoxx France 2026 talk\tDevoxx France\tUC12345678901234567890\thttps://www.youtube.com/watch?v=AAAAAAAAAAA',
        ].join('\n');
      }
      return '';
    },
  };

  const result = await discoverRecordings(target, deps);
  assert.equal(result.verified, true);
  assert.equal(result.best.url, 'https://www.youtube.com/playlist?list=PLOFFICIAL');
  assert.ok(
    result.candidates.some((candidate) =>
      candidate.sources.includes('youtube-search')
    )
  );
});

test('discovers playlists from matching result channels', async () => {
  const target = {
    ...event(),
    event_year: 2026,
    event_date: '2026-04-22',
  };
  const candidates = await discoverChannelPlaylists(
    target,
    [['UC12345678901234567890', 'Devoxx France']],
    {
      runYtDlp: async () =>
        'PLCHANNEL\tDevoxx France 2026 - Talks\thttps://www.youtube.com/playlist?list=PLCHANNEL',
    }
  );

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].kind, 'playlist');
  assert.deepEqual(candidates[0].sources, ['channel-playlist']);
  assert.equal(candidates[0].title, 'Devoxx France 2026 - Talks');
});

test('adds only missing recordings and keeps existing metadata intact', () => {
  const urlByEvent = new Map([
    [
      '2025-06-27-The Perl & Raku Conference in Greenville, SC 2025',
      'https://www.youtube.com/playlist?list=PLNEW',
    ],
    [
      '2026-04-22-Devoxx France 2026',
      'https://www.youtube.com/playlist?list=PLIGNORED',
    ],
  ]);

  const updated = addRecordingsToMetadata(METADATA, urlByEvent);
  assert.equal(updated.written, 1);
  assert.match(
    updated.content,
    /2025-06-27-The Perl & Raku Conference in Greenville, SC 2025,attendees:300,recording:https:\/\/www\.youtube\.com\/playlist\?list=PLNEW/
  );
  assert.match(updated.content, /PL123/);
  assert.doesNotMatch(updated.content, /PLIGNORED/);
  assert.equal(updated.content.split('\n').length, METADATA.split('\n').length);
});

test('reports every scanned event with a consistent status', () => {
  const results = [
    {
      event_id: '2026-04-22-Devoxx France 2026',
      event_name: 'Devoxx France 2026',
      event_date: '2026-04-22',
      event_url: 'https://devoxx.fr',
      from_cache: false,
      best: {
        score: 100,
        verdict: 'OK',
        kind: 'playlist',
        sources: ['official-site'],
        latest_upload: '2026-05-01',
        url: 'https://www.youtube.com/playlist?list=PL123',
        title: 'Videos',
        channel: 'Devoxx France',
        accepted: true,
      },
    },
    {
      event_id: '2026-05-01-No Candidate',
      event_name: 'No Candidate',
      event_date: '2026-05-01',
      event_url: '',
      best: null,
    },
  ];

  const rows = reportRows(results);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].status, 'FOUND');
  assert.equal(rows[1].status, 'NONE');
  assert.equal(rows[1].url, '');
  assert.match(reportToTsv(rows), /^status\tevent_id\tevent_date/m);
  assert.match(reportToTsv(rows), /\nNONE\t2026-05-01-No Candidate/);
});

test('reports cache totals, hits, and last update time', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'recording-cache-'));
  const cachePath = path.join(directory, 'cache.json');

  try {
    fs.writeFileSync(
      cachePath,
      JSON.stringify({
        version: 1,
        updated_at: '2026-11-25T19:42:45.631Z',
        events: {
          '2026-04-22-Event A': {},
          '2026-04-22-Event B': {},
        },
        dates: {
          'https://youtu.be/AAAAAAAAAAA': {},
        },
      })
    );

    const stats = getCacheStats(cachePath, [
      { event_id: '2026-04-22-Event A' },
      { event_id: '2026-04-22-Event C' },
    ]);
    assert.equal(stats.alreadyChecked, 1);
    assert.equal(stats.eventsInCache, 2);
    assert.equal(stats.sizeBytes, fs.statSync(cachePath).size);
    assert.equal(stats.updatedAt, '2026-11-25T19:42:45.631Z');
    assert.match(formatCacheTimestamp(stats.updatedAt), /2026/);
    assert.equal(formatCacheTimestamp(null), 'never');
    assert.equal(formatBytes(0), '0 B');
    assert.equal(formatBytes(1536), '1.5 KB');
    assert.equal(formatBytes(2 * 1024 * 1024), '2.0 MB');

    assert.equal(
      getCacheStats(cachePath, [], { refresh: true }).refreshed,
      true
    );
    assert.equal(
      getCacheStats(cachePath, [], { disabled: true }).enabled,
      false
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('formats report timestamps in local time with an offset', () => {
  const timestamp = localTimestamp(
    new Date('2026-11-25T00:00:00.000Z')
  );
  assert.match(
    timestamp,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/
  );
  assert.doesNotMatch(timestamp, /Z$/);
});

test('formats and renders a one-line progress bar', () => {
  assert.equal(
    formatProgress(5, 10, 10),
    'Scanning [#####-----] 5/10 (50%)'
  );

  const chunks = [];
  const stream = {
    isTTY: true,
    write(value) {
      chunks.push(value);
    },
  };
  const reporter = createProgressReporter(stream, { width: 5 });

  reporter.update(0, 10);
  reporter.update(5, 10);
  reporter.finish();

  assert.equal(chunks[0], '\rScanning [-----] 0/10 (0%)');
  assert.equal(chunks[1], '\rScanning [###--] 5/10 (50%)');
  assert.equal(chunks[2], '\n');
  assert.equal(
    chunks.slice(0, 2).some((chunk) => chunk.includes('\n')),
    false
  );
});

test('renders a human-readable Markdown report', () => {
  const base = {
    event_date: '2026-04-22',
    event_url: 'https://www.devoxx.fr',
    from_cache: false,
  };
  const results = [
    {
      ...base,
      event_id: '2026-04-22-Devoxx France 2026',
      event_name: 'Devoxx France 2026',
      best: {
        score: 170,
        verdict: 'OK',
        kind: 'playlist',
        sources: ['channel-playlist'],
        latest_upload: '2026-05-12',
        url: 'https://www.youtube.com/playlist?list=PL123',
        title: 'Devoxx France 2026',
        channel: 'Devoxx France',
        accepted: true,
      },
    },
    {
      ...base,
      event_id: '2026-04-23-Review Event',
      event_name: 'Review | Event',
      best: {
        score: 60,
        verdict: 'STALE',
        kind: 'playlist',
        sources: ['youtube-search'],
        latest_upload: '2025-04-01',
        url: 'https://www.youtube.com/playlist?list=PLSTALE',
        title: 'Old playlist',
        channel: 'Channel',
        accepted: false,
      },
    },
    {
      ...base,
      event_id: '2026-04-24-No Candidate',
      event_name: 'No Candidate',
      best: null,
    },
  ];

  results[0].candidates = [
    results[0].best,
    {
      ...results[0].best,
      title: 'Keynotes',
      url: 'https://www.youtube.com/playlist?list=PL456',
    },
  ];

  const output = markdownReport(results, {
    scanned: 3,
    matching: 3,
    missing_total: 4,
    verified: 1,
    manual: 0,
    with_candidates: 2,
    no_candidate: 1,
    written: 0,
  }, {
    today: '2026-11-25',
    eventCount: 10,
    generatedAt: '2026-11-25T00:00:00.000Z',
  });

  assert.match(output, /^\| Date \| Event \| Recordings \| Status \|/m);
  assert.match(
    output,
    /\| 2026-04-22 \| \[Devoxx France 2026\]\(https:\/\/www\.devoxx\.fr\) \| • \[Devoxx France 2026\]\(https:\/\/www\.youtube\.com\/playlist\?list=PL123\), latest upload 2026-05-12<br>• \[Keynotes\]\(https:\/\/www\.youtube\.com\/playlist\?list=PL456\), latest upload 2026-05-12 \| FOUND \|/
  );
  assert.match(output, /Review \\\| Event/);
  assert.match(output, /— STALE, latest upload 2025-04-01 \| REVIEW \|/);
  assert.match(
    output,
    /\| 2026-04-22 \| \[No Candidate\]\(https:\/\/www\.devoxx\.fr\) \| — \| NONE \|/
  );
});

test('writes partial reports as scan results arrive', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'recording-report-'));
  const out = path.join(directory, 'scan.json');
  const tsv = path.join(directory, 'scan.tsv');
  const md = path.join(directory, 'scan.md');
  const results = new Array(2);
  const context = {
    stats: {
      total: 10,
      matching: 2,
      recorded: 1,
      futureSkipped: 0,
      toCheck: 2,
    },
    missingTotal: 9,
    selected: [{ event_id: 'a' }, { event_id: 'b' }],
    cacheStats: { sizeBytes: 100, updatedAt: null },
    eventsFile: 'events.json',
    metadataFile: 'METADATA.csv',
    today: '2026-11-25',
    written: 0,
  };
  const writer = createReportWriter({
    results,
    context,
    paths: { out, tsv, md, today: '2026-11-25', eventCount: 10 },
    throttleMs: 60000,
  });

  try {
    writer.flush();
    assert.match(fs.readFileSync(md, 'utf8'), /Scanned: 0 of 2/);

    results[0] = {
      event_id: '2026-01-01-Event A',
      event_name: 'Event A',
      event_date: '2026-01-01',
      event_url: 'https://event-a.example',
      candidates: [],
      best: {
        score: 100,
        verdict: 'OK',
        kind: 'playlist',
        sources: ['official-site'],
        latest_upload: '2026-02-01',
        url: 'https://www.youtube.com/playlist?list=PLA',
        title: 'Event A recordings',
        channel: 'Event A',
        accepted: true,
      },
      verified: true,
      manual: false,
      from_cache: false,
    };
    writer.schedule();
    writer.flush();

    const partial = fs.readFileSync(md, 'utf8');
    assert.match(partial, /Scanned: 1 of 2/);
    assert.match(partial, /Event A/);
    assert.doesNotMatch(partial, /Event B/);

    results[1] = {
      event_id: '2026-01-02-Event B',
      event_name: 'Event B',
      event_date: '2026-01-02',
      event_url: 'https://event-b.example',
      candidates: [],
      best: null,
      verified: false,
      manual: false,
      from_cache: false,
    };
    writer.setWritten(1);
    const finalState = writer.flush();

    assert.equal(finalState.summary.scanned, 2);
    assert.equal(finalState.summary.written, 1);
    assert.match(fs.readFileSync(md, 'utf8'), /Event B[\s\S]*—/);
    const json = JSON.parse(fs.readFileSync(out, 'utf8'));
    assert.equal(json.summary.scanned, 2);
    assert.match(
      json.generated_at,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/
    );
    assert.ok(
      json.results.every((result) =>
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(
          result.updated
        )
      )
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('scans events with bounded workers and reuses the cache', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'recording-scan-'));
  const events = [
    {
      ...event({ name: 'Missing A' }),
      event_id: '2026-04-22-Missing A',
      event_date: '2026-04-22',
      event_year: 2026,
      event_url: '',
    },
    {
      ...event({ name: 'Missing B' }),
      event_id: '2026-04-22-Missing B',
      event_date: '2026-04-22',
      event_year: 2026,
      event_url: '',
    },
  ];
  let searches = 0;
  const deps = {
    inspector: { inspect: async () => ({ samples: [] }) },
    httpGet: async () => '',
    runYtDlp: async () => {
      searches += 1;
      return '';
    },
  };
  const cachePath = path.join(directory, 'cache.json');
  const options = {
    today: '2026-11-25',
    workers: 2,
    cachePath,
  };

  try {
    const first = await scanEvents(events, options, deps);
    assert.equal(first.length, 2);
    assert.ok(searches >= 2);

    const saved = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    assert.ok(saved.events);
    assert.ok(saved.dates);

    const searchesAfterFirst = searches;
    const second = await scanEvents(events, options, deps);
    assert.equal(second.length, 2);
    assert.equal(searches, searchesAfterFirst);
    assert.ok(second.every((result) => result.from_cache));
    assert.ok(second.every((result) => result.updated));

    const third = await scanEvents(
      events,
      { ...options, refreshCache: true },
      deps
    );
    assert.equal(third.length, 2);
    assert.ok(searches > searchesAfterFirst);
    assert.ok(third.every((result) => !result.from_cache));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('does not touch the cache with --no-cache', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'recording-scan-'));
  const cachePath = path.join(directory, 'cache.json');
  let searches = 0;
  const deps = {
    inspector: { inspect: async () => ({ samples: [] }) },
    httpGet: async () => '',
    runYtDlp: async () => {
      searches += 1;
      return '';
    },
  };

  try {
    await scanEvents(
      [
        {
          ...event({ name: 'Missing' }),
          event_id: '2026-04-22-Missing',
          event_date: '2026-04-22',
          event_year: 2026,
          event_url: '',
        },
      ],
      {
        today: '2026-11-25',
        workers: 1,
        cachePath,
        useCache: false,
      },
      deps
    );

    assert.ok(searches >= 1);
    assert.equal(fs.existsSync(cachePath), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('parses scanner CLI options', () => {
  const defaults = parseCli([]);
  assert.equal(defaults.workers, 2);
  assert.equal(defaults.minScore, 55);
  assert.equal(defaults.includeFuture, false);
  assert.equal(defaults.noCache, false);
  assert.equal(defaults.refreshCache, false);
  assert.equal(defaults.write, false);

  const options = parseCli([
    '--since',
    '2024',
    '--year',
    '2025,2026',
    '--event',
    'devoxx',
    '--limit',
    '10',
    '--workers',
    '3',
    '--min-score',
    '70',
    '--no-cache',
    '--include-future',
    '--write',
  ]);
  assert.equal(options.since, 2024);
  assert.deepEqual(options.years, [2025, 2026]);
  assert.equal(options.eventFilter, 'devoxx');
  assert.equal(options.limit, 10);
  assert.equal(options.workers, 3);
  assert.equal(options.minScore, 70);
  assert.equal(options.noCache, true);
  assert.equal(options.includeFuture, true);
  assert.equal(options.write, true);
});

test('rejects invalid scanner CLI options', () => {
  assert.throws(() => parseCli(['--today', '2026-02-29']), /YYYY-MM-DD/);
  assert.throws(() => parseCli(['--workers', '0']), /positive integer/);
  assert.throws(() => parseCli(['--since', 'abc']), /four-digit year/);
  assert.throws(() => parseCli(['--year', 'abc']), /four-digit years/);
  assert.throws(() => parseCli(['--limit', '0']), /positive integer/);
  assert.throws(() => parseCli(['--min-score', 'x']), /non-negative/);
  assert.throws(
    () => parseCli(['--no-cache', '--refresh-cache']),
    /cannot be used together/
  );
  assert.throws(() => parseCli(['extra']), /positional/);
});
