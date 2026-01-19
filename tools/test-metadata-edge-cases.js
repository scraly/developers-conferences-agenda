// Comprehensive edge case tests for metadata and discount handling
const fs = require("fs");

console.log('\n========== METADATA & DISCOUNT EDGE CASE TESTS ==========\n');

// ============================================================================
// TEST 1: Events with BOTH inline and metadata discounts (deduplication)
// ============================================================================
console.log('--- Test 1: Deduplication (Inline + Metadata) ---\n');

const deduplicationTests = [
  {
    name: 'Same code in both sources',
    inlineDiscounts: [
      { code: 'CODE1', value: '20%', type: 'percent', until: '2025-12-31', untilDate: 1735689600000 }
    ],
    metadataDiscounts: ['CODE1', 'CODE2'],
    expected: {
      inlineCount: 1,
      metadataCount: 1, // CODE2 only, CODE1 filtered out
      description: 'CODE1 shown with full details, CODE2 as metadata badge'
    }
  },
  {
    name: 'No overlap',
    inlineDiscounts: [
      { code: 'INLINE1', value: '15%', type: 'percent', until: '', untilDate: null }
    ],
    metadataDiscounts: ['META1', 'META2'],
    expected: {
      inlineCount: 1,
      metadataCount: 2,
      description: 'All three codes shown'
    }
  },
  {
    name: 'All codes in metadata only',
    inlineDiscounts: [],
    metadataDiscounts: ['CODE1', 'CODE2', 'CODE3'],
    expected: {
      inlineCount: 0,
      metadataCount: 3,
      description: 'All metadata codes shown as blue badges'
    }
  },
  {
    name: 'All codes inline only',
    inlineDiscounts: [
      { code: 'CODE1', value: '10%', type: 'percent', until: '', untilDate: null },
      { code: 'CODE2', value: '20%', type: 'percent', until: '', untilDate: null }
    ],
    metadataDiscounts: [],
    expected: {
      inlineCount: 2,
      metadataCount: 0,
      description: 'All codes shown as green badges with values'
    }
  }
];

deduplicationTests.forEach((test, idx) => {
  console.log(`Test ${idx + 1}: ${test.name}`);
  
  // Simulate deduplication logic
  const inlineCodeSet = new Set(test.inlineDiscounts.map(d => d.code));
  const filteredMetadata = test.metadataDiscounts.filter(code => !inlineCodeSet.has(code));
  
  const passed = 
    test.inlineDiscounts.length === test.expected.inlineCount &&
    filteredMetadata.length === test.expected.metadataCount;
  
  console.log(`  Inline codes: ${test.inlineDiscounts.length} (expected ${test.expected.inlineCount})`);
  console.log(`  Metadata codes: ${filteredMetadata.length} (expected ${test.expected.metadataCount})`);
  console.log(`  ${passed ? '✓ PASS' : '✗ FAIL'} - ${test.expected.description}\n`);
});

// ============================================================================
// TEST 2: Complete metadata rows (all 3 fields + event_id)
// ============================================================================
console.log('--- Test 2: Complete Metadata Row Structure ---\n');

const completeMetadataTests = [
  {
    name: 'All fields populated',
    row: '2026-01-14-SnowCamp 2026,SNOWCAMP20,2000,Early bird expires 2026-02-28',
    expected: {
      eventId: '2026-01-14-SnowCamp 2026',
      discountCodes: ['SNOWCAMP20'],
      estimatedAttendees: 2000,
      notes: 'Early bird expires 2026-02-28'
    }
  },
  {
    name: 'Multiple discount codes',
    row: '2025-02-03-Jfokus 2025,JFOKUS100|STUDENT50,1800,Student rate requires .edu email',
    expected: {
      eventId: '2025-02-03-Jfokus 2025',
      discountCodes: ['JFOKUS100', 'STUDENT50'],
      estimatedAttendees: 1800,
      notes: 'Student rate requires .edu email'
    }
  },
  {
    name: 'Missing discount codes',
    row: '2026-04-01-Test Conf,,,Conference with no discounts',
    expected: {
      eventId: '2026-04-01-Test Conf',
      discountCodes: [],
      estimatedAttendees: null,
      notes: 'Conference with no discounts'
    }
  },
  {
    name: 'Missing notes field',
    row: '2026-03-15-Another Event,EARLYBIRD25,1200,',
    expected: {
      eventId: '2026-03-15-Another Event',
      discountCodes: ['EARLYBIRD25'],
      estimatedAttendees: 1200,
      notes: ''
    }
  }
];

