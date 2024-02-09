import React from "react";
import ShortDate from "components/ShortDate/ShortDate";

export function EventListEntry({ event }) {
    let hyperlink = <a></a>;
    let closedCaptionElement = null;
    
    if (event.closedCaption) {
        closedCaptionElement = <img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" />;
    }

    if (event.hyperlink) {
        hyperlink = <a href={event.hyperlink} target="_blank">{new URL(event.hyperlink).hostname}</a>;
    }

    return <div className="event-list-entry">
        <header>
            <ShortDate dates={event.date} />
            <div className="event-name-location">
                <b>{event.name}</b>
                <span>{event.location}</span>
            </div>
            <div className="event-banners">
                <span dangerouslySetInnerHTML={{__html: event.misc}}></span>
                <span>{closedCaptionElement}</span>
            </div>
            {hyperlink}
        </header>
        <article>
        </article>
        <footer>
        </footer>
    </div>;
};