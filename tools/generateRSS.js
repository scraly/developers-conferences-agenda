const feed = require("feed");
const fs = require("fs");

const ROOT = "../";
const ATOM_OUTPUT = ROOT + "page/src/misc/feed-events.xml";
const JSON_OUTPUT = ROOT + "page/src/misc/feed-events.json";

const today = Date.now()

const f = new feed.Feed({
  title: "Developer Conferences Agenda",
  description: "A list of tech conferences's date and CFP in order to help conferences organizers, speakers & attendees",
  id: "https://developers.events/",
  link: "https://developers.events/",
  feedLinks: {
    json: "https://developers.events/feed-events.json",
    atom: "https://developers.events/feed-events.atom"
  },
});

events = JSON.parse(fs.readFileSync('../page/src/misc/all-events.json'), 'utf-8');
let now = new Date(today)
events.forEach((event, idx) => {
  now = new Date(now.getTime() + 1000)
  f.addItem({
    title: event.name,
    author: [
        {
            name: 'developers.events',
            link: 'https://github.com/scraly/developers-conferences-agenda'
        }
    ],
    id: encodeURI(decodeURI(event.hyperlink)) + '/' + idx,
    link: encodeURI(decodeURI(event.hyperlink)),
    description: event.name,
    content: event.name + " @ " + event.location + " - " + new Date(event.date[0]),
    date: now,
  })
})

fs.writeFileSync(ATOM_OUTPUT, f.atom1());
fs.writeFileSync(JSON_OUTPUT, f.json1());
