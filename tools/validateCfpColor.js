const fs = require("fs");

const allEvents = JSON.parse(fs.readFileSync('../page/src/misc/all-events.json'), 'utf-8');

for (const event of allEvents) {
    if (event.cfp && event.cfp.untilDate && new Date(event.cfp.untilDate) < new Date() && event.misc.indexOf("color=green") !== -1) {
        console.log("Invalid cfp green color: " + new Date(event.date[0]).toISOString() + " " + event.name);
    }
    if (event.cfp && event.cfp.untilDate && new Date(event.cfp.untilDate) >= new Date() && event.misc.indexOf("color=red") !== -1) {
        console.log("Invalid cfp red color: " + new Date(event.date[0]).toISOString() + " " + event.name);
    }
}
