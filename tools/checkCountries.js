const events = require('../page/src/misc/all-events.json');

// ISO 3166-1 alpha-2 whitelist (extended for dataset coverage)
const VALID_COUNTRY_CODES = new Set([
  'AF','AL','DZ','AR','AU','AT','BD','BE','BG','BR','CA','CH','CL','CN','CO','CR','CZ','DE','DK','DO','EC','EE','EG','ES','FI','FR','GB','GH','GR','HK','HR','HU','ID','IE','IL','IN','IQ','IS','IT','JM','JP','KE','KR','KW','KZ','LK','LT','LU','LV','MA','MX','MY','NG','NL','NO','NZ','OM','PA','PE','PH','PK','PL','PT','PY','QA','RO','RS','RU','SA','SE','SG','SI','SK','TH','TN','TR','TW','TZ','UA','UG','US','UY','VN','ZA','ZW',
  'BA','BY','MK','MT','BF','GE','LB','GM','BI','ZM','SN','LA','BO','SV','KY','NA','HN','NI','GT','UZ','NE','SO','TG','RW','MU','TT','CI','AM','MQ','RE','AE','CD','CG','XK','NP','AO','CM','JO','ET','BJ','TM','LI','MC','AD','ST'
]);

// Accept common country names from the dataset and map them to ISO alpha-2
// Keys must be uppercase and diacritics-stripped for robust matching
const COUNTRY_NAME_TO_CODE = {
  'UNITED STATES': 'US',
  'USA': 'US',
  'UNITED STATES OF AMERICA': 'US',
  'UNITED KINGDOM': 'GB',
  'UK': 'GB',
  'SCOTLAND': 'GB',
  'WALES': 'GB',
  'NORTHERN IRELAND': 'GB',
  'FRANCE': 'FR',
  'GERMANY': 'DE',
  'NETHERLANDS': 'NL',
  'SPAIN': 'ES',
  'PORTUGAL': 'PT',
  'ITALY': 'IT',
  'SWITZERLAND': 'CH',
  'SWEDEN': 'SE',
  'NORWAY': 'NO',
  'DENMARK': 'DK',
  'FINLAND': 'FI',
  'POLAND': 'PL',
  'CZECHIA': 'CZ',
  'CZECH REPUBLIC': 'CZ',
  'AUSTRIA': 'AT',
  'BELGIUM': 'BE',
  'LUXEMBOURG': 'LU',
  'IRELAND': 'IE',
  'HUNGARY': 'HU',
  'ROMANIA': 'RO',
  'BULGARIA': 'BG',
  'GREECE': 'GR',
  'CROATIA': 'HR',
  'SERBIA': 'RS',
  'SLOVAKIA': 'SK',
  'SLOVENIA': 'SI',
  'LITHUANIA': 'LT',
  'LATVIA': 'LV',
  'ESTONIA': 'EE',
  'UKRAINE': 'UA',
  'RUSSIA': 'RU',
  'TURKEY': 'TR',
  'TURKIYE': 'TR',
  'ISRAEL': 'IL',
  'SAUDI ARABIA': 'SA',
  'UNITED ARAB EMIRATES': 'AE',
  'UAE': 'AE',
  'QATAR': 'QA',
  'EGYPT': 'EG',
  'MOROCCO': 'MA',
  'TUNISIA': 'TN',
  'SOUTH AFRICA': 'ZA',
  'KENYA': 'KE',
  'NIGERIA': 'NG',
  'GHANA': 'GH',
  'TANZANIA': 'TZ',
  'UGANDA': 'UG',
  'ETHIOPIA': 'ET',
  'CANADA': 'CA',
  'MEXICO': 'MX',
  'BRAZIL': 'BR',
  'ARGENTINA': 'AR',
  'CHILE': 'CL',
  'COLOMBIA': 'CO',
  'PERU': 'PE',
  'URUGUAY': 'UY',
  'DOMINICAN REPUBLIC': 'DO',
  'PANAMA': 'PA',
  'COSTA RICA': 'CR',
  'AUSTRALIA': 'AU',
  'NEW ZEALAND': 'NZ',
  'JAPAN': 'JP',
  'SOUTH KOREA': 'KR',
  'KOREA': 'KR',
  'CHINA': 'CN',
  'HONG KONG': 'HK',
  'SINGAPORE': 'SG',
  'MALAYSIA': 'MY',
  'THAILAND': 'TH',
  'VIETNAM': 'VN',
  'INDONESIA': 'ID',
  'PHILIPPINES': 'PH',
  'INDIA': 'IN',
  'PAKISTAN': 'PK',
  'BANGLADESH': 'BD',
  'SRI LANKA': 'LK',
  'KAZAKHSTAN': 'KZ',
  'ICELAND': 'IS',
  'LIECHTENSTEIN': 'LI',
  'MONACO': 'MC',
  'ANDORRA': 'AD',
  // Additional mappings from observed dataset
  'BELARUS': 'BY',
  'BOSNIA AND HERZEGOVINA': 'BA',
  'MALTA': 'MT',
  'MACEDONIA': 'MK',
  'NORTH MACEDONIA': 'MK',
  'GEORGIA': 'GE',
  'LEBANON': 'LB',
  'GAMBIA': 'GM',
  'BURUNDI': 'BI',
  'ZAMBIA': 'ZM',
  'SENEGAL': 'SN',
  'LAOS': 'LA',
  'BOLIVIA': 'BO',
  'EL SALVADOR': 'SV',
  'ECUADOR': 'EC',
  'CAYMAN ISLANDS': 'KY',
  'NAMIBIA': 'NA',
  'HONDURAS': 'HN',
  'NICARAGUA': 'NI',
  'GUATEMALA': 'GT',
  'UZBEKISTAN': 'UZ',
  'NIGER': 'NE',
  'SOMALIA': 'SO',
  'TOGO': 'TG',
  'RWANDA': 'RW',
  'MAURITIUS': 'MU',
  'TRINIDAD': 'TT', // often shorthand for Trinidad and Tobago
  'TRINIDAD AND TOBAGO': 'TT',
  'IVORY COAST': 'CI',
  'COTE DIVOIRE': 'CI',
  'COTE D IVOIRE': 'CI',
  'BENIN': 'BJ',
  'ANGOLA': 'AO',
  'ARMENIA': 'AM',
  'MARTINIQUE': 'MQ',
  'LA REUNION': 'RE',
  'KOSOVO': 'XK',
  'ALGERIA': 'DZ',
  'BURKINA FASO': 'BF',
  'TAIWAN': 'TW',
  'JORDAN': 'JO',
  'NEPAL': 'NP',
  'ZIMBABWE': 'ZW',
  'CAMEROON': 'CM',
  'CONGO': 'CG',
  'TURKMENISTAN': 'TM',
  // Congo variants - ambiguous "CONGO" left unmapped intentionally
  'REPUBLIC OF THE CONGO': 'CG',
  'DEMOCRATIC REPUBLIC OF THE CONGO': 'CD',
  'BOSNIA HERZEGOVINA': 'BA',
  'REPUBLIC OF KOREA': 'KR',
  'SAO TOME AND PRINCIPE': 'ST'
};

