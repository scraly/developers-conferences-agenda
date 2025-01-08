import React from 'react';
import 'styles/CfpView.css';
import { Clock, Link, CalendarClock } from 'lucide-react';

import {useYearEvents} from 'app.hooks';
import {getMonthName, getMonthNames} from 'utils';
import ShortDate from 'components/ShortDate/ShortDate';

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

          <div key={`${month}_ev_${i}`} className='eventCell'>
  
            <div className="content">
              <div>
                <b>{e.name} {e.hyperlink ? <a href={e.hyperlink} target="_blank"><Link /></a> : ''}</b>
                <ShortDate dates={e.date} />
                
                  <span class="until"><Clock color="green" />Until {e.cfp.until} </span>
                  <span>{e.location}</span>
              </div>
              <a href={e.cfp.link} target="_blank" title="Submit to the CFP" className="submitButton">
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
