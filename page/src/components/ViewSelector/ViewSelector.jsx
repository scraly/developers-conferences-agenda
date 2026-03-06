import React from 'react';
import {useNavigate, useSearchParams, createSearchParams, useParams} from "react-router-dom";
import { useTranslation } from 'contexts/LanguageContext';
import 'styles/ViewSelector.css';
import {Calendar, List, Map, Megaphone} from 'lucide-react';

const ViewSelector = ({selected}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {year} = useParams();
  const { t } = useTranslation();

  return (
    <div className="view-type-selector">
      <Megaphone
        aria-label={t('nav.cfp')}
        className={selected === 'cfp' ? 'view-selector cfp-view selected' : 'view-selector cfp-view'}
        onClick={() => navigate(`/${year}/cfp?${createSearchParams(searchParams)}`)}
        size="42px"
        title={t('nav.cfp')}
      />
      <Calendar
        aria-label={t('nav.calendar')}
        className={selected === 'calendar' ? 'view-selector calendar-view selected' :  'view-selector calendar-view'}
        onClick={() => navigate(`/${year}/calendar?${createSearchParams(searchParams)}`)}
        size="42px"
        title={t('nav.calendar')}
      />
      <List
        aria-label={t('nav.list')}
        className={selected === 'list' ? 'view-selector list-view selected' : 'view-selector list-view'}
        onClick={() => navigate(`/${year}/list?${createSearchParams(searchParams)}`)}
        size="42px"
        title={t('nav.list')}
      />
      <Map
        aria-label={t('nav.map')}
        className={selected === 'map' ? 'view-selector map-view selected' : 'view-selector map-view'}
        onClick={() => navigate(`/${year}/map?${createSearchParams(searchParams)}`)}
        size="42px"
        title={t('nav.map')}
      />
    </div>
  );
};

export default ViewSelector;
