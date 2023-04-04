import React from 'react';

import 'styles/SelectedEvents.css';

const SelectedEvents = ({ events, date }) => {
	return (
	<>
		<h3 className="eventDateDisplay">{(date.getFullYear()}-({('0' + date.getMonth() + 1).slice(-2)}-{('0' + date.getDate()).slice(-2)}</h3>
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
