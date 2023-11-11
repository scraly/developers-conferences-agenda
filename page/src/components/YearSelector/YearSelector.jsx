import React from 'react';

import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';


import 'styles/YearSelector.css';
import {useYearEvents} from 'app.hooks';
import EventCount from 'components/EventCount/EventCount';

const YearSelector = ({ isMap, year, onChange }) => {
  const yearEvents = useYearEvents()
  return (
    <div>
      <div className="yearNavigator">
        <ArrowLeftCircle className="arrowButton" onClick={() => onChange(year - 1)} />
        <h2 className="bigYearLabel">{year}</h2>
        <ArrowRightCircle className="arrowButton" onClick={() => onChange(year + 1)} />

      </div>
      <div>
        <EventCount events={yearEvents} isMap={isMap} />
      </div>
    </div>
  );
};

export default YearSelector;
