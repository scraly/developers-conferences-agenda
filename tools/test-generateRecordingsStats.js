const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');

const {
  buildSvg,
  defaultSnapshotDate,
  formatIsoSnapshotDate,
  formatNumber,
  formatSnapshotDate,
  isPlaylist,
  isYouTube,
  markdown,
  parseCli,
  percent,
  periodFor,
  renderImage,
  summarize,
} = require('./generateRecordingsStats');

const playlist = (id) => ({
  label: '',
  url: `https://www.youtube.com/playlist?list=${id}`,
});
const video = (id) => ({
  label: '',
  url: `https://www.youtube.com/watch?v=${id}`,
});

const EVENTS = [
  {
    name: 'Old Event',
    date: [Date.UTC(2019, 4, 1)],
    recordings: [],
  },
  {
    name: 'Single Video',
    date: [Date.UTC(2023, 4, 1)],
    recordings: [video('AAAAAAAAAAA')],
  },
  {
    name: 'Single Playlist',
    date: [Date.UTC(2025, 4, 1)],
    recordings: [playlist('PL1')],
  },
  {
    name: 'Alpha Conference',
    date: [Date.UTC(2026, 4, 1)],
    recordings: [
      playlist('PL2'),
      playlist('PL3'),
      playlist('PL4'),
      playlist('PL5'),
      video('BBBBBBBBBBB'),
      {
        label: 'Archive',
        url: 'https://peertube.example.com/w/abc',
      },
    ],
  },
  {
    name: 'Beta Conference',
    date: [Date.UTC(2026, 3, 1)],
    recordings: [
      video('CCCCCCCCCCC'),
      video('DDDDDDDDDDD'),
      video('EEEEEEEEEEE'),
      video('FFFFFFFFFFF'),
      video('GGGGGGGGGGG'),
      video('HHHHHHHHHHH'),
    ],
  },
  {
    name: 'Small Conference',
    date: [Date.UTC(2026, 5, 1)],
    recordings: [
      {
        label: 'One',
        url: 'https://example.com/one',
      },
      {
        label: 'Two',
        url: 'https://example.com/two',
      },
      {
        label: 'Three',
        url: 'https://example.com/three',
      },
      {
        label: 'Four',
        url: 'https://example.com/four',
      },
    ],
  },
  {
    name: 'Future Event',
    date: [Date.UTC(2027, 4, 1)],
    recordings: [],
  },
];

test('assigns events to the documented periods', () => {
  assert.equal(periodFor(2017), '2017-2020');
  assert.equal(periodFor(2020), '2017-2020');
  assert.equal(periodFor(2021), '2021-2024');
  assert.equal(periodFor(2024), '2021-2024');
  assert.equal(periodFor(2025), '2025');
  assert.equal(periodFor(2026), '2026');
  assert.equal(periodFor(2027), '2027-2028');
  assert.equal(periodFor(2030), '2027-2028');
});

test('classifies playlists and YouTube hosts', () => {
  assert.equal(isPlaylist('https://www.youtube.com/playlist?list=PL1'), true);
  assert.equal(isPlaylist('https://youtu.be/AAAAAAAAAAA'), false);

  assert.equal(isYouTube('https://youtu.be/AAAAAAAAAAA'), true);
  assert.equal(isYouTube('https://youtube.com/watch?v=AAAAAAAAAAA'), true);
  assert.equal(
    isYouTube('https://www.youtube.com/watch?v=AAAAAAAAAAA'),
    true
  );
  assert.equal(isYouTube('https://peertube.example.com/w/abc'), false);
  assert.equal(isYouTube('not a URL'), false);
});

test('formats numbers, percentages, and snapshot dates', () => {
  assert.equal(formatNumber(1234567), '1,234,567');
  assert.equal(percent(1, 4), '25.00%');
  assert.equal(percent(1, 3), '33.33%');
  assert.equal(percent(0, 0), '0.00%');
  assert.equal(formatSnapshotDate(new Date(2026, 10, 23)), '23 November 2026');
  assert.equal(formatIsoSnapshotDate('2026-11-23'), '23 November 2026');
  assert.equal(
    defaultSnapshotDate(new Date(2026, 10, 23, 12, 0, 0)),
    '23 November 2026'
  );
});

