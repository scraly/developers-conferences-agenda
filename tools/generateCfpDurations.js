#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CFP_CSV = path.join(__dirname, '../CFP.csv');
const EVENTS_JSON = path.join(__dirname, '../page/src/misc/all-events.json');
const REQUEST_TIMEOUT_MS = 15000;
const REQUEST_DELAY_MS = 500;
const yearArgument = process.argv.find(argument => argument.startsWith('--year='));
const CURRENT_YEAR = new Date().getUTCFullYear();
const TARGET_YEARS = yearArgument
  ? [Number(yearArgument.slice('--year='.length))]
  : [CURRENT_YEAR, CURRENT_YEAR + 1];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const eventId = event => `${new Date(event.date[0]).toISOString().slice(0, 10)}-${event.name}`;
const getEntryEventId = line => line.match(/^(.*?),(?:talk|workshop):/)?.[1];

const readKnownEventIds = () => {
  if (!fs.existsSync(CFP_CSV)) return new Set();

  return new Set(
    fs.readFileSync(CFP_CSV, 'utf8')
      .split('\n')
      .slice(1)
      .map(line => line.trim())
      .filter(Boolean)
      .map(getEntryEventId)
      .filter(Boolean)
  );
};

const upsertEntries = entries => {
  if (entries.length === 0) return;

  const replacements = new Map(entries.map(entry => [getEntryEventId(entry), entry]));
  const lines = fs.existsSync(CFP_CSV)
    ? fs.readFileSync(CFP_CSV, 'utf8').split('\n').filter(Boolean)
    : ['event_id,duration1,duration2,duration3,duration4,duration5,duration6'];
  const updatedLines = lines.map((line, index) => {
    if (index === 0) return line;
    const id = getEntryEventId(line);
    if (!replacements.has(id)) return line;
    const replacement = replacements.get(id);
    replacements.delete(id);
    const existingDurations = line.slice(id.length + 1).split(',');
    const newDurations = replacement.slice(id.length + 1).split(',');
    return `${id},${[...new Set([...existingDurations, ...newDurations])].join(',')}`;
  });

  fs.writeFileSync(CFP_CSV, `${[...updatedLines, ...replacements.values()].join('\n')}\n`);
};

const htmlToText = html => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script(?:\s+[^>]*)?>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style(?:\s+[^>]*)?>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&quot;/gi, '"')
  .replace(/&amp;/gi, '&')
  .replace(/([\p{Ll}])(\p{Lu})/gu, '$1 $2')
  .replace(/\s+/g, ' ');

