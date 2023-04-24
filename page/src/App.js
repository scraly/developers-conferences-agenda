import {useReducer, useState} from 'react';

import {IonIcon} from '@ionic/react';
import {arrowDownCircle} from 'ionicons/icons';

import YearSelector from 'components/YearSelector/YearSelector';
import CalendarGrid from 'components/CalendarGrid/CalendarGrid';

import 'misc/fonts/inter/inter.css';
import 'styles/App.css';
import {exportYear} from 'utils';
import reducer from 'app.reducer';
import SelectedEvents from 'components/SelectedEvents/SelectedEvents';
import CustomContext from 'app.context';

const App = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userState, userDispatch] = useReducer(reducer, {});
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
      <div className="downloadButton" onClick={() => exportYear(selectedYear)}>
        <IonIcon icon={arrowDownCircle} />
        Download {selectedYear} Calendar
      </div>

      <CalendarGrid year={selectedYear} />

      <SelectedEvents
        events={userState.events}
        date={userState.selectedDate}
        month={userState.month}
      />
    </CustomContext.Provider>
  );
};

export default App;
