import React, { useState } from 'react';

import YearSelector from 'components/YearSelector';
import CalendarGrid, { getEventsOnDate } from 'components/CalendarGrid';
import SelectedEvents from 'components/SelectedEvents';

import 'misc/fonts/inter/inter.css';
import 'styles/App.css';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			// TODO: Defaults to local time .getFullYear()
			selectedYear: 2022,
			events: []
		};
	}

	renderYear(year) {
		this.setState((state) => {
			return { selectedYear: year };
		});
	}

	displayDate(date) {
		this.setState((state) => {
			return { events: getEventsOnDate(date) };
		});
	}

	render() {
		return (
			<>
				<h2 className="dcaTitle">Developer Conferences Agenda</h2>
				<YearSelector
				year={this.state.selectedYear}
				onChange={this.renderYear.bind(this)} />
				<CalendarGrid
				year={this.state.selectedYear}
				displayDate={this.displayDate.bind(this)} />

				<SelectedEvents
				events={this.state.events} />
			</>
		);
	}
}

export default App;
