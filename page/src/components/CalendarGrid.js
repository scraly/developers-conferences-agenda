import React from 'react';

import Calendar from 'components/Calendar';

import allEvents from 'misc/all-events.json';
import 'styles/CalendarGrid.css';

function* DayRange(startDate, endDate) {
	let date = new Date(startDate);
	while (date < endDate) {
		yield new Date(date);
		date.setDate(date.getDate() + 1);
	}
}

export function getEventsOnDate(date) {
	let events = [];
	for (const event of allEvents) {
		if (date >= event.date[0] && date < (event.date[1] ?? event.date[0])) {

			events.push(Object.assign({}, event));
		}
	}

	return events;
}

const CalendarGrid = ({ year, displayDate }) => {
	// Iterate month
	let months = [];
	for (let m = 0; m < 12; m++) {
		let days = [];
		// Iterate days
		let startDate = new Date(year, m);
		let endDate = new Date(year, m + 1);
		for (const dayDate of DayRange(startDate, endDate)) {
			days.push({
				date: dayDate,
				events: getEventsOnDate(dayDate)
			});
		}

		months.push({
			days, displayDate,
			month: m
		});
	}

	return (
		<div className="calendarGrid">
			{months.map(m => <Calendar {...m} />)}
		</div>
	);
};

export default CalendarGrid;
