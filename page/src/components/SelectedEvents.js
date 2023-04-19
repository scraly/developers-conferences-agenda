import React from 'react';

import 'styles/SelectedEvents.css';

const lpad2 = number => ('0'+number).slice(-2)
const formatDate = date => date.getFullYear()+"-"+lpad2(date.getMonth()+1)+"-"+lpad2(date.getDate())


const SelectedEvents = ({ events, date }) => {
	return (
	<>
		<h3 className="eventDateDisplay">{formatDate(date)}</h3>
		<div className="eventsGridDisplay">
			{
				events?.length ? 
				events.map(e => <EventDisplay {...e} />) : 
				<p>No event found for that day</p>
			}
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
