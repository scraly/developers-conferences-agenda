import {VCALENDAR, VEVENT} from 'ics-js';
import allEvents from 'misc/all-events.json';

export const exportYear = selectedYear => {
  let cal = new VCALENDAR();
  cal.addProp('VERSION', 2);
  cal.addProp('PRODID', 'DCA');

  for (const event of allEvents) {
    let eventYear = new Date(event.date[0]).getFullYear();
    if (eventYear !== selectedYear) continue;
    let vevent = new VEVENT();
    vevent.addProp('UID', `${Math.random()}@dca`);
    vevent.addProp('DTSTAMP', new Date());
    vevent.addProp('DTSTART', new Date(event.date[0]));
    vevent.addProp('DTEND', new Date(event.date[1] ?? event.date[0]));
    vevent.addProp('LOCATION', event.location || 'unspecified');
    vevent.addProp('SUMMARY', event.name);
    vevent.addProp('URL', event.hyperlink || 'unspecified');
    cal.addComponent(vevent);
  }

  let blob = cal.toBlob();
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `developer-conference-${selectedYear}.ics`;
  link.click();
};

const lpad2 = number => ('0' + number).slice(-2);

export const formatDate = date =>
  date.getFullYear() + '-' + lpad2(date.getMonth() + 1) + '-' + lpad2(date.getDate());
