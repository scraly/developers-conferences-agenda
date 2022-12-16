import React, { useState } from 'react';

import YearSelector from 'components/YearSelector';
import CalendarGrid from 'components/CalendarGrid';

import 'styles/App.css';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			// TODO: Defaults to local time .getFullYear()
			selectedYear: 2022
		};
	}

	renderYear(year) {
		this.setState((state) => {
			return { selectedYear: year };
		});
	}

	displayDate(date) {
		/* No Op */
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
			</>
		);
	}
}

export default App;
