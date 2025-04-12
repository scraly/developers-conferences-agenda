import React from 'react';
import './YearSelector.css';

import {ArrowLeftCircle, ArrowRightCircle} from 'lucide-react';

import {createSearchParams, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {useView} from 'app.hooks';

const YearSelector = () => {
  const {year} = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = useView();

  const changeYear = newYear => {
    navigate(`/${newYear}/${view}?${createSearchParams(searchParams)}`);
  };

  return (
    <div className="yearSelector">
      <ArrowLeftCircle onClick={() => changeYear(Number(year) - 1)} className="arrowButton" />
      <h2>{year}</h2>
      <ArrowRightCircle onClick={() => changeYear(Number(year) + 1)} className="arrowButton" />
    </div>
  );
};

export default YearSelector;
