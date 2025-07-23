#!/usr/bin/env node

/* Prerequisites:
  export OVH_AI_ENDPOINTS_ACCESS_TOKEN=xxxxx
  export OVH_AI_ENDPOINTS_MODEL_URL="https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions"
  export OVH_AI_ENDPOINTS_MODEL_NAME=Qwen2.5-Coder-32B-Instruct
*/

const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/*
 * Check the existence of mandatory OVH_AI_ENDPOINTS_* environment variables to connect and use OVHcloud AI Endpoints
 */
['OVH_AI_ENDPOINTS_ACCESS_TOKEN', 'OVH_AI_ENDPOINTS_MODEL_URL', 'OVH_AI_ENDPOINTS_MODEL_NAME'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`# Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

/**
 * Read existing events from TAGS.csv
 */
function readExistingEvents(tagsFile) {
  const existing = new Set();
  try {
    const data = fs.readFileSync(tagsFile, 'utf-8');
    const lines = data.split('\n');
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const [eventId] = line.split(',');
      existing.add(eventId.replace(/^"|"$/g, ''));
    }
  } catch {}
  return existing;
}

/**
 * Read all conferences and sort by date
 */
function readConferences(allEventsFile) {
  const filePath = path.join(__dirname, allEventsFile);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const now = Date.now();

  return json
    .filter(e => e.date && e.date[0] >= now)
    .map(e => ({
      date: new Date(e.date[0]).toISOString().split('T')[0],
      name: e.name,
      location: e.location,
      url: e.hyperlink || 'N/A'
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Use OVHcloud AI Endpoint with qwen-2-5-coder-32b-instruct LLM to infer tags for a batch of conferences
 */
async function inferTagsBatchWithAI(confBatch) {
  // Create the batch prompt
  const prompt = `
Based on the TAGS.csv format, infer appropriate tags for each conference:
${confBatch.map((c, i) => `
${i + 1}. Name: ${c.name}
   Location: ${c.location}
   URL: ${c.url}`).join('')}
Use the same tag categories from TAGS.csv:
- tech: (javascript, python, java, rust, go, php, ruby, docker, kubernetes, aws, azure, gcp, etc.)
- topic: (security, web-development, devops, mobile, ai, data, cloud, open-source, testing, etc.)  
- language: (english, french, spanish, german, dutch, italian, portuguese, etc.)

Return the results in this exact format, one line per conference:
1. tech:javascript,language:english
2. topic:security,language:french
3. tech:python,language:english
etc.

Multiple tags of the same type should be repeated, for example:

3. tech:python,topic:web-development,topic:ai,language:english

Only return the numbered list with tags, nothing else.
`;

  try {
      const res = await fetch(process.env.OVH_AI_ENDPOINTS_MODEL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OVH_AI_ENDPOINTS_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OVH_AI_ENDPOINTS_MODEL_NAME,
          temperature: 0.0,
          top_P: 1.0,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000
        })
    });

    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);

    // Parse the response
    const json = await res.json();
    const text = json.choices[0]?.message?.content || '';
    return text.trim().split('\n').map(line => {
      const [, tags] = line.split('. ');
      return tags?.trim() || 'language:english';
    });

  } catch (err) {
    console.error(`# Error: ${err.message}`);
    return confBatch.map(conf => {
      const loc = conf.location.toLowerCase();
      if (loc.includes('france')) return 'language:french';
      if (loc.includes('spain')) return 'language:spanish';
      return 'language:english';
    });
  }
}

/**
 * Sleep helper function
 */
function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/**
 * Main function
 */
async function main() {
  const tagsFile = '../TAGS.csv';
  const allEventsFile = '../page/src/misc/all-events.json'

  // Read existing events
  const existingEvents = readExistingEvents(tagsFile);
  console.error(`# Found ${existingEvents.size} existing events`);

  // Read all conferences
  const allConfs = readConferences(allEventsFile);
  console.error(`# Found ${allConfs.length} future conferences`);

  // Find conferences that need processing
  const conferencesToProcess = [];
  for (const conf of allConfs) {
    //TODO: fix an error in event's name containing comma, accents, quote, or spaces
    const eventId = `${conf.date}-${conf.name}`;
    if (!existingEvents.has(eventId)) {
      conferencesToProcess.push(conf);
    }
  }

  // Don't call API if there is no new conference to process
  if (conferencesToProcess.length === 0) {
    console.error('# No new conferences to process. Exiting.');
    return;
  }

  console.error(`# Need to process ${conferencesToProcess.length} conferences`);

  // Process conferences in batches
  const batchSize = 30;

  const newEntries = [];

  for (let i = 0; i < conferencesToProcess.length; i += batchSize) {
    const batch = conferencesToProcess.slice(i, i + batchSize);
    console.error(`# Batch ${i / batchSize + 1}: ${batch.length} conferences`);

    const tags = await inferTagsBatchWithAI(batch);

    for (let j = 0; j < batch.length; j++) {
      const conf = batch[j];
      const id = `${conf.date}-${conf.name}`;
      newEntries.push(`${id},${tags[j]}`);
    }

    // Rate limiting - wait between batches
    if (i + batchSize < conferencesToProcess.length) await sleep(2000);
  }

  // Append new entries to TAGS.csv
  if (newEntries.length > 0) {
    const header = fs.existsSync(tagsFile) ? '' : 'event_id,tags\n';
    fs.appendFileSync(tagsFile, header + newEntries.join('\n') + '\n');
    console.error(`# Appended ${newEntries.length} events to ${tagsFile}`);
  } else {
    console.error('# No new events to add');
  }
}

// Run the script
if (require.main === module) {
  main().catch(err => {
    console.error('# Fatal error:', err);
    process.exit(1);
  });
}