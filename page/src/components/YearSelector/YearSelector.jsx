import React from 'react';

import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';


import 'styles/YearSelector.css';
import {useYearEvents} from 'app.hooks';
import EventCount from 'components/EventCount/EventCount';
import ViewSelector from 'components/ViewSelector/ViewSelector';

const YearSelector = ({ isMap, year, onChange, view }) => {
  let yearEvents = useYearEvents()
  if (view == "cfp") {
     // Display only opened callForPapers
     yearEvents = yearEvents.filter(e => e.cfp && new Date(e.cfp.untilDate + 24 * 60 * 60 * 1000) > new Date());
  }
  return (
    <div>
      <div className="yearNavigatorWrapper">
        <div className="yearNavigator">
            <ArrowLeftCircle className="arrowButton" onClick={() => onChange(year - 1)} />
            <h2 className="bigYearLabel">{year}</h2>
            <ArrowRightCircle className="arrowButton" onClick={() => onChange(year + 1)} />
        </div>
        <ViewSelector selected={view}/>
      </div>
      <div>
        <EventCount events={yearEvents} isMap={isMap} />
      </div>
    </div>
  );
};

export default YearSelector;
