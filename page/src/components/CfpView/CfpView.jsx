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
import CfpSpeakerStatus from 'components/CfpSpeakerStatus/CfpSpeakerStatus';

const CfpView = ({ events: providedEvents, showSpeakerStatuses = false }) => {
  const cfpEvents = useCfpEvents();
  let events = providedEvents || cfpEvents;
  const { isFavorite } = useFavoritesContext();
  const { toggleTag } = useFilters();
  const { t } = useTranslation();

  const handleTagClick = (key, value) => {
    toggleTag(key, value);
  };

  const groupingDate = event => showSpeakerStatuses ? event.date[0] : event.cfp.untilDate;

  events = events.sort((a, b) => {
    return new Date(groupingDate(a)) - new Date(groupingDate(b));
  });

  const eventsByMonth = events.reduce((acc, cur) => {
    let monthKey;
    monthKey = getMonthName(new Date(groupingDate(cur)).getMonth());
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
    <div className={`cfpView ${showSpeakerStatuses ? 'cfp-companion' : ''}`}>
      {monthOrder.map(month => {
        const monthIndex = getMonthNames().indexOf(month);
        const translatedMonth = getTranslatedMonthName(monthIndex, t);
        
        return (
          <React.Fragment key={month}>
            <h1>{(showSpeakerStatuses ? t('months.monthEvents') : t('months.monthCfpDeadlines')).replace('{month}', translatedMonth)}</h1>
          <div className="eventsGridDisplay">
            {eventsByMonth[month].map((e, i) => {
              const eventId = `${e.name}-${e.date[0]}`;
              const isFav = isFavorite(eventId);

              return (
                <div className={`eventCell ${isFav ? 'favorite-event' : ''}`} key={`${month}_ev_${i}`}>

                  <div className="content">
                    <div className={showSpeakerStatuses ? 'cfp-companion-row' : ''}>
                      <div className={showSpeakerStatuses ? 'cfp-companion-main' : ''}>
                      <span className="when"><ShortDate dates={e.date} /></span>
                      <div className="event-header">
                        <b>{e.hyperlink ? <a className="title" href={e.hyperlink} rel="noreferrer" target="_blank">{e.name}</a> : ''}</b>
                        <FavoriteButton event={e} />
                      </div>

                      {!showSpeakerStatuses ? <CfpDeadline until={e.cfp.until} untilDate={e.cfp.untilDate} /> : null}

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
                      {showSpeakerStatuses ? <CfpSpeakerStatus eventId={eventId} /> : null}
                    </div>
                    {!showSpeakerStatuses ? <a className="submitButton" href={e.cfp.link} rel="noreferrer" target="_blank" title={t('cfp.submitToCfp')}>
                      <CalendarClock />
                      {t('cfp.submitToCfp')}
                    </a> : null}
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