const VIRTUAL_KEYWORDS = ['virtual', 'virtualized', 'online', 'remote', 'hybrid'];

// Compiled regex for faster virtual event detection
const VIRTUAL_REGEX = /virtual|virtualized|online|remote|hybrid/i;

/**
 * Removes diacritical marks (accents) from a string using Unicode normalization.
 * NFD (Canonical Decomposition) separates characters from their diacritics,
 * then we remove the combining diacritical marks (U+0300 to U+036F).
 * Example: "Côte" → "Cote", "Réunion" → "Reunion"
 * @param {string} str - Input string
 * @returns {string} String with diacritics removed
 */
function stripDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalizes raw country input (name or code) to ISO 3166-1 alpha-2 code.
 * Handles diacritics, case variations, and punctuation.
 * @param {*} raw - Raw country name, code, or any value
 * @returns {string|undefined} ISO alpha-2 code, 'ONLINE' for virtual, or undefined if invalid
 */
function normalizeToCode(raw) {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const cleanedUpper = stripDiacritics(trimmed)
    .toUpperCase()
    .replace(/[^A-Z ]/g, '') // remove punctuation/zero-width/non-ASCII
    .replace(/\s+/g, ' ')    // collapse spaces
    .trim();
  if (cleanedUpper === 'ONLINE') return 'ONLINE';
  return COUNTRY_NAME_TO_CODE[cleanedUpper] ?? cleanedUpper; // assume it is already a code
}

/**
 * Detects if an event is virtual/online based on status, name, or location fields.
 * Uses compiled regex for better performance than array iteration.
 * @param {Object} event - Event object with optional status, name, location fields
 * @returns {boolean} True if event appears to be virtual/online
 */
function isVirtualEvent(event) {
  return VIRTUAL_REGEX.test(event?.status ?? '') ||
         VIRTUAL_REGEX.test(event?.name ?? '') ||
         VIRTUAL_REGEX.test(event?.location ?? '');
}

/**
 * Extracts country from location string in formats like "City (Country)" or "City, Country".
 * Tries parentheses first, then falls back to last part after / or , delimiter.
 * @param {string} location - Location string
 * @returns {{ code: string|undefined, value: string } | null} Normalized code and original value, or null
 */
