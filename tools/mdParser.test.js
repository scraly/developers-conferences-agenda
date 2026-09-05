const { parseDiscount, parseMetadataCSV } = require('../tools/mdParser');

describe('parseDiscount', () => {
  it('parses code only', () => {
    expect(parseDiscount('SNOWCAMP20')).toEqual({ code: 'SNOWCAMP20' });
  });
  it('parses code and percentage', () => {
    expect(parseDiscount('SNOWCAMP20|20%')).toEqual({ code: 'SNOWCAMP20', percentage: '20%' });
  });
  it('parses code, percentage, and until', () => {
    expect(parseDiscount('SNOWCAMP20|20%|until=2026-10-31')).toEqual({ code: 'SNOWCAMP20', percentage: '20%', until: '2026-10-31' });
  });
  it('returns undefined for empty', () => {
    expect(parseDiscount('')).toBeUndefined();
  });
});

describe('parseMetadataCSV', () => {
  it('parses discount and attendees', () => {
    const csv = '2026-02-10-Voxxed Days CERN,attendees:1200,discount:SNOWCAMP20|20%|until=2026-10-31';
    const meta = parseMetadataCSV(csv);
    expect(meta['2026-02-10-Voxxed Days CERN'].attendees).toBe(1200);
    expect(meta['2026-02-10-Voxxed Days CERN'].discount).toEqual({ code: 'SNOWCAMP20', percentage: '20%', until: '2026-10-31' });
  });
  it('parses discount only', () => {
    const csv = '2026-03-15-DevFest Paris,discount:DEVFEST15';
    const meta = parseMetadataCSV(csv);
    expect(meta['2026-03-15-DevFest Paris'].discount).toEqual({ code: 'DEVFEST15' });
  });
  it('handles missing discount', () => {
    const csv = '2026-04-20-JSConf EU,attendees:800';
    const meta = parseMetadataCSV(csv);
    expect(meta['2026-04-20-JSConf EU'].discount).toBeUndefined();
  });
});
