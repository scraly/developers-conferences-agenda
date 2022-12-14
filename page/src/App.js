import React, { useState } from 'react';

import YearSelector from 'components/YearSelector';
import CalendarGrid from 'components/CalendarGrid';

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

	render() {
		return (
			<>
				<YearSelector year={this.state.year} onChange={this.renderYear.bind(this)} />
				<CalendarGrid year={this.state.year} />
			</>
		);
	}
}

export default App;
