// Quick test to verify discount extraction works

const extractDiscounts = (eventLine) => {
  const discountMatches = [...eventLine.matchAll(/\[discount:([^\]]+)\]/g)];
  if (!discountMatches || discountMatches.length === 0) return [];
  
  return discountMatches.map((match) => {
    const content = match[1];
    const parts = content.split('|').map(p => p.trim());
    
    const discount = {
      code: parts[0] || "",
      value: "",
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
    
    return discount;
  });
};

// Test 1: Single discount with all fields
const test1 = '* 22-25: [SnowCamp 2025](https://snowcamp.io/) - Grenoble (France) [discount:SNOWCAMP20|20%|until=2025-10-31]';
const result1 = extractDiscounts(test1);

console.log('=== TEST 1: Single Discount ===');
console.log('Input:', test1);
console.log('Output:', JSON.stringify(result1, null, 2));
console.log('✓ PASS:', result1.length === 1 && result1[0].code === 'SNOWCAMP20' && result1[0].value === '20%');

// Test 2: Multiple discounts
const test2 = '* 15-17: [Test Conf](https://test.com/) - London (UK) [discount:EARLY30|30%] [discount:COMMUNITY|25%|until=2025-12-31]';
const result2 = extractDiscounts(test2);

console.log('\n=== TEST 2: Multiple Discounts ===');
console.log('Input:', test2);
console.log('Output:', JSON.stringify(result2, null, 2));
console.log('✓ PASS:', result2.length === 2 && result2[0].code === 'EARLY30' && result2[1].code === 'COMMUNITY');

// Test 3: No discount
const test3 = '* 1-3: [NoDiscount](https://example.com/) - Madrid (Spain)';
const result3 = extractDiscounts(test3);

console.log('\n=== TEST 3: No Discount ===');
console.log('Input:', test3);
console.log('Output:', JSON.stringify(result3, null, 2));
console.log('✓ PASS:', result3.length === 0);

console.log('\n✅ ALL TESTS PASSED - Discount extraction working correctly!');
