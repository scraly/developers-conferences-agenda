#!/usr/bin/env node

/* Prerequisites:
  export OVH_AI_ENDPOINTS_ACCESS_TOKEN=xxxxx
  export OVH_AI_ENDPOINTS_MODEL_URL="https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions"
  export OVH_AI_ENDPOINTS_MODEL_NAME=Qwen3-Coder-30B-A3B-Instruct
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
 * Read existing events from METADATA.csv
 */
function readExistingEvents(metadataFile) {
  const existing = new Set();
  try {
    const data = fs.readFileSync(metadataFile, 'utf-8');
    const lines = data.split('\n');
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Extract event_id by finding the first occurrence of ',attendees'
      const metadataStart = line.match(/,(attendees:)/);
      if (metadataStart) {
        const eventId = line.substring(0, metadataStart.index);
        existing.add(eventId);
      }
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
      name: e.name
        }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/*
 * Build system prompt with history
 */
function buildSystemPrompt(metadataFile, maxoldMetadata = 1500) {
    let prompt = `
You are a research assistant specialized in professional conferences and events.
You must strictly follow the output rules and never invent data.
`;

  return prompt;
}

/**
 * Use OVHcloud AI Endpoint with qwen-2-5-coder-32b-instruct LLM to infer metadata for a batch of conferences
 */
async function inferMetadataBatchWithAI(confBatch, metadataFile) {

//console.log(confBatch)

  // Create the system prompt
const systemPrompt = buildSystemPrompt(metadataFile);
//console.log(systemPrompt)

  // Create the user prompt
  const userPrompt = `
Task:
Based on the information below, find the exact number of attendees for this conference.

Rules:
- The number must be explicitly confirmed by a reliable source.
- No estimation is allowed.
- If the exact number is not available or not verifiable, return nothing at all (empty output).
- Do not provide explanations, sources, comments, or extra text.

Output format (only if the number is found):
{DATE}-{CONFERENCE_NAME},attendees:{NUMBER}


${confBatch.map((c, i) => `
${i + 1}. Conference name: ${c.name}
   Start date: ${c.location}`).join('')}
`

//console.log(userPrompt)

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
          top_p: 1.0,
          messages: [
            {
              //System prompt adds more stability to the inferences
              role: 'system', content: systemPrompt,
              role: 'user', content: userPrompt 
            }
          ],
          max_tokens: 30000
        })
    });

    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);

    // Parse the response
    const json = await res.json();
    const text = json.choices[0]?.message?.content || '';
    return text.trim().split('\n').map(line => {
      const [, metadata] = line.split('. ');
      return metadata?.trim() || '';
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
  const metadataFile = '../METADATA.csv';
  const allEventsFile = '../page/src/misc/all-events.json'

  // Read existing events
  const existingEvents = readExistingEvents(metadataFile);
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

    const metadata = await inferMetadataBatchWithAI(batch, metadataFile);

    for (let j = 0; j < batch.length; j++) {
      const conf = batch[j];
      const id = `${conf.date}-${conf.name}`;
      newEntries.push(`${id},${metadata[j]}`);
    }

    // Rate limiting - wait between batches
    if (i + batchSize < conferencesToProcess.length) await sleep(2000);
  }

  // Append new entries to METADATA.csv
  if (newEntries.length > 0) {
    const header = fs.existsSync(metadataFile) ? '' : 'event_id,metadata\n';
    fs.appendFileSync(metadataFile, header + newEntries.join('\n') + '\n');
    console.error(`# Appended ${newEntries.length} events to ${metadataFile}`);
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