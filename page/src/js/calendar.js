// TODO: Use Intl.DateTimeFormat
const months = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];
const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getEventsOn() {
	// TODO: getEventsOn
	return 0;
}

function initDate(year) {
	let dat = new Date(year, 0);

	return dat;
}

function renderYear(year) {
	if (isNaN(Number(year))) return;
	let dat = initDate(year);
	let grid = $('#calendar-grid');

	grid.innerHTML = '';

	while (dat.getFullYear() == Number(year)) {
		let cal = new ElementSoup('div');
		cal.class('calendar')
		.child(
			new ElementSoup('div').class('month-label')
			.child(
				new ElementSoup('span').text(months[dat.getMonth()])
			)
		)

		let dlabl = new ElementSoup('div').class('days-label');
		for (const d of days) {
			dlabl.child(
				new ElementSoup('span').text(d)
			)
		}
		cal.child(dlabl);

		// Adding dates
		let week = 0;
		let weekEmptiness = false;
		let ddat = 1;
		let monthid = dat.getMonth();

		let dgrid = new ElementSoup('div').class('date-grid');
		let weekgrid = new ElementSoup('div').class('week').data('week', week);

		while (dat.setDate(ddat++) && dat.getMonth() == monthid) {
			if (week == 0 && weekEmptiness == false) {
				let day = dat.getDay();
				// normalize
				day = (day - 1) % 7;
				if (day < 0) day = 7 - Math.abs(day);

				let emptyfill = day;
				if (emptyfill > 0) {
					// Do empty fill

					for (let ii = 0; ii < emptyfill; ii++) {
						let fill = new ElementSoup('div')
							   .class('empty-date-fill');
							   //.data('span', emptyfill);

						weekgrid.child(fill);
					}
				}
			}

			weekEmptiness = true;

			// Create day
			let events = getEventsOn(dat);
			let dcomp = new ElementSoup('div')
				    .class('date')
				    .data('intensity', events)
				    .child(new ElementSoup('span').text(dat.getDate()));
			weekgrid.child(dcomp);

			// If it is Sunday, incrmnt week
			if (dat.getDay() == 0) {
				dgrid.child(weekgrid);
				weekgrid = new ElementSoup('div').class('week').data('week', ++week);
				weekEmptiness = false;
			}
		}

		// Last week probably not added;
		dgrid.child(weekgrid);

		cal.child(dgrid);
		grid.appendChild(cal.export());
	}
}

window.sc = renderYear;
