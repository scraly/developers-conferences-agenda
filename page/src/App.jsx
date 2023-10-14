import { useReducer, useState } from 'react';

import { ArrowDownCircle } from 'lucide-react';

import CalendarGrid from 'components/CalendarGrid/CalendarGrid';
import YearSelector from 'components/YearSelector/YearSelector';
import Filters from 'components/Filters/Filters';

import CustomContext from 'app.context';
import reducer from 'app.reducer';
import SelectedEvents from 'components/SelectedEvents/SelectedEvents';
import 'misc/fonts/inter/inter.css';
import 'styles/App.css';
import {hasEvents} from "./utils";

const App = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userState, userDispatch] = useReducer(reducer, {filters: {callForPapers: false, query: ''}, date: null, month: null, year: null});
  const providerState = {
    userState,
    userDispatch,
  };

  console.log(userState.filters.query)
  return (
    <CustomContext.Provider value={providerState}>
      <h1 className="dcaTitle">Developer Conferences Agenda</h1>
      <div className='dcaGrid'>
        <Filters
          query={userState.filters.query}
          callForPapers={userState.filters.callForPapers}
          onChange={(key, value) => userDispatch({type: 'setFilters', payload: {...userState.filters, [key]: value}})}
          onClose={() => userDispatch({type: 'setFilters', payload: {callForPapers: false, query: ''}})}
        />
        <div className='dcaContent'>
          <YearSelector
            year={selectedYear}
            onChange={year => {
              setSelectedYear(year);
            }}
          />
            {
                hasEvents(selectedYear) && <a href={'/developer-conference-' + selectedYear + '.ics'} className="downloadButton">
            <ArrowDownCircle />
            Download {selectedYear} Calendar
          </a>
            }

          <CalendarGrid year={selectedYear} />

          <SelectedEvents date={userState.date} month={userState.month} year={userState.year} />
        </div>
      </div>
    </CustomContext.Provider>
  );
};

export default App;
