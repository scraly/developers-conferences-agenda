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
  //<Filters />
  return (
    <div>
      <EventCount events={yearEvents} isMap={false} />
      <div>
        {hasYearEvents ? (
          <div className="downloadButtons">
            <a
              // biome-ignore lint/a11y/useSemanticElements: <explanation>
              role="button"
              href={`/developer-conference-${year}.ics`}
              title={`Download ${year} Calendar`}
            >
              <CalendarDays />
              {year} Calendar
            </a>
            <a
              // biome-ignore lint/a11y/useSemanticElements: <explanation>
              role="button"
              href="/developer-conference-opened-cfps.ics"
              title="Download Opened CFP Calendar"
            >
              <CalendarClock />
              Opened CFP Calendar
            </a>
          </div>
        ) : null}

        <CalendarGrid year={year} />
        <SelectedEvents date={date} month={month} />
      </div>
    </div>
  );
};

export default DatePage;
