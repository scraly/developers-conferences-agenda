import React from 'react';
import {useNavigate, useSearchParams, createSearchParams, useParams} from "react-router-dom";
import 'styles/ViewSelector.css';
import {Calendar, List, Map, Megaphone} from 'lucide-react';

const ViewSelector = ({selected}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {year} = useParams();

  return (
    <div className="view-type-selector">
      <Megaphone
        className={selected === 'cfp' ? 'view-selector cfp-view selected' : 'view-selector cfp-view'}
        onClick={() => navigate(`/${year}/cfp?${createSearchParams(searchParams)}`)}
        size={'32px'}
      />
      <Calendar
        className={selected === 'calendar' ? 'view-selector calendar-view selected' :  'view-selector calendar-view'}
        onClick={() => navigate(`/${year}/calendar?${createSearchParams(searchParams)}`)}
        size={'32px'}
      />
      <List
        className={selected === 'list' ? 'view-selector list-view selected' : 'view-selector list-view'}
        onClick={() => navigate(`/${year}/list?${createSearchParams(searchParams)}`)}
        size={'32px'}
      />
      <Map
        className={selected === 'map' ? 'view-selector map-view selected' : 'view-selector map-view'}
        onClick={() => navigate(`/${year}/map?${createSearchParams(searchParams)}`)}
        size={'32px'}
      />
    </div>
  );
};

export default ViewSelector;
