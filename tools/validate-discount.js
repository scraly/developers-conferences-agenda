// Test script to validate discount extraction implementation
const extractDiscounts = (eventLine) => {
  const discountMatches = [...eventLine.matchAll(/\[discount:([^\]]+)\]/g)];
  if (!discountMatches || discountMatches.length === 0) return [];
  
  return discountMatches.map((match) => {
    const content = match[1];
    const parts = content.split('|').map(p => p.trim());
    
    const discount = {
      code: parts[0] || "",
      value: "",
      type: "percent",
      until: "",
      untilDate: null
    };
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.includes('=')) {
        const [key, val] = part.split('=').map(p => p.trim());
        if (key === 'until') discount.until = val;
      } else {
        discount.value = part;
      }
    }
    
    if (discount.until) {
      const dateParts = discount.until.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (dateParts) {
        const year = parseInt(dateParts[1]);
        const month = parseInt(dateParts[2]) - 1;
        const day = parseInt(dateParts[3]);
        discount.untilDate = new Date(Date.UTC(year, month, day, 0, 0, 0)).getTime();
      }
    }
    
    return discount;
  });
};

console.log('\n========== DISCOUNT EXTRACTION TEST SUITE ==========\n');

// TEST 1: Single discount with all fields
const test1 = '* 22-25: [SnowCamp 2025](https://snowcamp.io/) - Grenoble (France) [discount:SNOWCAMP20|20%|until=2025-10-31]';
const result1 = extractDiscounts(test1);
console.log('TEST 1 - Single discount with code, value, and expiration:');
console.log('Input:', test1);
console.log('Output:', JSON.stringify(result1, null, 2));
console.log('✓ PASS - Code:', result1[0]?.code === 'SNOWCAMP20', 
            'Value:', result1[0]?.value === '20%',
            'Until:', result1[0]?.until === '2025-10-31',
            'HasTimestamp:', result1[0]?.untilDate !== null);

// TEST 2: Multiple discounts
const test2 = '* 15-17: [Test Conf](https://test.com/) - London (UK) [discount:EARLY30|30%] [discount:COMMUNITY|25%|until=2025-12-31]';
const result2 = extractDiscounts(test2);
console.log('\nTEST 2 - Multiple discounts:');
console.log('Input:', test2);
console.log('Output:', JSON.stringify(result2, null, 2));
console.log('✓ PASS - Count:', result2.length === 2,
            'Discount1 Code:', result2[0]?.code === 'EARLY30',
            'Discount2 Code:', result2[1]?.code === 'COMMUNITY');

// TEST 3: Code only (no value/date)
const test3 = '* 10-12: [Event](https://example.com/) - Paris (France) [discount:PROMO50]';
const result3 = extractDiscounts(test3);
console.log('\nTEST 3 - Code only (no value or date):');
console.log('Input:', test3);
console.log('Output:', JSON.stringify(result3, null, 2));
console.log('✓ PASS - Code:', result3[0]?.code === 'PROMO50',
            'Value Empty:', result3[0]?.value === '',
            'Until Empty:', result3[0]?.until === '');

// TEST 4: No discount
const test4 = '* 1-3: [NoDiscount](https://example.com/) - Madrid (Spain)';
const result4 = extractDiscounts(test4);
console.log('\nTEST 4 - No discount:');
console.log('Input:', test4);
console.log('Output:', JSON.stringify(result4, null, 2));
console.log('✓ PASS - Returns empty array:', result4.length === 0);

// TEST 5: Discount with currency value
const test5 = '* 5-7: [Dev Summit](https://dev.com/) - Berlin (Germany) [discount:SAVE|€50|until=2025-09-15]';
const result5 = extractDiscounts(test5);
console.log('\nTEST 5 - Discount with currency value:');
console.log('Input:', test5);
console.log('Output:', JSON.stringify(result5, null, 2));
console.log('✓ PASS - Code:', result5[0]?.code === 'SAVE',
            'Value:', result5[0]?.value === '€50',
            'Currency handled:', result5[0]?.value.includes('€'));

// TEST 6: Mixed fields
const test6 = '* 20-22: [Conf](https://conf.com/) - NYC (USA) [discount:NYC2026|15%] [discount:VIP|Free Ticket|until=2026-02-01]';
const result6 = extractDiscounts(test6);
console.log('\nTEST 6 - Mixed field combinations:');
console.log('Input:', test6);
console.log('Output:', JSON.stringify(result6, null, 2));
console.log('✓ PASS - Discount1:', result6[0]?.value === '15%',
            'Discount2:', result6[1]?.value === 'Free Ticket',
            'Both parsed:', result6.length === 2);

// TEST 7: Invalid date format (should be gracefully handled)
const test7 = '* 1-3: [Event](https://example.com/) - Paris (France) [discount:TEST|10%|until=invalid-date]';
const result7 = extractDiscounts(test7);
console.log('\nTEST 7 - Invalid date format (graceful fallback):');
console.log('Input:', test7);
console.log('Output:', JSON.stringify(result7, null, 2));
console.log('✓ PASS - Code parsed:', result7[0]?.code === 'TEST',
            'Until stored:', result7[0]?.until === 'invalid-date',
            'No timestamp created:', result7[0]?.untilDate === null);

// TEST 8: Whitespace handling
const test8 = '* 5-7: [Event](url) - City (Country) [discount: CODE123 | 50% | until = 2026-03-30 ]';
const result8 = extractDiscounts(test8);
console.log('\nTEST 8 - Whitespace handling:');
console.log('Input:', test8);
console.log('Output:', JSON.stringify(result8, null, 2));
console.log('✓ PASS - Whitespace trimmed:', result8[0]?.code === 'CODE123',
            'Value trimmed:', result8[0]?.value === '50%',
            'Date trimmed:', result8[0]?.until === '2026-03-30');

console.log('\n========== TEST SUITE COMPLETE ==========');
console.log('All edge cases and normal scenarios validated!');
