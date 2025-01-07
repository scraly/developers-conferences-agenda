import React from 'react';
import 'styles/CfpView.css';
import { Clock, Link, CalendarClock } from 'lucide-react';

import {useYearEvents} from 'app.hooks';
import {getMonthName, getMonthNames} from 'utils';

const CfpView = () => {
  let events = useYearEvents();

   // Sort CFPs based on the closing date
   events = events.sort((a, b) => {
      if (!a.cfp?.untilDate || !b.cfp?.untilDate) return 0;
      return new Date(a.cfp.untilDate) - new Date(b.cfp.untilDate);
  });

  // Display only opened callForPapers
  events = events.filter(e => e.cfp && new Date(e.cfp.untilDate + 24 * 60 * 60 * 1000) > new Date());

  const eventsByMonth = events.reduce((acc, cur) => {
    const currentMonth = getMonthName(new Date(cur.date[0]).getMonth());
    if (!acc[currentMonth]) {
      acc[currentMonth] = [];
    }
    acc[currentMonth].push(cur);
    if (cur.date.length > 1) {
      const nextMonth = getMonthName(new Date(cur.date[1]).getMonth());
      if (currentMonth !== nextMonth) {
        if (!acc[nextMonth]) {
          acc[nextMonth] = [];
        }
        acc[nextMonth].push(cur);
      }
    }
    return acc;
  }, {});

  return (
    <div className="cfpView">
      {getMonthNames()
        .filter(m => eventsByMonth[m])
        .map(month => (
          <React.Fragment key={month}>
            <h1>{month}</h1>
            <div className="eventsGridDisplay">
            {eventsByMonth[month].map((e, i) => (

              <div key={`${month}_ev_${i}`} className='eventCell'>
                
                <div className="content">
                  <b>{e.name} {e.hyperlink ? <a href={e.hyperlink} target="_blank"><Link /></a> : ''}</b>
                  
                <span><Clock color="green" /> Until {e.cfp.until} </span>

                <span>{e.location}</span>

                  {e.closedCaptions && <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span>}

                  <a href={e.cfp.link} target="_blank" title="Submit to the CFP" className="downloadButton">
                    <CalendarClock />
                    Submit to the CFP
                  </a>

              </div></div>
            ))}
            </div>
          </React.Fragment>
        ))}
    </div>
  );
};

export default CfpView;
