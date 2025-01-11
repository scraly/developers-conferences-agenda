import React from 'react';
import 'styles/CfpView.css';
import { Clock, CalendarClock } from 'lucide-react';

import {useYearEvents} from 'app.hooks';
import {getMonthName, getMonthNames} from 'utils';
import {formatEventDates} from 'components/EventDisplay/EventDisplay.utils';
import { flag } from 'country-emoji';

const CfpView = () => {
  let events = useYearEvents();

    // Display only opened callForPapers
    events = events.filter(e => e.cfp && new Date(e.cfp.untilDate + 24 * 60 * 60 * 1000) > new Date());

   // Sort CFPs based on the closing date
   events = events.sort((a, b) => {
      if (!a.cfp?.untilDate || !b.cfp?.untilDate) return 0;
      return new Date(a.cfp.untilDate) - new Date(b.cfp.untilDate);
  });

  const eventsByMonth = events.reduce((acc, cur) => {
    let monthKey;
      monthKey = getMonthName(new Date(cur.cfp.untilDate).getMonth());
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(cur);

    return acc;
  }, {});

  // Get the month names in the correct order based on sort type
  const monthOrder = Object.keys(eventsByMonth).sort((a, b) => {
    const monthA = getMonthNames().indexOf(a);
    const monthB = getMonthNames().indexOf(b);
    return monthA - monthB;
  });

  return (
    <div className="cfpView">
      {monthOrder.map(month => (
        <React.Fragment key={month}>
          <h1>{month} Opened CFPs:</h1>
          <div className="eventsGridDisplay">
          {eventsByMonth[month].map((e, i) => (

          <div className='eventCell' key={`${month}_ev_${i}`}>
  
            <div className="content">
              <div>
                <b>{e.hyperlink ? <a className="title" href={e.hyperlink} rel="noreferrer" target="_blank">{e.name}</a> : ''} ({formatEventDates(e.date)})</b>
                
                  <span className="until"><Clock color="green" />Until {e.cfp.until} </span>

                  <div className="country">
                    <span className="countryFlag">{e.country != "Online" ? flag(e.country) : '🌎'}</span>
                    <span className="countryName">{e.location}</span>
                  </div>
              </div>
              <a className="submitButton" href={e.cfp.link} rel="noreferrer" target="_blank" title="Submit to the CFP">
                <CalendarClock />
                Submit to the CFP
              </a>
            </div>
          </div>
          ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );

};

export default CfpView;
