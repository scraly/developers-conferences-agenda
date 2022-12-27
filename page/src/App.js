import React, { createRef } from 'react';

import { IonIcon } from '@ionic/react';
import { arrowDownCircle } from 'ionicons/icons';

import { VCALENDAR, VEVENT } from 'ics-js';

import YearSelector from 'components/YearSelector';
import CalendarGrid, { getEventsOnDate } from 'components/CalendarGrid';
import SelectedEvents from 'components/SelectedEvents';

import allEvents from 'misc/all-events.json';

import 'misc/fonts/inter/inter.css';
import 'styles/App.css';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.eventsGrid = createRef();
		this.state = {
			// TODO: Defaults to local time .getFullYear()
			selectedYear: 2022,
			events: [],
			selectedDate: new Date()
		};
	}

	renderYear(year) {
		this.setState((state) => {
			return { selectedYear: year };
		});
	}

	displayDate(date) {
		this.setState((state) => {
			return { events: getEventsOnDate(date), selectedDate: date };
		});
	}

	exportYear() {
		let cal = new VCALENDAR();
		cal.addProp('VERSION', 2);
		cal.addProp('PRODID', 'DCA');

		for (const event of allEvents) {
			let eventYear = new Date(event.date[0] * 1000).getFullYear();
			if (eventYear !== this.state.selectedYear) continue;

			let vevent = new VEVENT();
			vevent.addProp('UID', `${Math.random()}@dca`);
			vevent.addProp('DTSTAMP', new Date());
			vevent.addProp('DTSTART', new Date(event.date[0] * 1000));
			vevent.addProp('DTEND', new Date(event.date[1] * 1000));
			vevent.addProp('LOCATION', event.location || 'unspecified');
			vevent.addProp('SUMMARY', event.name);
			vevent.addProp('URL', event.hyperlink || 'unspecified');
			cal.addComponent(vevent);
		}

		let blob = cal.toBlob();
		let link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `developer-conference-${this.state.selectedYear}.ics`;
		link.click();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.selectedDate !== this.state.selectedDate) {
			this.eventsGrid.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}

	render() {
		return (
			<>
				<h2 className="dcaTitle">Developer Conferences Agenda</h2>
				<YearSelector
				year={this.state.selectedYear}
				onChange={this.renderYear.bind(this)} />

				<div className="downloadButton" onClick={this.exportYear.bind(this)}>
					<IonIcon icon={arrowDownCircle} />
					Download {this.state.selectedYear} Calendar
				</div>

				<CalendarGrid
				year={this.state.selectedYear}
				displayDate={this.displayDate.bind(this)} />

				<div ref={this.eventsGrid}>
					<SelectedEvents events={this.state.events} date={this.state.selectedDate} />
				</div>
			</>
		);
	}
}

export default App;
