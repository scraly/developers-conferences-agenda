import Filters from "components/Filters/Filters";
import { useHasYearEvents } from "../app.hooks";
import { createSearchParams, useNavigate, useParams, useSearchParams } from "react-router-dom";
import YearSelector from "components/YearSelector/YearSelector";
import { CalendarClock, CalendarDays } from "lucide-react";
import CalendarGrid from "components/CalendarGrid/CalendarGrid";
import SelectedEvents from "components/SelectedEvents/SelectedEvents";

export const DatePage = () => {
    const {year, month, date} = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const hasYearEvents = useHasYearEvents(year);

    return (
        <div className="dcaGrid">
          <Filters/>
          <div className="dcaContent">
            <YearSelector
              isMap={false}
              onChange={year => {
                navigate(`/${year}/calendar?${createSearchParams(searchParams)}`);
              }}
              view="calendar"
              year={parseInt(year, 10)}
            />
            {hasYearEvents ? <div className='downloadButtons'>
                <a className="downloadButton" href={'/developer-conference-' + year + '.ics'} title={'Download ' + year + ' Calendar'}>
                  <CalendarDays />
                  {year} Calendar
                </a>
                <a className="downloadButton" href="/developer-conference-opened-cfps.ics" title="Download Opened CFP Calendar">
                  <CalendarClock />
                  Opened CFP Calendar
                </a>
              </div> : null}

            <CalendarGrid year={year} />
            <SelectedEvents date={date} month={month} />
        </div>
      </div>
    );
}