import React, { useMemo } from 'react'

import 'styles/CfpCompanionView.css'

import { useCfpCompanionEvents, useFilters } from 'app.hooks'
import { getMonthName, getMonthNames, getTranslatedMonthName, getUTCMonth, getUTCDateValue } from 'utils'
import ShortDate from 'components/ShortDate/ShortDate'
import FavoriteButton from 'components/FavoriteButton/FavoriteButton'
import TagBadges from 'components/TagBadges/TagBadges'
import CfpSpeakerStatus from 'components/CfpSpeakerStatus/CfpSpeakerStatus'
import { useFavoritesContext } from 'contexts/FavoritesContext'
import { useTranslation } from 'contexts/LanguageContext'

const CfpCompanionView = () => {
  const events = useCfpCompanionEvents()
  const { toggleTag } = useFilters()
  const { isFavorite } = useFavoritesContext()
  const { t } = useTranslation()

  const sortedEvents = useMemo(() => {
    return [...events].sort((firstEvent, secondEvent) => (
      getUTCDateValue(firstEvent.date[0]) - getUTCDateValue(secondEvent.date[0])
    ))
  }, [events])

  const eventsByMonth = useMemo(() => {
    return sortedEvents.reduce((result, event) => {
      const monthKey = getMonthName(getUTCMonth(event.date[0]))
      if (!result[monthKey]) {
        result[monthKey] = []
      }
      result[monthKey].push(event)
      return result
    }, {})
  }, [sortedEvents])

  const monthOrder = useMemo(() => {
    return Object.keys(eventsByMonth).sort((firstMonth, secondMonth) => (
      getMonthNames().indexOf(firstMonth) - getMonthNames().indexOf(secondMonth)
    ))
  }, [eventsByMonth])

  return (
    <div className="listView cfp-companion-view">
      {monthOrder.map(month => {
        const monthIndex = getMonthNames().indexOf(month)
        const translatedMonth = getTranslatedMonthName(monthIndex, t)

        return (
          <React.Fragment key={month}>
            <h1>{t('months.monthEvents').replace('{month}', translatedMonth)}</h1>
            {eventsByMonth[month].map((event, index) => {
              const eventId = `${event.name}-${event.date[0]}`
              const isFav = isFavorite(eventId)

              return (
                <div className={`event-list-entry ${isFav ? 'favorite-event' : ''}`} key={`${month}_ev_${index}`}>
                  <FavoriteButton event={event} />
                  <CfpSpeakerStatus eventId={eventId} />
                  <div className="event-details">
                    <div className="event-date-fav">
                      <ShortDate dates={event.date} />
                    </div>
                    <div className="event-list-header">
                      <b>{event.hyperlink ? <a className="title" href={event.hyperlink} rel="noreferrer" target="_blank">{event.name}</a> : event.name}</b>
                      <span>{event.location}</span>
                      {typeof event.attendees === 'number' ? <span className="attendees">👥 {event.attendees}</span> : null}
                    </div>
                  </div>
                  <TagBadges onTagClick={toggleTag} tags={event.tags} />
                </div>
              )
            })}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default CfpCompanionView