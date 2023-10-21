import {useReducer, useState} from 'react';

import {ArrowDownCircle, Calendar, List} from 'lucide-react';

import CalendarGrid from 'components/CalendarGrid/CalendarGrid';
import ListView from 'components/ListView/ListView';
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
      <div className="dcaTitleWrapper">
        <h1 className="dcaTitle">Developer Conferences Agenda</h1>
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
        </div>
      </div>
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
          {hasEvents(selectedYear) && (
            <a href={'/developer-conference-' + selectedYear + '.ics'} className="downloadButton">
              <ArrowDownCircle />
              Download {selectedYear} Calendar
            </a>
          )}

          {viewType === 'calendar' && <CalendarGrid year={selectedYear} />}
          {viewType === 'calendar' && (
            <SelectedEvents date={userState.date} month={userState.month} year={userState.year} />
          )}

          {viewType === 'list' && <ListView year={selectedYear} />}
        </div>
      </div>
    </CustomContext.Provider>
  );
};

export default App;
