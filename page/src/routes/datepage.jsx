import {useState} from 'react';
import Filters from 'components/Filters/Filters';
import {useHasYearEvents} from 'app.hooks';
import {createSearchParams, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import YearSelector from 'components/YearSelector/YearSelector';
import {CalendarClock, CalendarDays} from 'lucide-react';
import CalendarGrid from 'components/CalendarGrid/CalendarGrid';
import EventModal from 'components/Modal/EventModal';

export function DatePage() {
  const {year, month, date} = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasYearEvents = useHasYearEvents(year);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvents, setModalEvents] = useState([]);
  const [selectedDateOrMonth, setSelectedDateOrMonth] = useState(null);

  const openModal = (selectedDate, events) => {
    setModalEvents(events);
    setSelectedDateOrMonth(selectedDate);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
      <div className="dcaGrid">
        <Filters />
        <div className="dcaContent">
          <YearSelector
            isMap={false}
            year={parseInt(year, 10)}
            onChange={year => {
              navigate(`/${year}/calendar?${createSearchParams(searchParams)}`);
            }}
            view="calendar"
          />
          {hasYearEvents && (
            <div className="downloadButtons">
              <a
                href={`/developer-conference-${year}.ics`}
                title={`Download ${year} Calendar`}
                className="downloadButton"
              >
                <CalendarDays />
                {year} Calendar
              </a>
              <a
                href="/developer-conference-opened-cfps.ics"
                title="Download Opened CFP Calendar"
                className="downloadButton"
              >
                <CalendarClock />
                Opened CFP Calendar
              </a>
            </div>
          )}

          <CalendarGrid year={year} openModal={openModal} />

          <EventModal
            isOpen={isModalOpen}
            closeModal={closeModal}
            events={modalEvents}
            selectedDateOrMonth={selectedDateOrMonth}
          />
        </div>
      </div>
  );
}