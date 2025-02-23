import React from 'react';
import {Clock, CalendarClock} from 'lucide-react';

import {useYearEvents} from 'app.hooks';
import {formatEventDates} from 'app.utils';

import {getMonthName, getMonthNames} from 'utils';
import {flag} from 'country-emoji';
import slugify from 'slugify';

import './CfpView.css';

const CfpView = () => {
  let events = useYearEvents();

  // Display only opened callForPapers
  events = events.filter(
    e => e.cfp && new Date(e.cfp.untilDate + 24 * 60 * 60 * 1000) > new Date()
  );

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
    <>
      {monthOrder.map(month => (
        <React.Fragment key={month}>
          <h3>{month} Opened CFPs:</h3>
          <div className="grid grid-cfp">
            {eventsByMonth[month].map((e, _) => (
              <article key={`${month}_ev_${slugify(e.name)}`}>
                <header>
                  <span>{e.country !== 'Online' ? flag(e.country) : '🌎'}</span>
                  <span>{e.location}</span>
                </header>
                <section>
                  <p>
                    <b>
                      {e.hyperlink ? (
                        <a className="title" href={e.hyperlink} rel="noreferrer" target="_blank">
                          {e.name}
                        </a>
                      ) : (
                        ''
                      )}
                    </b>
                    <br />({formatEventDates(e.date)})
                  </p>
                  <a
                    // biome-ignore lint/a11y/useSemanticElements: <explanation>
                    role="button"
                    className="secondary"
                    href={e.cfp.link}
                    rel="noreferrer"
                    target="_blank"
                    title="Submit to the CFP"
                  >
                    <CalendarClock />
                    Submit to the CFP
                  </a>
                </section>
                <footer>
                  <Clock color="green" />
                  Until {e.cfp.until}
                </footer>
              </article>
            ))}
          </div>
        </React.Fragment>
      ))}
    </>
  );
};

export default CfpView;
