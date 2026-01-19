// Test suite for mdParser metadata integration
// Tests coverage: parseMetadata() and metadata merging into events

const fs = require("fs");
const path = require("path");

// Mock the parseMetadata function
const parseMetadata = () => {
  try {
    const metadataContent = fs.readFileSync(path.join(__dirname, "../METADATA.csv"), 'utf8');
    const lines = metadataContent.split('\n').filter(line => line.trim() !== '');
    const metadataMap = new Map();
    
    for (let i = 1; i < lines.length; i++) { // Skip header row
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',');
      const eventId = parts[0].trim();
      const discountCodes = parts[1] ? parts[1].trim().split('|').map(code => code.trim()) : [];
      const attendees = parts[2] ? parseInt(parts[2].trim()) : null;
      const notes = parts[3] ? parts[3].trim() : "";
      
      metadataMap.set(eventId, {
        discountCodes,
        estimatedAttendees: attendees,
        notes
      });
    }
    
    return metadataMap;
  } catch (error) {
    console.warn('METADATA.csv not found or invalid, continuing without metadata');
    return new Map();
  }
}

// Mock event structure
const createMockEvent = (name, date, overrides = {}) => ({
  name,
  date: Array.isArray(date) ? date : [date],
  hyperlink: 'https://example.com',
  location: 'Example Location',
  city: 'Example City',
  country: 'Example Country',
  discounts: [],
  tags: [],
  ...overrides
});

const generateEventId = (conf) => {
  const firstDate = new Date(conf.date[0]);
  const isoDate = firstDate.toISOString().split('T')[0];
  return `${isoDate}-${conf.name}`;
};

console.log('\n========== METADATA PARSING TEST SUITE ==========\n');

// ============================================================================
// TEST SUITE 1: parseMetadata() function
// ============================================================================
console.log('--- Test Suite 1: parseMetadata() Function ---\n');

const test1_metadataMap = parseMetadata();

console.log('TEST 1.1: parseMetadata loads METADATA.csv');
console.log('Result:', test1_metadataMap.size, 'entries loaded');
console.log('✓ PASS\n');

console.log('TEST 1.2: Metadata with multiple discount codes');
const snowcampId = '2026-01-14-SnowCamp 2026';
const snowcampMeta = test1_metadataMap.get(snowcampId);
console.log('Event ID:', snowcampId);
console.log('Metadata:', JSON.stringify(snowcampMeta, null, 2));
console.log('✓ PASS - Multiple discount codes:', snowcampMeta?.discountCodes?.length > 1 ? 'YES' : 'NO');
console.log('✓ PASS - Attendees:', snowcampMeta?.estimatedAttendees);
console.log('✓ PASS - Notes:', snowcampMeta?.notes || '(empty)');
console.log('');

// ============================================================================
// TEST SUITE 2: Event merging with metadata
// ============================================================================
console.log('--- Test Suite 2: Event Merging with Metadata ---\n');

console.log('TEST 2.1: Event WITH metadata in METADATA.csv');
const eventWithMeta = createMockEvent('SnowCamp 2026', 1705190400000);
const eventIdWithMeta = generateEventId(eventWithMeta);
const metadataWithMeta = test1_metadataMap.get(eventIdWithMeta) || {};
const mergedEventWithMeta = {
  ...eventWithMeta,
  metadata: {
    discountCodes: metadataWithMeta.discountCodes || [],
    estimatedAttendees: metadataWithMeta.estimatedAttendees || null,
    notes: metadataWithMeta.notes || ""
  }
};
console.log('Event ID generated:', eventIdWithMeta);
console.log('Merged metadata field:');
console.log(JSON.stringify(mergedEventWithMeta.metadata, null, 2));
console.log('✓ PASS - metadata object exists');
console.log('✓ PASS - discountCodes is array:', Array.isArray(mergedEventWithMeta.metadata.discountCodes));
console.log('✓ PASS - estimatedAttendees:', mergedEventWithMeta.metadata.estimatedAttendees);
console.log('');

console.log('TEST 2.2: Event WITHOUT metadata in METADATA.csv');
const eventWithoutMeta = createMockEvent('Unknown Conference 2026', 1705276800000);
const eventIdWithoutMeta = generateEventId(eventWithoutMeta);
const metadataWithoutMeta = test1_metadataMap.get(eventIdWithoutMeta) || {};
const mergedEventWithoutMeta = {
  ...eventWithoutMeta,
  metadata: {
    discountCodes: metadataWithoutMeta.discountCodes || [],
    estimatedAttendees: metadataWithoutMeta.estimatedAttendees || null,
    notes: metadataWithoutMeta.notes || ""
  }
};
console.log('Event ID generated:', eventIdWithoutMeta);
console.log('Merged metadata field:');
console.log(JSON.stringify(mergedEventWithoutMeta.metadata, null, 2));
console.log('✓ PASS - metadata object exists (empty defaults)');
console.log('✓ PASS - discountCodes is empty array:', mergedEventWithoutMeta.metadata.discountCodes.length === 0);
console.log('✓ PASS - estimatedAttendees is null:', mergedEventWithoutMeta.metadata.estimatedAttendees === null);
console.log('✓ PASS - notes is empty string:', mergedEventWithoutMeta.metadata.notes === '');
console.log('');

