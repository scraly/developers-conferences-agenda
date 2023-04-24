import allEvents from 'misc/all-events.json';

export const getEventsOnDate = date => {
  let events = [];
  for (const event of allEvents) {
    if (date >= event.date[0] && date <= (event.date[1] ?? event.date[0])) {
      events.push(Object.assign({}, event));
    }
  }
  return events;
};

export function* DayRange(startDate, endDate) {
  let date = new Date(startDate);
  while (date < endDate) {
    yield new Date(date);
    date.setDate(date.getDate() + 1);
  }
}
