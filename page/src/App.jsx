import {useReducer, useState} from 'react';

import {Calendar, CalendarDays, CalendarClock, List, Map} from 'lucide-react';

import CalendarGrid from 'components/CalendarGrid/CalendarGrid';
import ListView from 'components/ListView/ListView';
import MapView from 'components/MapView/MapView';
import YearSelector from 'components/YearSelector/YearSelector';
import Filters from 'components/Filters/Filters';

import CustomContext from 'app.context';
import reducer from 'app.reducer';
import SelectedEvents from 'components/SelectedEvents/SelectedEvents';
import 'misc/fonts/inter/inter.css';
import 'styles/App.css';
import {hasEvents} from './utils';

const App = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewType, setViewType] = useState('calendar');
  const [userState, userDispatch] = useReducer(reducer, {
    filters: {callForPapers: false, closedCaptions: false, country: '', query: ''},
    date: null,
    month: null,
    year: null,
  });
  const providerState = {
    userState,
    userDispatch,
  };

  return (
    <CustomContext.Provider value={providerState}>
      <h1 className="dcaTitle">Developer Conferences Agenda</h1>
      <div className="dcaGrid">
        <Filters
          query={userState.filters.query}
          callForPapers={userState.filters.callForPapers}
          closedCaptions={userState.filters.closedCaptions}
          country={userState.filters.country}
          onChange={(key, value) =>
            userDispatch({type: 'setFilters', payload: {...userState.filters, [key]: value}})
          }
          onClose={() =>
            userDispatch({type: 'setFilters', payload: {callForPapers: false, query: ''}})
          }
        />
        <div className="dcaContent">
          <YearSelector
            year={selectedYear}
            onChange={year => {
              setSelectedYear(year);
            }}
          />
          {viewType === 'calendar' && hasEvents(selectedYear) && (
            <a href={'/developer-conference-' + selectedYear + '.ics'} className="downloadButton">
              <CalendarDays />
              {selectedYear} Calendar
            </a>
          )}
          {viewType === 'calendar' && hasEvents(selectedYear) && (
            <a href={'/developer-conference-opened-cfps.ics'} className="downloadButton">
              <CalendarClock />
              Opened CFP Calendar
            </a>
          )}

          <div className="view-type-selector">
            <Calendar
              className={
                viewType === 'calendar'
                  ? 'view-selector calendar-view selected'
                  : 'view-selector calendar-view'
              }
              onClick={() => setViewType('calendar')}
            />
            <List
              className={
                viewType === 'list' ? 'view-selector list-view selected' : 'view-selector list-view'
              }
              onClick={() => setViewType('list')}
            />
            <Map
              className={
                viewType === 'map' ? 'view-selector map-view selected' : 'view-selector map-view'
              }
              onClick={() => setViewType('map')}
            />
          </div>

          {viewType === 'calendar' && <CalendarGrid year={selectedYear} />}
          {viewType === 'calendar' && (
            <SelectedEvents date={userState.date} month={userState.month} year={userState.year} />
          )}

          {viewType === 'list' && <ListView year={selectedYear} />}
          {viewType === 'map' && <MapView year={selectedYear} />}
        </div>
      </div>
    </CustomContext.Provider>
  );
};

export default App;
