const fs = require("fs");

const allEvents = JSON.parse(fs.readFileSync('../page/src/misc/all-events.json'), 'utf-8');

let readmeFile = fs.readFileSync('../README.md', 'utf-8')

for (const event of allEvents) {
    if (event.cfp && event.cfp.untilDate && new Date(event.cfp.untilDate + (24 * 60 *60 * 1000)) < new Date() && event.misc.indexOf("color=green") !== -1) {
        //console.log(event.cfp, event.misc)
        readmeFile = readmeFile.replace(event.cfp.until+"&color=green", event.cfp.until+"&color=red");
    }
}

fs.writeFileSync('../README.md', readmeFile, 'utf-8')
