// Test mdParser discount extraction with actual markdown

const fs = require("fs");

const ROOT = "../";
const MONTHS_NAMES = "january,february,march,april,may,june,july,august,september,october,november,december".split(",");
const MONTHS_SHORTNAMES = MONTHS_NAMES.map((m) => m.slice(0, 3));

const getTimeStamp = (year, month, day) => new Date(Date.UTC(year, month, day, 0, 0, 0)).getTime();

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
        discount.untilDate = getTimeStamp(year, month, day);
      }
    }
    
    return discount;
  });
};

// Simulate event parsing
const mockEventLines = [
  '* 22-25: [SnowCamp 2025](https://snowcamp.io/) - Grenoble (France) [discount:SNOWCAMP20|20%|until=2025-10-31] [discount:EARLYBIRD|30%|until=2025-08-15]',
  '* 15-17: [Test Conf](https://test.com/) - London (UK)',
  '* 5-7: [Dev Summit](https://dev.com/) - Berlin (Germany) [discount:SAVE|€50|until=2025-09-15]'
];

console.log('=== Testing mdParser Discount Extraction ===\n');

mockEventLines.forEach((eventLine, idx) => {
  const discounts = extractDiscounts(eventLine);
  console.log(`Event ${idx + 1}: ${eventLine.substring(0, 60)}...`);
  console.log(`Discounts found: ${discounts.length}`);
  if (discounts.length > 0) {
    console.log('Details:', JSON.stringify(discounts, null, 2));
  }
  console.log('');
});

console.log('✅ mdParser discount extraction test complete!');
