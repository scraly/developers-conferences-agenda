import React from 'react';
import {useNavigate, useSearchParams, createSearchParams, useParams} from 'react-router-dom';
import {Calendar, List, Map as MapIcon, Megaphone} from 'lucide-react';
import {useView} from 'app.hooks';
import './ViewSelector.css';

const ViewSelector = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {year} = useParams();
  const view = useView();

  return (
    // biome-ignore lint/a11y/useSemanticElements: <explanation>
    <div className="viewSelector" role="group">
      <button
        type="button"
        className={view === 'cfp' ? 'primary' : 'outline'}
        onClick={() => navigate(`/${year}/cfp?${createSearchParams(searchParams)}`)}
        aria-current={view === 'cfp'}
        aria-label="Opened CFPs"
        title="Opened CFPs"
        data-tooltip="Opened CFPs"
        data-placement="bottom"
      >
        <Megaphone size="32px" />
      </button>
      <button
        type="button"
        className={view === 'calendar' ? 'primary' : 'outline'}
        onClick={() => navigate(`/${year}/calendar?${createSearchParams(searchParams)}`)}
        aria-current={view === 'calendar'}
        aria-label="Calendar"
        title="Calendar"
        data-tooltip="Calendar"
        data-placement="bottom"
      >
        <Calendar size="32px" />
      </button>
      <button
        type="button"
        className={view === 'list' ? 'primary' : 'outline'}
        onClick={() => navigate(`/${year}/list?${createSearchParams(searchParams)}`)}
        aria-current={view === 'list'}
        aria-label="List"
        title="List"
        data-tooltip="List"
        data-placement="bottom"
      >
        <List size="32px" />
      </button>
      <button
        type="button"
        className={view === 'map' ? 'primary' : 'outline'}
        onClick={() => navigate(`/${year}/map?${createSearchParams(searchParams)}`)}
        aria-current={view === 'map'}
        aria-label="Map"
        title="Map"
        data-tooltip="Map"
        data-placement="bottom"
      >
        <MapIcon size="32px" />
      </button>
    </div>
  );
};

export default ViewSelector;
