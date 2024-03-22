const fs = require("fs");

const allEvents = JSON.parse(fs.readFileSync('../page/src/misc/all-events.json'), 'utf-8');

for (const event of allEvents) {
    if (event.cfp && event.cfp.untilDate && new Date(event.cfp.untilDate) < new Date() && event.misc.indexOf("color=green") !== -1) {
               console.log("Invalid CFP green color: " + event.name + " - " + event.location);
    }
    if (event.cfp && event.cfp.untilDate && new Date(event.cfp.untilDate) >= new Date() && event.misc.indexOf("color=red") !== -1) {
                console.log("Invalid CFP red color: " + event.name + " - " + event.location);
    }
}
