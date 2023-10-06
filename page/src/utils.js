import allEvents from 'misc/all-events.json';

const appendEvent = (events, date, event) => {
  if (!events[date.getFullYear()]) events[date.getFullYear()] = {};
  if (!events[date.getFullYear()][date.getMonth()])
    events[date.getFullYear()][date.getMonth()] = {};
  if (!events[date.getFullYear()][date.getMonth()][date.getDate()])
    events[date.getFullYear()][date.getMonth()][date.getDate()] = [];
  events[date.getFullYear()][date.getMonth()][date.getDate()].push(event);
};

export const getEventsByYear = () => {
  const events = {};
  const day = 24 * 60 * 60 * 1000;
  for (const event of allEvents) {
    if (event.date[0]) {
      appendEvent(events, new Date(event.date[0]), event);
      if (event.date[1]) {
        let date = event.date[0];
        while (date !== event.date[1]) {
          date += day;
          appendEvent(events, new Date(date), event);
        }
      }
    }
    if (event.date[1]) {
      appendEvent(events, new Date(event.date[1]), event);
    }
  }
  window.dev_events = events;
};

export const getYearEvents = year => {
  const events = allEvents.filter(e => new Date(e.date[0]).getFullYear() === year);

  return events;
};

export const hasEvents = year =>
  Boolean(allEvents.find(e => new Date(e.date[0]).getFullYear() === year));

const lpad2 = number => ('0' + number).slice(-2);

export const formatDate = date =>
  date.getFullYear() + '-' + lpad2(date.getMonth() + 1) + '-' + lpad2(date.getDate());

export const getMonthName = month =>
  [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][month];

export const filterEvents = (events, callForPapers, query) => {
  let result = events;
  if (callForPapers) {
    result = events.filter(e => Object.values(e.cfp).length > 0);
  }

  if (query) {
    result = result.filter(
      e =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.hyperlink.toLowerCase().includes(query.toLowerCase()) ||
        e.location.toLowerCase().includes(query.toLowerCase())
    );
  }

  return result;
};
