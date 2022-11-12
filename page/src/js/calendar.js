// TODO: Use Intl.DateTimeFormat
const months = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];
const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

async function getEvents() {
	let res = await fetch('/misc/all-events.json');
	let data = await res.json();

	return data;
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
			let events = this.getEventsOn(dat);
			let dcomp = new ElementSoup('div')
				    .class('date')
				    .data('intensity', events.length)
				    .child(new ElementSoup('span').text(dat.getDate()));

			// Add click event
			dcomp._e.addEventListener('click', ondateclick.bind(window, events));

			// Finally, append child to wekgrid.
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

function ondateclick(events, e) {
	let ul = $('#entries');
	ul.innerHTML = '';

	for (const event of events) {
		ul.appendChild(
			new ElementSoup('li')
			.child(new ElementSoup('a')
				.attribute('href', event.hyperlink)
				.text(event.name)
			)
			.child(new ElementSoup('span')
				.text(event.location)
				// XXX: WARN: TODO: I anticipate no XSS
				.html(event.misc)
			).export()
		);
	}
}

class Renderer {
	constructor() {
		this.events = [];
		getEvents().then(data => {
			this.events = this.events.concat(data);
			if (typeof this.onready === 'function') this.onready();
		});
	}

	render(year) {
		renderYear.call(this, year);
	}

	getEventsOn(date) {
		let today = [];
		let time = Math.floor(date.getTime() / 1000);
		for (const event of this.events) {
			// If between event date
			// TODO: Optimization possible: Our dates from all-events.json are sorted, so drop anything that is `event.date[1] > time` by breaking the loop
			if (event.date[0] <= time && time <= event.date[1]) {
				today.push(event);
			}
		}

		return today;
	}
}

window.renderer = new Renderer();