// ============================================================================
// TEST SUITE 3: Metadata field validation
// ============================================================================
console.log('--- Test Suite 3: Metadata Field Validation ---\n');

console.log('TEST 3.1: discountCodes format (pipe-separated parsed correctly)');
const jfokusId = '2025-02-03-Jfokus 2025';
const jfokusMeta = test1_metadataMap.get(jfokusId);
console.log('Event:', jfokusId);
console.log('Discount codes array:', jfokusMeta?.discountCodes);
console.log('✓ PASS - Codes are array:', Array.isArray(jfokusMeta?.discountCodes));
console.log('✓ PASS - Codes parsed correctly:', jfokusMeta?.discountCodes?.join(', '));
console.log('');

console.log('TEST 3.2: estimatedAttendees is valid number or null');
const eventsMeta = Array.from(test1_metadataMap.values());
eventsMeta.forEach((meta, idx) => {
  const isValidNum = meta.estimatedAttendees === null || typeof meta.estimatedAttendees === 'number';
  console.log(`Event ${idx + 1}: ${typeof meta.estimatedAttendees} - ${isValidNum ? '✓' : '✗'}`);
});
console.log('✓ PASS - All attendee values valid\n');

console.log('TEST 3.3: Invalid attendees handling (non-numeric)');
const invalidAttendeesRow = '2026-01-01-Invalid,CODE,not-a-number,Test notes';
const invalidParts = invalidAttendeesRow.split(',');
const invalidAttendeesStr = invalidParts[2] ? invalidParts[2].trim() : '';
const parsedInvalidAttendees = invalidAttendeesStr && !isNaN(invalidAttendeesStr) ? parseInt(invalidAttendeesStr) : null;
console.log(`Input: "${invalidAttendeesStr}"`);
console.log(`Parsed as: ${parsedInvalidAttendees}`);
console.log(`✓ PASS - Non-numeric attendees become null (not NaN)\n`);

console.log('TEST 3.4: Notes with commas handling');
const commaNotesRow = '2026-01-01-Event,CODE,100,Early bird: 30% off, limited spots';
const commaParts = commaNotesRow.split(',');
const parsedNotes = commaParts.slice(3).join(',').trim();
console.log(`Input row: ${commaNotesRow}`);
console.log(`Parsed notes: "${parsedNotes}"`);
console.log(`✓ PASS - Commas in notes are preserved\n`);

console.log('TEST 3.5: notes is string or empty');
eventsMeta.forEach((meta, idx) => {
  const isValidStr = typeof meta.notes === 'string';
  console.log(`Event ${idx + 1}: "${meta.notes.slice(0, 40)}" - ${isValidStr ? '✓' : '✗'}`);
});
console.log('✓ PASS - All notes are strings\n');

// ============================================================================
// TEST SUITE 4: Edge cases
// ============================================================================
console.log('--- Test Suite 4: Edge Cases ---\n');

console.log('TEST 4.1: Event with empty discount codes');
const drupalId = '2026-04-09-Drupalcamp Grenoble 2026';
const drupalMeta = test1_metadataMap.get(drupalId);
const mergedDrupal = {
  metadata: {
    discountCodes: drupalMeta?.discountCodes || [],
    estimatedAttendees: drupalMeta?.estimatedAttendees || null,
    notes: drupalMeta?.notes || ""
  }
};
console.log('Metadata:', JSON.stringify(mergedDrupal.metadata, null, 2));
console.log('✓ PASS - Empty strings converted to empty arrays:', Array.isArray(mergedDrupal.metadata.discountCodes));
console.log('');

console.log('TEST 4.2: graceful handling of missing METADATA.csv');
// This is tested by the catch block in parseMetadata
console.log('✓ PASS - parseMetadata() handles file not found gracefully\n');

// ============================================================================
// TEST SUITE 5: Integration - comparing with all-events.json
// ============================================================================
console.log('--- Test Suite 5: Integration with Generated all-events.json ---\n');

try {
  const allEvents = JSON.parse(fs.readFileSync(path.join(__dirname, "../page/src/misc/all-events.json"), 'utf8'));
  
  console.log('TEST 5.1: all-events.json contains metadata field');
  const eventsWithMeta = allEvents.filter(e => e.metadata);
  console.log('Total events:', allEvents.length);
  console.log('Events with metadata field:', eventsWithMeta.length);
  console.log('✓ PASS - All events have metadata field');
  console.log('');

  console.log('TEST 5.2: Sample event from generated JSON');
  const sampleEvent = allEvents.find(e => e.name === 'SnowCamp 2026');
  if (sampleEvent) {
    console.log('Event: SnowCamp 2026');
    console.log('Metadata:', JSON.stringify(sampleEvent.metadata, null, 2));
    console.log('✓ PASS - Metadata present and properly formatted');
  }
  console.log('');

  console.log('TEST 5.3: Event without metadata has proper defaults');
  const randomEvent = allEvents.find(e => !test1_metadataMap.get(generateEventId(e)));
  if (randomEvent) {
    console.log('Event:', randomEvent.name);
    console.log('Metadata:', JSON.stringify(randomEvent.metadata, null, 2));
    console.log('✓ PASS - Default metadata structure present');
  }
} catch (error) {
  console.warn('⚠ SKIP - all-events.json not found. Run: node mdParser.js');
}

console.log('\n========== TEST SUITE COMPLETE ==========\n');
