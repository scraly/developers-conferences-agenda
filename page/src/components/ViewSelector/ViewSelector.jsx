import React from 'react';
import {useNavigate, useSearchParams, createSearchParams, useParams} from "react-router-dom";
import { useTranslation } from 'contexts/LanguageContext';
import RecordingsToggle from 'components/RecordingsToggle/RecordingsToggle';
import 'styles/ViewSelector.css';
import {Calendar, List, Map, Megaphone, Mic} from 'lucide-react';

const ViewSelector = ({selected}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {year} = useParams();
  const { t } = useTranslation();

  const views = [
    { key: 'cfp',           Icon: Megaphone, label: t('nav.cfp'),          path: `/${year}/cfp` },
    { key: 'cfp-companion', Icon: Mic,       label: t('nav.cfpCompanion'), path: `/${year}/cfp-companion` },
    { key: 'calendar',      Icon: Calendar,  label: t('nav.calendar'),     path: `/${year}/calendar` },
    { key: 'list',          Icon: List,      label: t('nav.list'),         path: `/${year}/list` },
    { key: 'map',           Icon: Map,       label: t('nav.map'),          path: `/${year}/map` },
  ];

  return (
    <div className="view-type-selector">
      <RecordingsToggle />
      {views.map(({ key, Icon, label, path }) => (
        <div
          aria-label={label}
          className={`view-selector ${key}-view view-selector-tooltip ${selected === key ? 'selected' : ''}`}
          data-tooltip={label}
          key={key}
          onClick={() => navigate(`${path}?${createSearchParams(searchParams)}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(`${path}?${createSearchParams(searchParams)}`);
            }
          }}
        >
          <Icon size="42px" />
        </div>
      ))}
    </div>
  );
};

export default ViewSelector;
