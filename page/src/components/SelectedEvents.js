import React from 'react';

import 'styles/SelectedEvents.css';

const SelectedEvents = ({ events }) => {
	return (
		<div className="eventsGridDisplay">
			{events?.map(e => <EventDisplay {...e} />)}
		</div>
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
