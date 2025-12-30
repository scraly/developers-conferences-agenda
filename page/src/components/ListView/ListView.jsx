import React, { useRef } from 'react';
import 'styles/ListView.css';
import 'styles/MonthNavigation.css';

import {useYearEvents} from 'app.hooks';
import { useFilters } from 'app.hooks';
import {getMonthName, getMonthNames} from 'utils';
import ShortDate from 'components/ShortDate/ShortDate';
import FavoriteButton from 'components/FavoriteButton/FavoriteButton';
import TagBadges from 'components/TagBadges/TagBadges';
import { useFavoritesContext } from '../../contexts/FavoritesContext';
import { Edit } from 'lucide-react';
import EditEventInlineForm from 'components/EditEventForm/EditEventInlineForm';

const ListView = () => {
  let events = useYearEvents();
  const { filters, toggleTag } = useFilters();
  const { isFavorite } = useFavoritesContext();

  const handleTagClick = (key, value) => {
    toggleTag(key, value);
  };

  // Sort events based on the selected sort option
  events = events.sort((a, b) => {
    if (filters.sort === 'cfp') {
      if (!a.cfp?.untilDate || !b.cfp?.untilDate) return 0;
      return new Date(a.cfp.untilDate) - new Date(b.cfp.untilDate);
    }
    return new Date(a.date[0]) - new Date(b.date[0]);
  });

  const eventsByMonth = events.reduce((acc, cur) => {
    let monthKey;
    if (filters.sort === 'cfp' && cur.cfp?.untilDate) {
      monthKey = getMonthName(new Date(cur.cfp.untilDate).getMonth());
    } else {
      monthKey = getMonthName(new Date(cur.date[0]).getMonth());
    }

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(cur);

    // Only add to next month if it's not CFP sort and has multiple dates
    if (filters.sort !== 'cfp' && cur.date.length > 1) {
      const nextMonth = getMonthName(new Date(cur.date[1]).getMonth());
      if (monthKey !== nextMonth) {
        if (!acc[nextMonth]) {
          acc[nextMonth] = [];
        }
        acc[nextMonth].push(cur);
      }
    }
    return acc;
  }, {});

  // Get the month names in the correct order based on sort type
  const monthOrder = Object.keys(eventsByMonth).sort((a, b) => {
    const monthA = getMonthNames().indexOf(a);
    const monthB = getMonthNames().indexOf(b);
    return monthA - monthB;
  });

  const [editEvent, setEditEvent] = React.useState(null);
  const [activeMonth, setActiveMonth] = React.useState(null);
  const monthRefs = useRef({});

  const scrollToMonth = (month) => {
    if (monthRefs.current[month]) {
      monthRefs.current[month].scrollIntoView({ behavior: 'smooth' });
      setActiveMonth(month);
    }
  };

  return (
    <>
      <div className="month-navigation">
        {monthOrder.map(month => (
          <button
            key={`nav-${month}`}
            className={`month-button ${activeMonth === month ? 'active' : ''}`}
            onClick={() => scrollToMonth(month)}
          >
            {month}
          </button>
        ))}
      </div>
      <div className="listView">
      {monthOrder.map(month => (
        <React.Fragment key={month}>
          <h1 ref={el => monthRefs.current[month] = el}>{month}{filters.sort === 'cfp' ? ' CFP Deadlines' : ' Events'}:</h1>
          {eventsByMonth[month].map((e, i) => {
            const eventId = `${e.name}-${e.date[0]}`;
            const isFav = isFavorite(eventId);
            return (
              <div className={`event-list-entry ${isFav ? 'favorite-event' : ''}`} key={`${month}_ev_${i}`}>
                <div className="event-details">
                  <div className="event-date-fav">
                    <FavoriteButton event={e} />
                    <ShortDate dates={e.date} />
                  </div>
                  <div className="event-list-header">
                    <b>{e.hyperlink ? <a className="title" href={e.hyperlink} rel="noreferrer" target="_blank">{e.name}</a> : ''}</b>
                    <span>{e.location}</span>
                    <span dangerouslySetInnerHTML={{__html: e.misc}} />
                    {e.sponsoring ? <span><a class="sponsoring" href={e.sponsoring} rel="noreferrer" target="_blank">💰</a></span> : null}
                    {e.closedCaptions ? <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span> : null}
                  </div>
                </div>
                <TagBadges onTagClick={handleTagClick} tags={e.tags} />
                <button
                  className="edit-inline-btn"
                  title="Edit this event"
                  aria-label="Edit this event"
                  onClick={() => setEditEvent(e)}
                  style={{ marginLeft: '1em', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Edit size={18} />
                </button>
              </div>
            );
          })}
        </React.Fragment>
      ))}
      {editEvent && (
        <EditEventInlineForm event={editEvent} onClose={() => setEditEvent(null)} />
      )}
      </div>
    </>
  );
};

export default ListView;
