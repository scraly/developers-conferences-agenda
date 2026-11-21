import React from 'react';
import {useNavigate, useSearchParams, createSearchParams, useParams} from "react-router-dom";
import { useTranslation } from 'contexts/LanguageContext';
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
      {views.map(({ key, Icon, label, path }) => (
        <span className="view-selector-tooltip" data-tooltip={label} key={key}>
          <Icon
            aria-label={label}
            className={`view-selector ${key}-view${selected === key ? ' selected' : ''}`}
            onClick={() => navigate(`${path}?${createSearchParams(searchParams)}`)}
            size="42px"
          />
        </span>
      ))}
    </div>
  );
};

export default ViewSelector;