const getDurations = (text, type) => {
  const talkLabel = 'talk|session|presentation|lecture|keynote|conference|conférence|short|demo|demos|démo|démos';
  const workshopLabel = 'workshop|training|atelier';
  const label = type === 'talk' ? talkLabel : workshopLabel;
  const allLabels = `${talkLabel}|${workshopLabel}`;
  const durationUnit = 'min|mins|minute|minutes|hour|hours|heure|heures|h';
  const matches = new Set();
  const componentDurations = new Set();
  const questionDurationPattern = new RegExp(`(?:${label})\\b(?:(?!\\b(?:${allLabels})\\b)[^.,;]){0,100}?(\\d{1,3})\\s*(?:-|–)?\\s*(${durationUnit})\\b\\s*(?:\\+|plus|and)\\s*(\\d{1,3})\\s*(?:-|–)?\\s*(${durationUnit})\\b[^.,;]{0,30}?(?:questions?|q\\s*&\\s*a)`, 'gi');
  const patterns = [
    new RegExp(`(?:${label})\\b(?:(?!\\b(?:${allLabels})\\b)[^.,;]){0,100}?(\\d{1,3})\\s*(?:-|–)?\\s*(${durationUnit})\\b`, 'gi'),
    new RegExp(`(\\d{1,3})\\s*(?:-|–)?\\s*(${durationUnit})\\b(?:\\s+[a-z-]+){0,3}?\\s+(?:${label})\\b`, 'gi'),
  ];
  const durationRangePattern = new RegExp(`(?:${label})\\b(?:(?!\\b(?:${allLabels})\\b)[^.,;]){0,100}?(\\d{1,3})\\s*(?:h|hour|hours|heure|heures)\\s*(?:-|–|to|à)\\s*(\\d{1,3})\\s*(?:h|hour|hours|heure|heures)\\b`, 'gi');

  for (const match of text.matchAll(questionDurationPattern)) {
    const duration = (/(?:hour|hours|heure|heures|h)/i.test(match[2]) ? Number(match[1]) * 60 : Number(match[1]))
      + (/(?:hour|hours|heure|heures|h)/i.test(match[4]) ? Number(match[3]) * 60 : Number(match[3]));
    if (duration > 0 && duration <= 480) {
      componentDurations.add(Number(match[1]));
      matches.add(duration);
    }
  }

  if (type === 'workshop') {
    const halfDayPattern = new RegExp(`(?:${workshopLabel})\\b[^.,;]{0,40}?\\bhalf[- ]day\\b`, 'gi');
    const fullDayPattern = new RegExp(`(?:${workshopLabel})\\b[^.,;]{0,40}?\\bfull[- ]day\\b`, 'gi');
    if (halfDayPattern.test(text)) matches.add('half-day');
    if (fullDayPattern.test(text)) matches.add('full-day');
  }

  for (const match of text.matchAll(durationRangePattern)) {
    matches.add(Number(match[1]) * 60);
    matches.add(Number(match[2]) * 60);
  }

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const value = Number(match[1]);
      const minutes = /^(hour|hours|heure|heures|h)$/i.test(match[2]) ? value * 60 : value;
      const precedingText = text.slice(Math.max(0, match.index - 50), match.index);
      const followsTalk = type === 'workshop'
        && new RegExp(`\\b(?:${talkLabel})\\b[^.,;]{0,50}$`, 'i').test(precedingText)
        && !new RegExp(`\\b(?:${workshopLabel})\\b`, 'i').test(precedingText);
      if (minutes > 0 && minutes <= 480 && !componentDurations.has(value) && !followsTalk) matches.add(minutes);
    }
  }

  return [...matches].sort((first, second) => Number(first) - Number(second)).map(duration => `${type}:${duration}`);
};

const extractDurations = html => {
  const text = htmlToText(html);
  return [...getDurations(text, 'talk'), ...getDurations(text, 'workshop')];
};

const fetchCfpPage = async url => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
};

async function main() {
  const refresh = process.argv.includes('--refresh');
  const allEvents = JSON.parse(fs.readFileSync(EVENTS_JSON, 'utf8'));
  const knownEventIds = refresh ? new Set() : readKnownEventIds();
  const cfpEvents = allEvents.filter(event => (
    event.cfp?.link
    && TARGET_YEARS.includes(new Date(event.date[0]).getUTCFullYear())
  ));
  const events = cfpEvents.filter(event => (
    !knownEventIds.has(eventId(event))
  ));
  let entriesWritten = 0;

  console.error(`# Searching talk durations for ${events.length} CFPs in ${TARGET_YEARS.join(' and ')}`);
  if (!refresh) console.error(`# Skipping ${cfpEvents.length - events.length} CFPs already recorded in CFP.csv`);
  for (const event of events) {
    try {
      const durations = extractDurations(await fetchCfpPage(event.cfp.link));
      if (durations.length > 0) {
        upsertEntries([`${eventId(event)},${durations.join(',')}`]);
        entriesWritten++;
        console.error(`# Found ${durations.join(', ')} for ${event.name}`);
      }
    } catch (error) {
      console.error(`# Could not read ${event.cfp.link}: ${error.message}`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  console.error(`# Added or updated ${entriesWritten} CFP duration entries`);
}

if (require.main === module) {
  main().catch(error => {
    console.error('# Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { extractDurations };