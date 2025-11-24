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
      // Extract event_id by finding the first occurrence of ',tech:' or ',topic:' or ',language:'
      const tagStart = line.match(/,(tech:|topic:|language:)/);
      if (tagStart) {
        const eventId = line.substring(0, tagStart.index);
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
      name: e.name,
      location: e.location,
      url: e.hyperlink || 'N/A'
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/*
 * Build system prompt with history
 */
//TODO: optimize the number of tags history
function buildSystemPrompt(tagsFile, maxOldTags = 1500) {
    let prompt = `You are a tagging assistant specialized in classifying technical conferences using structured tags.

Your goal is to assign relevant tags to each conference using the format and tag vocabulary defined below. You also have access to a history of previously tagged conferences — use it to infer consistent tagging patterns and avoid hallucinations.

Tag format rules:
- Use comma-separated key:value tags.
- Always include at least:
  - 1+ \`tech\`: tags (technology stack or tools)
  - 1+ \`topic\`: tags (themes, content areas, or focus)
  - 1 \`language\`: tag (main conference language)

Only use these tag categories (strictly):
- tech: (python, java, javascript, rust, go, php, ruby, docker, kubernetes, aws, azure, gcp, etc.)
- topic: (web-development, devops, security, testing, ai, cloud, data, open-source, software-development, mobile, etc.)
- language: (english, french, german, spanish, dutch, italian, portuguese, etc.)

Forbidden tags:
- Never generate: location:*, country:*, region:*, city:*, continent:*, place:*
- The \`topic\` tag can't have \`conference\` in value.
- The location field of a conference is **never** a tag. It is only used to guess the \`language:\` tag.
- If unsure about location-based language, choose the most likely default (e.g. Germany → english or german).
`

  if (fs.existsSync(tagsFile)) {
    const data = fs.readFileSync(tagsFile, 'utf-8').split('\n').slice(1).filter(Boolean);

    const oldTags = data.slice(-maxOldTags);

    if (oldTags.length > 0) {
      prompt += `\n\nHistory of past conference tags (use this for consistency):\n`;
      oldTags.forEach((line, i) => {
        prompt += `${i + 1}. ${line}\n`
      });
    }


    prompt += `

Historical consistency rules:
- If a conference already exists in the history (e.g., same name in a previous year), REUSE the same tags when still relevant.
- Pay special attention to \`language:\` — it should remain consistent between editions unless a language switch is explicitly clear.
- Example: If "PyCon DE & PyData 2025" had \`language:english\`, then "PyCon DE & PyData 2026" should also have \`language:english\`, unless evidence proves otherwise.
- Prioritize consistency with historical data over assumptions based on city or country.

Guidelines:
- Use conference name and URL to infer likely topics or technologies (e.g. “PyCon” implies "tech:python").
- Use location to infer language (e.g. Germany → likely \`language:english\` or \`language:german\`, but check consistency with past editions).
- If a conference exists in history (even previous editions), reuse or extend existing tags with similar logic.
- When in doubt, prefer **precision over creativity**. Don't invent tags that weren't seen before unless obviously relevant.
- Generate at minimum three tags: tech, topic and language

Output format:
Only return a numbered list like this:
1. tech:python,topic:data,topic:open-source,language:english  
2. tech:java,topic:cloud,language:english

No comments, no explanations, no extra whitespace — just the list.`

    //prompt += `\n\nUse consistent logic based on past oldTags.\n`;
  }

  return prompt;
}

/**
 * Use OVHcloud AI Endpoint with qwen-2-5-coder-32b-instruct LLM to infer tags for a batch of conferences
 */
async function inferTagsBatchWithAI(confBatch, tagsFile) {

//console.log(confBatch)

  // Create the system prompt
const systemPrompt = buildSystemPrompt(tagsFile);
//console.log(systemPrompt)

  // Create the user prompt
  const userPrompt = `
Based on the information below, generate tags in the format described.

${confBatch.map((c, i) => `
${i + 1}. Name: ${c.name}
   Location: ${c.location}
   URL: ${c.url}`).join('')}

If these conferences already existed in previous years. Use tags from previous editions if consistent.

Return only the tag line in this exact format:
1. tech:python,topic:data,topic:open-source,language:english

Ignore the location field when generating tags. It is only used to help guess the language.

Only return the numbered list with comma-separated tags. No extra explanation or formatting.
`;

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

    const tags = await inferTagsBatchWithAI(batch, tagsFile);

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