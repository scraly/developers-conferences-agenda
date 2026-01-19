import React from 'react';
import 'styles/CfpView.css';
import { CalendarClock } from 'lucide-react';

import { useCfpEvents, useFilters } from 'app.hooks';
import { getMonthName, getMonthNames } from 'utils';
import { flag } from 'country-emoji';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import TagBadges from 'components/TagBadges/TagBadges';
import { useFavoritesContext } from '../../contexts/FavoritesContext';
import ShortDate from 'components/ShortDate/ShortDate';
import CfpDeadline from 'components/CfpDeadline/CfpDeadline';

const CfpView = () => {
  let events = useCfpEvents();
  const { isFavorite } = useFavoritesContext();
  const { toggleTag } = useFilters();

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
      {monthOrder.map(month => (
        <React.Fragment key={month}>
          <h1>{month} Opened CFPs:</h1>
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
                        <span className="countryFlag">{e.country != "Online" ? flag(e.country) : '🌎'}</span>
                        <span className="countryName">{e.location}</span>
                      </div>
                      {e.sponsoring ? <a href={e.sponsoring} rel="noreferrer" target="_blank">💰</a> : null}
                      {(() => {
                        const inlineDiscounts = e.discounts || [];
                        const inlineCodeSet = new Set(inlineDiscounts.map(d => d.code));
                        const metadataDiscounts = e.metadata?.discountCodes?.filter(code => !inlineCodeSet.has(code)) || [];
                        const hasDiscounts = inlineDiscounts.length > 0 || metadataDiscounts.length > 0;
                        
                        return hasDiscounts ? (
                          <div className="discounts">
                            {inlineDiscounts.map((discount, idx) => (
                              <span key={`inline-${idx}`} className="discount-badge" aria-label={`Discount code: ${discount.code}${discount.value ? `, saves ${discount.value}` : ''}`}>
                                {discount.code}{discount.value ? ` - ${discount.value}` : ''}
                              </span>
                            ))}
                            {metadataDiscounts.map((code, idx) => (
                              <span key={`meta-${idx}`} className="discount-badge metadata-badge" aria-label={`Discount code: ${code}`}>
                                {code}
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()}
                      <TagBadges onTagClick={handleTagClick} tags={e.tags} />
                    </div>
                    <a className="submitButton" href={e.cfp.link} rel="noreferrer" target="_blank" title="Submit to the CFP">
                      <CalendarClock />
                      Submit to the CFP
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );

};

export default CfpView;
