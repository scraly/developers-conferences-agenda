const fs = require("fs");
const { VCALENDAR, VEVENT } = require('../page/node_modules/ics-js');

const allEvents = JSON.parse(fs.readFileSync('../page/src/misc/all-events.json'), 'utf-8');
const cals = {};

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
    vevent.addProp('DTSTART', new Date(event.date[0]));
    if(event.date[1]) {
        vevent.addProp('DTEND', new Date(event.date[1]));
    }
    vevent.addProp('LOCATION', event.location || 'unspecified');
    vevent.addProp('SUMMARY', event.name);
    vevent.addProp('URL', event.hyperlink || 'unspecified');
    cals[eventYear].addComponent(vevent);
}

Object.keys(cals).forEach(year => fs.writeFileSync(
    `../page/src/misc/developer-conference-${year}.ics`,
    cals[year].toString()
));

