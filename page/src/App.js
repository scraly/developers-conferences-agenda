import { useReducer, useState } from 'react';

import { IonIcon } from '@ionic/react';
import { arrowDownCircle } from 'ionicons/icons';

import CalendarGrid from 'components/CalendarGrid/CalendarGrid';
import YearSelector from 'components/YearSelector/YearSelector';

import CustomContext from 'app.context';
import reducer from 'app.reducer';
import SelectedEvents from 'components/SelectedEvents/SelectedEvents';
import 'misc/fonts/inter/inter.css';
import 'styles/App.css';
import {hasEvents} from "./utils";

const App = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userState, userDispatch] = useReducer(reducer, {date: null, month: null, year: null});
  const providerState = {
    userState,
    userDispatch,
  };

  return (
    <CustomContext.Provider value={providerState}>
      <h1 className="dcaTitle">Developer Conferences Agenda</h1>
      <YearSelector
        year={selectedYear}
        onChange={year => {
          setSelectedYear(year);
        }}
      />
        {
            hasEvents(selectedYear) && <a href={'/developer-conference-' + selectedYear + '.ics'} className="downloadButton">
        <IonIcon icon={arrowDownCircle} />
        Download {selectedYear} Calendar
      </a>
        }

      <CalendarGrid year={selectedYear} />

      <SelectedEvents date={userState.date} month={userState.month} year={userState.year} />
    </CustomContext.Provider>
  );
};

export default App;
