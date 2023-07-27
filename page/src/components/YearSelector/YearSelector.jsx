import React from 'react';

import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';


import 'styles/YearSelector.css';
import { getYearEvents } from 'utils';
import EventCount from 'components/EventCount/EventCount';

const YearSelector = ({ year, onChange }) => {
  console.log(`year: ${year}`);
  return (
    <div>
      <div className="yearNavigator">
        <ArrowLeftCircle onClick={() => onChange(year - 1)} />
        <h2 className="bigYearLabel">{year}</h2>
        <ArrowRightCircle onClick={() => onChange(year + 1)} />

      </div>
      <div>
        <EventCount events={getYearEvents(year)} />
      </div>
    </div>
  );
};

export default YearSelector;
