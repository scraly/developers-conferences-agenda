import React from 'react';

import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';


import 'styles/YearSelector.css';
import { getYearEvents } from 'utils';
import EventCount from 'components/EventCount/EventCount';

const YearSelector = ({ year, onChange }) => {
  return (
    <div>
      <div className="yearNavigator">
        <ArrowLeftCircle className="arrowButton" onClick={() => onChange(year - 1)} />
        <h2 className="bigYearLabel">{year}</h2>
        <ArrowRightCircle className="arrowButton" onClick={() => onChange(year + 1)} />

      </div>
      <div>
        <EventCount events={getYearEvents(year)} />
      </div>
    </div>
  );
};

export default YearSelector;