function extractCountryFromLocation(location) {
  if (typeof location !== 'string') return null;

  // Try parentheses first: "City (Country)" or "City (Region (Country))"
  // Extract all parentheses matches and use the last one (handles nested cases)
  const parenMatches = location.match(/\(([^)]+)\)/g);
  if (parenMatches && parenMatches.length > 0) {
    const lastMatch = parenMatches[parenMatches.length - 1];
    const value = lastMatch.slice(1, -1).trim(); // remove ( and )
    const normalized = normalizeToCode(value);
    return { code: normalized, value };
  }

  // Try last part after slash or comma: "City, Country" or "City / Country"
  const parts = location
    .split(/[\/,]/)
    .map(p => p.trim())
    .filter(Boolean);

  if (parts.length > 0) {
    const tail = parts[parts.length - 1];
    const normalized = normalizeToCode(tail);
    return { code: normalized, value: tail };
  }

  return null;
}

/**
 * Validates country codes in events against ISO 3166-1 alpha-2 standard.
 * Skips virtual/online events. Attempts to extract country from location if not provided.
 * @param {Array} inputEvents - Array of event objects with optional country/location fields
 * @returns {Array<string>} Array of error messages; empty if all valid
 * @throws Returns validation errors as strings in the array, never throws exceptions
 */
function checkCountries(inputEvents) {
  if (!Array.isArray(inputEvents)) {
    return ['Events input must be an array'];
  }

  const errors = [];

  inputEvents.forEach((event, idx) => {
    // Validate event is an object
    if (!event || typeof event !== 'object') {
      errors.push(`Event at index ${idx} is not a valid object`);
      return;
    }

    const displayName = event?.name || `event@${idx}`;
    const identifier = event?.id || event?.slug || event?.url;
    const eventLabel = identifier ? `${displayName} (${identifier})` : displayName;

    // Skip virtual/online events
    if (isVirtualEvent(event)) return;

    // Primary: try country field
    let normalized = normalizeToCode(event?.country);
    let sourceValue = event?.country ?? '';

    // Fallback: extract from location
    if (!normalized && event?.location) {
      const extracted = extractCountryFromLocation(event.location);
      if (extracted?.code) {
        // Only use extracted value if it looks like a valid country code/name
        // Reject if it's too long (likely a city or full address)
        const cleanExtracted = extracted.code.replace(/[^A-Z]/g, '');
        if (cleanExtracted.length <= 20) { // Reasonable max for country names
          normalized = extracted.code;
          sourceValue = extracted.value;
        }
      }
    }

    // Check if we have a code
    if (!normalized) {
      errors.push(
        `Missing country code for "${eventLabel}" ` +
        `(country: "${event?.country ?? ''}", location: "${event?.location ?? ''}")`
      );
      return;
    }

    // ONLINE is valid
    if (normalized === 'ONLINE') return;

    // Warn about ambiguous CONGO
    const sourceUpper = sourceValue.toUpperCase().trim();
    if (sourceUpper === 'CONGO') {
      errors.push(
        `Ambiguous country "${event?.country}" for "${eventLabel}". ` +
        `Please specify "Republic of the Congo" (CG) or "Democratic Republic of the Congo" (CD)`
      );
      return;
    }
    if (sourceUpper === 'THE NETHERLANDS') {
      errors.push(
        `Ambiguous country "${event?.country}" for "${eventLabel}". ` +
        `Please specify "Netherlands"`
      );
      return;
    }

    // Normalize to uppercase for comparison
    const codeUpper = normalized.toUpperCase();

    // Validate format: must be exactly 2 letters for valid ISO 3166-1 alpha-2 codes
    if (!/^[A-Z]{2}$/.test(codeUpper)) {
      errors.push(
        `Invalid country code format "${sourceValue}" ` +
        `(normalized: "${codeUpper}") for "${eventLabel}"; ` +
        `expected 2-letter ISO 3166-1 alpha-2 code`
      );
      return;
    }

    // Validate against whitelist
    if (!VALID_COUNTRY_CODES.has(codeUpper)) {
      errors.push(
        `Invalid country code "${sourceValue}" ` +
        `(normalized: "${codeUpper}") for "${eventLabel}"; ` +
        `expected ISO 3166-1 alpha-2`
      );
    }
  });

  return errors;
}

if (require.main === module) {
  const errors = checkCountries(events);
  if (errors.length > 0) {
    errors.forEach((err) => console.error(err));
    process.exit(1);
  }
  console.log('found 0 wrong countries');
}

module.exports = { checkCountries, VALID_COUNTRY_CODES, COUNTRY_NAME_TO_CODE, VIRTUAL_KEYWORDS };
