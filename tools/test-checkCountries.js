const test = require('node:test');
const assert = require('node:assert/strict');
const { checkCountries, VIRTUAL_KEYWORDS } = require('./checkCountries');

test('accepts valid country names, codes, and diacritics', () => {
  const errors = checkCountries([
    { name: 'US name', country: 'USA' },
    { name: 'France name', country: 'France' },
    { name: 'Nepal name', country: 'Nepal' },
    { name: 'Reunion name', country: 'La Réunion' },
    { name: 'Ivory Coast', country: "Côte d'Ivoire" },
    { name: 'Trinidad', country: 'Trinidad and Tobago' },
    { name: 'Republic of Korea', country: 'Republic of Korea' },
    { name: 'Lower alpha-2', country: 'us' }
  ]);

  assert.deepEqual(errors, []);
});

test('skips virtual or online events by status, name, or location', () => {
  const errors = checkCountries([
    { name: 'Virtual conf', status: 'Virtual', country: 'INVALID' },
    { name: 'Online Conference', country: 'INVALID' },
    { name: 'Remote meetup', location: 'Remote / Worldwide', country: 'INVALID' },
    { name: 'Hybrid Summit', status: 'Hybrid', country: 'INVALID' }
  ]);

  assert.deepEqual(errors, []);
});

test('falls back to country in location (parentheses or comma)', () => {
  const errors = checkCountries([
    { name: 'Paris event', location: 'Paris (France)' },
    { name: 'Austin event', location: 'Austin, USA' }
  ]);

  assert.deepEqual(errors, []);
});

test('flags missing country when not derivable', () => {
  const errors = checkCountries([
    { name: 'No country anywhere' }
  ]);

  assert.equal(errors.length, 1);
  assert.match(errors[0], /Missing country code/);
});

test('flags invalid codes with normalized output', () => {
  const errors = checkCountries([
    { name: 'Bad code', country: 'ZZZ' }
  ]);

  assert.equal(errors.length, 1);
  assert.match(errors[0], /normalized: "ZZZ"/);
});

test('handles additional mappings and punctuation variants', () => {
  const errors = checkCountries([
    { name: 'Bosnia', country: 'Bosnia & Herzegovina' },
    { name: 'Sao Tome', country: 'Sao Tome and Principe' },
    { name: 'USA long', country: 'United States of America' }
  ]);

  assert.deepEqual(errors, []);
});

test('handles null/undefined country and location gracefully', () => {
  const errors = checkCountries([
    { name: 'Null test', country: null, location: undefined }
  ]);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Missing country code/);
});

test('handles mixed case country codes', () => {
  const errors = checkCountries([
    { name: 'Mixed case', country: 'Fr' },
    { name: 'Lower case', country: 'de' },
    { name: 'Upper case', country: 'IT' }
  ]);
  assert.deepEqual(errors, []);
});

test('extracts country from complex location formats', () => {
  const errors = checkCountries([
    { name: 'Slash format', location: 'City / France' },
    { name: 'Multiple slashes', location: 'City / Region / US' },
    { name: 'Mixed separators', location: 'City, Region / Germany' }
  ]);
  assert.deepEqual(errors, []);
});

test('validates event identifier fallbacks', () => {
  const errors = checkCountries([
    { name: 'Only name', country: 'INVALID' }
  ]);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Only name/);
});

test('handles ONLINE keyword in various fields', () => {
  const errors = checkCountries([
    { name: 'Status online', status: 'Online', country: 'BADCODE' },
    { name: 'Location online', location: 'Online', country: 'BADCODE' },
    { name: 'Name online', name: 'Online Conf 2024', country: 'BADCODE' }
  ]);
  assert.deepEqual(errors, []);
});

test('handles empty array input', () => {
  const errors = checkCountries([]);
  assert.deepEqual(errors, []);
});

test('handles non-array input', () => {
  const errors = checkCountries('not an array');
  assert.equal(errors.length, 1);
  assert.match(errors[0], /must be an array/);
});

test('exports VIRTUAL_KEYWORDS for configuration', () => {
  assert.ok(Array.isArray(VIRTUAL_KEYWORDS));
  assert.ok(VIRTUAL_KEYWORDS.includes('virtual'));
  assert.ok(VIRTUAL_KEYWORDS.includes('online'));
});
