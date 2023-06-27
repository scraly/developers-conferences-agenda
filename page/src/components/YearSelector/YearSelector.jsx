import React from 'react';

import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';


import 'styles/YearSelector.css';

const YearSelector = ({year, onChange}) => {
  return (
    <div className="yearNavigator">
      <ArrowLeftCircle onClick={() => onChange(year - 1)} />
      <h2 className="bigYearLabel">{year}</h2>
      <ArrowRightCircle onClick={() => onChange(year + 1)} />
    </div>
  );
};

export default YearSelector;
