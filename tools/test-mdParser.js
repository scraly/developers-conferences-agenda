const test = require('node:test');
const assert = require('node:assert/strict');
const { parseRecordings, splitMetadataLine } = require('./mdParser');

test('parses a single bare URL', () => {
  assert.deepEqual(parseRecordings('https://youtu.be/AAA'), [
    { label: '', url: 'https://youtu.be/AAA' }
  ]);
});

test('parses a labeled entry', () => {
  assert.deepEqual(parseRecordings('[Main](https://youtu.be/AAA)'), [
    { label: 'Main', url: 'https://youtu.be/AAA' }
  ]);
});

test('parses multiple bare entries separated by pipes', () => {
  const entries = parseRecordings('https://youtu.be/AAA | https://youtu.be/BBB | https://youtu.be/CCC');
  assert.deepEqual(entries.map((entry) => entry.url), [
    'https://youtu.be/AAA',
    'https://youtu.be/BBB',
    'https://youtu.be/CCC'
  ]);
  assert.deepEqual(entries.map((entry) => entry.label), ['', '', '']);
});

test('mixes labeled and bare entries', () => {
  assert.deepEqual(parseRecordings('[Main](https://youtu.be/AAA) | https://youtu.be/BBB'), [
    { label: 'Main', url: 'https://youtu.be/AAA' },
    { label: '', url: 'https://youtu.be/BBB' }
  ]);
});

test('drops entries that are not http(s) URLs', () => {
  assert.deepEqual(parseRecordings('[Main](javascript:alert(1)) | [Ok](https://youtu.be/BBB)'), [
    { label: 'Ok', url: 'https://youtu.be/BBB' }
  ]);
});

test('skips empty entries between pipes', () => {
  assert.deepEqual(parseRecordings('https://youtu.be/AAA |  | https://youtu.be/BBB'), [
    { label: '', url: 'https://youtu.be/AAA' },
    { label: '', url: 'https://youtu.be/BBB' }
  ]);
});

test('labels may contain commas', () => {
  assert.deepEqual(parseRecordings('[Day 1 — Monday, June 8, 2026](https://youtu.be/AAA)'), [
    { label: 'Day 1 — Monday, June 8, 2026', url: 'https://youtu.be/AAA' }
  ]);
});

test('splits an event id that contains commas', () => {
  const line = '2025-06-27-The Perl & Raku Conference in Greenville, SC 2025,attendees:300,recordings:[Main](https://youtu.be/AAA)';
  const { eventId, fields } = splitMetadataLine(line);
  assert.equal(eventId, '2025-06-27-The Perl & Raku Conference in Greenville, SC 2025');
  assert.deepEqual(fields, ['attendees:300', 'recordings:[Main](https://youtu.be/AAA)']);
});

test('splits at both recording: and recordings: boundaries', () => {
  const { eventId, fields } = splitMetadataLine(
    '2026-06-17-Example,attendees:2700,recording:https://youtu.be/AAA,recordings:[Second](https://youtu.be/BBB)'
  );
  assert.equal(eventId, '2026-06-17-Example');
  assert.deepEqual(fields, [
    'attendees:2700',
    'recording:https://youtu.be/AAA',
    'recordings:[Second](https://youtu.be/BBB)'
  ]);
});

test('returns no fields for a line without attendees:/recordings:', () => {
  const { eventId, fields } = splitMetadataLine('2026-01-01-Example,200');
  assert.equal(eventId, '2026-01-01-Example,200');
  assert.deepEqual(fields, []);
});