test('summarizes coverage across periods and links', () => {
  const data = summarize(EVENTS);

  assert.equal(data.total, 7);
  assert.equal(data.recorded, 5);
  assert.equal(data.links, 18);
  assert.equal(data.multi, 3);
  assert.equal(data.playlists, 5);
  assert.equal(data.videos, 13);
  assert.equal(data.youtube, 13);

  assert.deepEqual(data.by_period['2017-2020'], {
    events: 1,
    recorded: 0,
    links: 0,
    multi: 0,
    playlists: 0,
    videos: 0,
  });
  assert.deepEqual(data.by_period['2025'], {
    events: 1,
    recorded: 1,
    links: 1,
    multi: 0,
    playlists: 1,
    videos: 0,
  });
  assert.deepEqual(data.by_period['2026'], {
    events: 3,
    recorded: 3,
    links: 16,
    multi: 3,
    playlists: 4,
    videos: 12,
  });
  assert.deepEqual(data.by_period['2027-2028'], {
    events: 1,
    recorded: 0,
    links: 0,
    multi: 0,
    playlists: 0,
    videos: 0,
  });
});

test('orders top events by link count, date, then name', () => {
  assert.deepEqual(summarize(EVENTS).top, [
    ['Beta Conference', '2026-04-01', 6],
    ['Alpha Conference', '2026-05-01', 6],
  ]);
});

test('includes all top events with at least five links', () => {
  const events = Array.from({ length: 4 }, (_, index) => ({
    name: `Event ${index}`,
    date: [Date.UTC(2026, 0, index + 1)],
    recordings: [playlist('PL1'), playlist('PL2'), playlist('PL3'), playlist('PL4'), playlist('PL5')],
  }));

  assert.equal(summarize(events).top.length, 4);
});

test('renders the statistics Markdown with the Node command', () => {
  const output = markdown(summarize(EVENTS), '23 November 2026');

  assert.match(output, /^# Recording statistics\n/);
  assert.match(output, /Last updated: 23 November 2026/);
  assert.match(output, /`node tools\/generateRecordingsStats\.js`/);
  assert.match(
    output,
    /\| \*\*Total\*\* \| \*\*7\*\* \| \*\*5\*\* \| \*\*71\.43%\*\* \| \*\*18\*\* \| \*\*3\*\* \| \*\*5\*\* \| \*\*13\*\* \|/
  );
  assert.match(output, /\| 2017–2020 \| 1 \| 0 \| 0\.00% \| 0 \| 0 \| 0 \| 0 \|/);
  assert.match(output, /\| Beta Conference \| 2026-04-01 \| 6 \|/);
  assert.match(output, /\| Alpha Conference \| 2026-05-01 \| 6 \|/);
  assert.doesNotMatch(output, /\| Small Conference \|/);
});

test('builds a complete SVG infographic', () => {
  const data = summarize(EVENTS);
  const svg = buildSvg(data, '23 November 2026');

  assert.match(svg, /^<svg[^>]+width="1600" height="1500"/);
  assert.match(svg, /Conference events &amp; recordings/);
  assert.match(svg, /16 recording links/);
  assert.match(svg, /2027–2028/);
  assert.match(svg, /<\/svg>$/);
});

test('parses CLI options', () => {
  assert.deepEqual(parseCli([]), {
    date: undefined,
    noImage: false,
    help: false,
  });
  assert.deepEqual(parseCli(['--date', '2026-11-23', '--no-image']), {
    date: '2026-11-23',
    noImage: true,
    help: false,
  });
  assert.throws(
    () => parseCli(['--date', '2026-02-29']),
    /YYYY-MM-DD/
  );
  assert.throws(() => parseCli(['unexpected']), /Unexpected argument|positionals/);
});

test('renders the expected PNG dimensions and metadata', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'recording-stats-'));
  const output = path.join(directory, 'stats.png');

  try {
    await renderImage(summarize(EVENTS), '23 November 2026', output);

    const metadata = await sharp(output).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, 1600);
    assert.equal(metadata.height, 1500);
    assert.equal(metadata.density, 144);
    assert.ok(fs.statSync(output).size > 10000);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
