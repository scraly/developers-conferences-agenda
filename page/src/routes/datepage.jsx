import Filters from 'components/Filters/Filters';
import {useHasYearEvents, useView, useYearEvents} from '../app.hooks';
import {useParams} from 'react-router-dom';
import {CalendarClock, CalendarDays} from 'lucide-react';
import CalendarGrid from 'components/CalendarGrid/CalendarGrid';
import SelectedEvents from 'components/SelectedEvents/SelectedEvents';
import EventCount from 'components/EventCount/EventCount';

const DatePage = () => {
  const {year, month, date} = useParams();
  const hasYearEvents = useHasYearEvents(year);
  let yearEvents = useYearEvents();
  if (useView() === 'cfp') {
    // Display only opened callForPapers
    yearEvents = yearEvents.filter(
      e => e.cfp && new Date(e.cfp.untilDate + 24 * 60 * 60 * 1000) > new Date()
    );
  }
  return (
    <>
      <Filters />
      <section>
        <nav className="container">
          <ul>
            <li>
              <strong>
                <EventCount events={yearEvents} isMap={false} />
              </strong>
            </li>
          </ul>
          {hasYearEvents ? (
            <ul className="downloads">
              <li>
                <a
                  // biome-ignore lint/a11y/useSemanticElements: <explanation>
                  role="button"
                  href={`/developer-conference-${year}.ics`}
                  title={`Download ${year} Calendar`}
                >
                  <CalendarDays />
                  {year} Calendar
                </a>
              </li>
              <li>
                <a
                  // biome-ignore lint/a11y/useSemanticElements: <explanation>
                  role="button"
                  href="/developer-conference-opened-cfps.ics"
                  title="Download Opened CFP Calendar"
                >
                  <CalendarClock />
                  Opened CFP Calendar
                </a>
              </li>
            </ul>
          ) : null}
        </nav>
        <CalendarGrid year={year} />
        <SelectedEvents date={date} month={month} />
      </section>
    </>
  );
};

export default DatePage;
