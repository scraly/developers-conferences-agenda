import React from 'react';

import 'styles/Calendar.css';

const MonthsName = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

function daysToWeeks(days) {
	let weeks = [[]];

	let emptyFill = 0;
	for (let i = 0; i < days.length; i++) {
		if (i === 0) {
			let day = days[0].date.getDay() - 1;
			if (day < 0) day = 7 - Math.abs(day);

			emptyFill = day;
			for (let x = 0; x < emptyFill; x++) {
				weeks[0].push([]);
			}
		}

		if (!Array.isArray(weeks[Math.floor((i + emptyFill) / 7)])) {
			weeks[Math.floor((i + emptyFill) / 7)] = [];
		}
		weeks[Math.floor((i + emptyFill) / 7)].push(days[i]);
	}

	return weeks;
}

const Calendar = ({ month, days, displayDate }) => {
	return (
		<div>
			<div className="header">
				<span>{MonthsName[month]}</span>
			</div>
			<div className="dayList">
				<span>Mo</span>
				<span>Tu</span>
				<span>We</span>
				<span>Th</span>
				<span>Fr</span>
				<span>Sa</span>
				<span>Su</span>
			</div>
			<div className="weeks">
				{daysToWeeks(days).map(week => (
					<Week>
						{week.map(day => (
							<Day
							date={day.date}
							events={day.events}
							displayDate={displayDate}
							/>
						))}
					</Week>
				))}
			</div>
		</div>
	);
};

const Week = ({ children }) => {
	return <div className="week">{children}</div>;
};

const Day = ({ date, events, displayDate }) => {
	let invisible = date?.getDate() ? '' : ' invisible';
	let intensity = events?.length ?? 0;

	if (intensity > 10) intensity = 10;
	intensity = ` intensity-${intensity}`;

	return <div
		className={"date" + invisible + intensity}
		onClick={() => displayDate(date)}>
			{date?.getDate() || ''}
		</div>
};

export default Calendar;
