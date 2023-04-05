import React from 'react';

import 'styles/SelectedEvents.css';

const lpad2 = number => ('0'+number).slice(-2)

const SelectedEvents = ({ events, date }) => {

	return (
	<>
		<h3 className="eventDateDisplay">{date.getFullYear()}-{lpad2(date.getMonth()+1)}-{lpad2(date.getDate())}</h3>
		<div className="eventsGridDisplay">
			{events?.map(e => <EventDisplay {...e} />)}
		</div>
	</>
	);
}

const EventDisplay = ({ name, hyperlink, location, misc }) => {
	return (
		<div className="eventCell">
			<b>{name}</b>
			<a href={hyperlink}>{hyperlink}</a>
			<span>{location}</span>
			<p dangerouslySetInnerHTML={{__html: misc}}></p>
		</div>
	);
};

export default SelectedEvents;
