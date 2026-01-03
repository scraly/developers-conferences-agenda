const fs = require("fs");
const { VCALENDAR, VEVENT } = require('../page/node_modules/ics-js');

const allEvents = JSON.parse(fs.readFileSync('../page/src/misc/all-events.json'), 'utf-8');
const cals = {};

function formatDate(date = new Date()) {
    const year = date.toLocaleString('default', {year: 'numeric'});
    const month = date.toLocaleString('default', {
      month: '2-digit',
    });
    const day = date.toLocaleString('default', {day: '2-digit'});
  
    return [year, month, day].join('');
}

for (const event of allEvents) {
    let eventYear = new Date(event.date[0]).getFullYear();
    if (!cals[eventYear]) {
        cals[eventYear] = new VCALENDAR();
        cals[eventYear].addProp('VERSION', 2);
        cals[eventYear].addProp('PRODID', 'DCA');
    }
    let vevent = new VEVENT();
    vevent.addProp('UID', `${event.name}@dca-${eventYear}`);
    vevent.addProp('DTSTAMP', new Date());
    vevent.addProp('DTSTART', formatDate(new Date(event.date[0])));
    if(event.date[1]) {
        // When we have a multiday event, we need to add one more day
        // Add one more day to event.date[1]
        let endDate = new Date(event.date[1]);
        endDate.setDate(endDate.getDate() + 1);
        vevent.addProp('DTEND', formatDate(endDate));
    }
    vevent.addProp('LOCATION', event.location || 'unspecified');
    vevent.addProp('SUMMARY', event.name);
    vevent.addProp('URL', event.hyperlink || 'unspecified');
    
    // Add CFP information if available
    if (event.cfp && event.cfp.link) {
        let description =
          `CFP Opened Until: ${event.cfp.until || 'TBD'}\\n` +
          `CFP Link: ${event.cfp.link}`;
        vevent.addProp('DESCRIPTION', description);
    }
    
    cals[eventYear].addComponent(vevent);
}

Object.keys(cals).forEach(year => fs.writeFileSync(
    `../page/src/misc/developer-conference-${year}.ics`,
    cals[year].toString()
));

