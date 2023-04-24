import {useEffect, useMemo, useReducer, useState} from 'react';

import {IonIcon} from '@ionic/react';
import {arrowDownCircle} from 'ionicons/icons';

import YearSelector from 'components/YearSelector/YearSelector';
import CalendarGrid from 'components/CalendarGrid/CalendarGrid';

import 'misc/fonts/inter/inter.css';
import 'styles/App.css';
import {exportYear, getEventsByYear} from 'utils';
import reducer from 'app.reducer';
import SelectedEvents from 'components/SelectedEvents/SelectedEvents';
import CustomContext from 'app.context';

const App = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userState, userDispatch] = useReducer(reducer, {date: null, month: null, year: null});
  const providerState = {
    userState,
    userDispatch,
  };

  useEffect(() => {
    getEventsByYear();
  }, []);

  return (
    <CustomContext.Provider value={providerState}>
      <h1 className="dcaTitle">Developer Conferences Agenda</h1>
      <YearSelector
        year={selectedYear}
        onChange={year => {
          setSelectedYear(year);
        }}
      />
      <div className="downloadButton" onClick={() => exportYear(selectedYear)}>
        <IonIcon icon={arrowDownCircle} />
        Download {selectedYear} Calendar
      </div>

      <CalendarGrid year={selectedYear} />

      <SelectedEvents date={userState.date} month={userState.month} year={userState.year} />
    </CustomContext.Provider>
  );
};

export default App;
