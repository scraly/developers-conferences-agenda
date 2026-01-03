const fs = require("fs");
const { VCALENDAR, VEVENT } = require('../page/node_modules/ics-js/dist/ics-js');

const allEvents = JSON.parse(fs.readFileSync('../page/src/misc/all-cfps.json'), 'utf-8');
const cfpCal = new VCALENDAR();
cfpCal.addProp('VERSION', 2);
cfpCal.addProp('PRODID', 'DCA');
const runDate = new Date();

function formatDate(date = new Date()) {
    const year = date.toLocaleString('default', {year: 'numeric'});
    const month = date.toLocaleString('default', {
      month: '2-digit',
    });
    const day = date.toLocaleString('default', {day: '2-digit'});
  
    return [year, month, day].join('');
}

for (const event of allEvents) {
    let cfpClosingDate = new Date(event.untilDate);
    if (cfpClosingDate.getTime() > runDate.getTime()) {
        let eventYear = new Date(event.conf.date[0]).getFullYear();
        let vevent = new VEVENT();
        vevent.addProp('UID', `${event.conf.name}@dca-${eventYear}`);
        vevent.addProp('DTSTAMP', new Date());
        vevent.addProp('DTSTART', formatDate(cfpClosingDate));
        vevent.addProp('LOCATION', event.conf.location || 'unspecified');
        vevent.addProp('SUMMARY', event.conf.name);
        
        // Add CFP link as URL property
        vevent.addProp('URL', event.link || event.conf.hyperlink || 'unspecified');
        
        // Add description with CFP deadline and link
        let description = `CFP Opened Until: ${event.until || 'TBD'}`;
        if (event.link) {
            description += `\\nCFP Link: ${event.link}`;
        }
        description += `\nEvent: ${event.conf.hyperlink || 'No link'}`;
        vevent.addProp('DESCRIPTION', description);
        
        cfpCal.addComponent(vevent);
    }
}

// Write the opened cfps calendar file
fs.writeFileSync(
    `../page/src/misc/developer-conference-opened-cfps.ics`,
    cfpCal.toString()
);
