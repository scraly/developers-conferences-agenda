import React from 'react';
import 'styles/CfpView.css';
import { CalendarClock } from 'lucide-react';

import { useCfpEvents, useFilters } from 'app.hooks';
import { getMonthName, getMonthNames, getTranslatedMonthName } from 'utils';
import { flag } from 'country-emoji';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import TagBadges from 'components/TagBadges/TagBadges';
import { useFavoritesContext } from '../../contexts/FavoritesContext';
import { useTranslation } from 'contexts/LanguageContext';
import ShortDate from 'components/ShortDate/ShortDate';
import CfpDeadline from 'components/CfpDeadline/CfpDeadline';

const CfpView = () => {
  let events = useCfpEvents();
  const { isFavorite } = useFavoritesContext();
  const { toggleTag } = useFilters();
  const { t } = useTranslation();

  const handleTagClick = (key, value) => {
    toggleTag(key, value);
  };

  // Sort CFPs based on the closing date
  events = events.sort((a, b) => {
    if (!a.cfp?.untilDate || !b.cfp?.untilDate) return 0;
    return new Date(a.cfp.untilDate) - new Date(b.cfp.untilDate);
  });

  const eventsByMonth = events.reduce((acc, cur) => {
    let monthKey;
    monthKey = getMonthName(new Date(cur.cfp.untilDate).getMonth());
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(cur);

    return acc;
  }, {});

  // Get the month names in the correct order based on sort type
  const monthOrder = Object.keys(eventsByMonth).sort((a, b) => {
    const monthA = getMonthNames().indexOf(a);
    const monthB = getMonthNames().indexOf(b);
    return monthA - monthB;
  });

  return (
    <div className="cfpView">
      {monthOrder.map(month => {
        const monthIndex = getMonthNames().indexOf(month);
        const translatedMonth = getTranslatedMonthName(monthIndex, t);
        
        return (
          <React.Fragment key={month}>
            <h1>{t('months.monthCfpDeadlines').replace('{month}', translatedMonth)}</h1>
          <div className="eventsGridDisplay">
            {eventsByMonth[month].map((e, i) => {
              const eventId = `${e.name}-${e.date[0]}`;
              const isFav = isFavorite(eventId);

              return (
                <div className={`eventCell ${isFav ? 'favorite-event' : ''}`} key={`${month}_ev_${i}`}>

                  <div className="content">
                    <div>
                      <span className="when"><ShortDate dates={e.date} /></span>
                      <div className="event-header">
                        <b>{e.hyperlink ? <a className="title" href={e.hyperlink} rel="noreferrer" target="_blank">{e.name}</a> : ''}</b>
                        <FavoriteButton event={e} />
                      </div>

                      <CfpDeadline until={e.cfp.until} untilDate={e.cfp.untilDate} />

                    <div className="country">
                      <span className="countryFlag">
                        {e.country !== 'Online' ? flag(e.country) : '🌎'}
                      </span>

                      <span className="countryName">
                        {e.location}
                        {e.attendees ? (
                          <span className="attendees">
                            {' '}· 👥 {e.attendees}
                          </span>
                        ) : null}
                      </span>
                    </div>

                      <div>
                        <span>{e.sponsoring ? <a className="sponsoring" href={e.sponsoring} rel="noreferrer" target="_blank">💰</a> : null}</span>
                      </div>
                      <TagBadges onTagClick={handleTagClick} tags={e.tags} />
                    </div>
                    <a className="submitButton" href={e.cfp.link} rel="noreferrer" target="_blank" title={t('cfp.submitToCfp')}>
                      <CalendarClock />
                      {t('cfp.submitToCfp')}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          </React.Fragment>
        );
      })}
    </div>
  );

};

export default CfpView;
