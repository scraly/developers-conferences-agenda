import Filters from "components/Filters/Filters";
import { useHasYearEvents } from "../app.hooks";
import { createSearchParams, useNavigate, useParams, useSearchParams } from "react-router-dom";
import YearSelector from "components/YearSelector/YearSelector";
import { CalendarClock, CalendarDays } from "lucide-react";
import ViewSelector from "components/ViewSelector/ViewSelector";
import CalendarGrid from "components/CalendarGrid/CalendarGrid";
import SelectedEvents from "components/SelectedEvents/SelectedEvents";

export function DatePage() {
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
              year={parseInt(year, 10)}
              onChange={year => {
                navigate(`/${year}/calendar?${createSearchParams(searchParams)}`);
              }}
            />
            {hasYearEvents && (
              <div className='downloadButtons'>
                <a href={'/developer-conference-' + year + '.ics'} title={'Download ' + year + ' Calendar'} className="downloadButton">
                  <CalendarDays />
                  {year} Calendar
                </a>
                <a href={'/developer-conference-opened-cfps.ics'} title="Download Opened CFP Calendar" className="downloadButton">
                  <CalendarClock />
                  Opened CFP Calendar
                </a>
              </div>
            )}

            <ViewSelector selected={'calendar'}/>

            <CalendarGrid year={year} />
            <SelectedEvents date={date} month={month} />
        </div>
      </div>
    );
}