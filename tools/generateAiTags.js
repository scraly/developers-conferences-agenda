#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Initialize Anthropic client (you'll need to install @anthropic-ai/sdk)
// npm install @anthropic-ai/sdk
let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch (error) {
  console.error('# Please install @anthropic-ai/sdk: npm install @anthropic-ai/sdk');
  process.exit(1);
}

const client = new Anthropic();

/**
 * Read existing events from TAGS.csv
 */
function readExistingEvents(tagsFile) {
  const existingEvents = new Set();
  try {
    const data = fs.readFileSync(tagsFile, 'utf-8');
    const lines = data.split('\n');
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Parse CSV - handle quoted fields and regular fields
        const firstComma = line.indexOf(',');
        if (firstComma > 0) {
          let eventId = line.substring(0, firstComma);
          // Remove quotes if present
          if (eventId.startsWith('"') && eventId.endsWith('"')) {
            eventId = eventId.slice(1, -1);
          }
          existingEvents.add(eventId);
        }
      }
    }
  } catch (error) {
    // File doesn't exist, that's okay
  }
  return existingEvents;
}

/**
 * Read all conferences and sort by date
 */
function readConferences() {
  const allEventsPath = path.join(__dirname, '../page/src/misc/all-events.json');
  const allEvents = JSON.parse(fs.readFileSync(allEventsPath, 'utf-8'));
  
  // Filter for future events and create conference objects
  const now = Date.now();
  const conferences = [];
  for (const event of allEvents) {
    if (event.date && event.date.length > 0) {
      const timestamp = event.date[0];
      // Only include future events
      if (timestamp >= now) {
        const dateStr = new Date(timestamp).toISOString().split('T')[0];
        const conf = {
          date: dateStr,
          name: event.name,
          location: event.location,
          url: event.hyperlink || 'N/A'
        };
        conferences.push(conf);
      }
    }
  }
  
  return conferences.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Use Claude Sonnet 4 to infer tags for a batch of conferences
 */
async function inferTagsBatchWithAI(confBatch) {
  // Create the batch prompt
  let prompt = `
Based on the TAGS.csv format from our earlier conversation, infer appropriate tags for each of these conferences:

`;
  
  confBatch.forEach((conf, i) => {
    prompt += `
${i + 1}. Name: ${conf.name}
   Location: ${conf.location}
   URL: ${conf.url}
`;
  });
  
  prompt += `
Use the same tag categories from TAGS.csv:
- tech: (javascript, python, java, rust, go, php, ruby, docker, kubernetes, aws, azure, gcp, etc.)
- topic: (security, web-development, devops, mobile, ai, data, cloud, open-source, testing, etc.)  
- type: (conference, summit, camp, bootcamp, hackathon, meetup)
- language: (english, french, spanish, german, dutch, italian, portuguese, etc.)

Return the results in this exact format, one line per conference:
1. type:conference,tech:javascript,language:english
2. type:summit,topic:security,language:french
3. type:conference,tech:python,language:english
etc.

Multiple tags of the same type should be repeated, for example:

3. type:conference,tech:python,topic:web-development,topic:ai,language:english

Only return the numbered list with tags, nothing else.
`;
  
  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });
    
    // Parse the response
    const lines = response.content[0].text.trim().split('\n');
    const results = [];
    
    for (const line of lines) {
      if (line.trim() && line.includes('. ')) {
        // Extract tags after the number
        const tags = line.split('. ', 2)[1]?.trim();
        if (tags) {
          results.push(tags);
        }
      }
    }
    
    return results;
    
  } catch (error) {
    console.error(`# Error processing batch: ${error.message}`, { file: process.stderr });
    // Fallback to basic inference for the batch
    const fallbackResults = [];
    for (const conf of confBatch) {
      const tags = ["type:conference"];
      const locationLower = conf.location.toLowerCase();
      if (['usa', 'uk', 'canada'].some(country => locationLower.includes(country))) {
        tags.push('language:english');
      } else if (locationLower.includes('france')) {
        tags.push('language:french');
      } else if (locationLower.includes('spain')) {
        tags.push('language:spanish');
      } else {
        tags.push('language:english');
      }
      fallbackResults.push(tags.join(','));
    }
    return fallbackResults;
  }
}

/**
 * Sleep helper function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  const tagsFile = 'TAGS.csv';
  
  // Read existing events
  const existingEvents = readExistingEvents(tagsFile);
  console.error(`# Found ${existingEvents.size} existing events`);
  
  // Read all conferences
  const allConferences = readConferences();
  console.error(`# Found ${allConferences.length} total future conferences`);
  
  // Find conferences that need processing
  const conferencesToProcess = [];
  for (const conf of allConferences) {
    const eventId = `${conf.date}-${conf.name}`;
    if (!existingEvents.has(eventId)) {
      conferencesToProcess.push(conf);
    }
  }
  
  console.error(`# Need to process ${conferencesToProcess.length} new conferences`);
  
  // Limit to first 300 missing events
  const limitedConferences = conferencesToProcess.slice(0, 300);
  console.error(`# Processing first ${limitedConferences.length} missing conferences`);
  
  // Prepare output - collect all new entries
  const newEntries = [];
  
  // Process conferences in batches of 30
  const batchSize = 30;
  
  for (let i = 0; i < limitedConferences.length; i += batchSize) {
    const batch = limitedConferences.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    console.error(`# Processing batch ${batchNum}: conferences ${i + 1} to ${Math.min(i + batchSize, limitedConferences.length)}`);
    
    const tagsResults = await inferTagsBatchWithAI(batch);
    
    // Collect results for this batch
    for (let j = 0; j < batch.length; j++) {
      const conf = batch[j];
      const eventId = `${conf.date}-${conf.name}`;
      const tags = j < tagsResults.length ? tagsResults[j] : "type:conference,language:english";
      
      newEntries.push(`${eventId},${tags}`);
    }
    
    // Rate limiting - wait between batches
    if (i + batchSize < limitedConferences.length) {
      await sleep(2000);
    }
    
    // Progress indicator
    const completed = Math.min(i + batchSize, limitedConferences.length);
    console.error(`# Completed ${completed}/${limitedConferences.length} conferences`);
  }
  
  // Append new entries to TAGS.csv
  if (newEntries.length > 0) {
    const appendData = newEntries.join('\n') + '\n';
    fs.appendFileSync(tagsFile, appendData);
    console.error(`# Appended ${newEntries.length} new events to ${tagsFile}`);
  } else {
    console.error(`# No new events to add`);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('# Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { readExistingEvents, readConferences, inferTagsBatchWithAI };