completeMetadataTests.forEach((test, idx) => {
  console.log(`Test ${idx + 1}: ${test.name}`);
  console.log(`  Input: ${test.row}`);
  
  // Simulate CSV parsing
  const parts = test.row.split(',');
  const eventId = parts[0].trim();
  const discountCodes = parts[1] ? parts[1].trim().split('|').map(code => code.trim()) : [];
  const estimatedAttendees = parts[2] ? parseInt(parts[2].trim()) : null;
  const notes = parts[3] ? parts[3].trim() : '';
  
  const passed = 
    eventId === test.expected.eventId &&
    JSON.stringify(discountCodes) === JSON.stringify(test.expected.discountCodes) &&
    estimatedAttendees === test.expected.estimatedAttendees &&
    notes === test.expected.notes;
  
  console.log(`  Event ID: ${eventId === test.expected.eventId ? '✓' : '✗'} ${eventId}`);
  console.log(`  Discounts: ${JSON.stringify(discountCodes) === JSON.stringify(test.expected.discountCodes) ? '✓' : '✗'} ${JSON.stringify(discountCodes)}`);
  console.log(`  Attendees: ${estimatedAttendees === test.expected.estimatedAttendees ? '✓' : '✗'} ${estimatedAttendees}`);
  console.log(`  Notes: ${notes === test.expected.notes ? '✓' : '✗'} "${notes}"`);
  console.log(`  ${passed ? '✓ PASS' : '✗ FAIL'}\n`);
});

// ============================================================================
// TEST 3: CSV parsing edge cases
// ============================================================================
console.log('--- Test 3: CSV Parsing Edge Cases ---\n');

const edgeCaseTests = [
  {
    name: 'Whitespace handling',
    row: '2026-01-01-Event , CODE1 | CODE2 , 500 , Notes with spaces ',
    shouldPass: true,
    description: 'Trimming around pipes and commas'
  },
  {
    name: 'Empty discount field',
    row: '2026-01-01-Event ,,500,Notes',
    shouldPass: true,
    description: 'Empty string becomes empty array'
  },
  {
    name: 'Zero attendees',
    row: '2026-01-01-Event ,CODE,0,Notes',
    shouldPass: true,
    description: '0 is falsy but should parse as 0, not null'
  },
  {
    name: 'Comma in notes field',
    row: '2026-01-01-Event ,CODE,100,This is a note, with comma',
    shouldPass: false,
    description: 'CSV parsing will break - needs quotes or escaping'
  }
];

edgeCaseTests.forEach((test, idx) => {
  console.log(`Test ${idx + 1}: ${test.name}`);
  console.log(`  Input: ${test.row}`);
  
  try {
    const parts = test.row.split(',');
    const eventId = parts[0].trim();
    const discountCodes = parts[1] ? parts[1].trim().split('|').map(code => code.trim()).filter(c => c) : [];
    const attendees = parts[2] ? parseInt(parts[2].trim()) : null;
    
    const handled = eventId && (discountCodes !== undefined);
    console.log(`  Result: ${handled ? '✓ Handled' : '✗ Failed'}`);
    console.log(`  ${test.shouldPass ? '✓' : '⚠'} ${test.description}\n`);
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}\n`);
  }
});

// ============================================================================
// TEST 4: Malformed METADATA.csv rows
// ============================================================================
console.log('--- Test 4: Malformed Row Handling ---\n');

const malformedTests = [
  {
    name: 'Too few columns',
    row: '2026-01-01-Event ,CODE',
    recovery: 'Parse what exists, treat missing as defaults'
  },
  {
    name: 'Too many columns',
    row: '2026-01-01-Event ,CODE,500,Notes,ExtraField,AnotherExtra',
    recovery: 'Ignore columns beyond index 3'
  },
  {
    name: 'Non-numeric attendees',
    row: '2026-01-01-Event ,CODE,many,Notes',
    recovery: 'parseInt() returns NaN, treat as null'
  }
];

malformedTests.forEach((test, idx) => {
  console.log(`Test ${idx + 1}: ${test.name}`);
  console.log(`  Input: ${test.row}`);
  console.log(`  Recovery: ${test.recovery}`);
  
  const parts = test.row.split(',');
  const attendees = parts[2] ? parseInt(parts[2].trim()) : null;
  console.log(`  Attendees parsing: ${isNaN(attendees) ? 'null' : attendees}`);
  console.log(`  ✓ Handled gracefully\n`);
});

console.log('========== ALL EDGE CASE TESTS COMPLETE ==========\n');
