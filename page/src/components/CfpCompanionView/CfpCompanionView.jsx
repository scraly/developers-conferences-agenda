import React from 'react'

import 'styles/CfpCompanionView.css'

import { useFilters } from 'app.hooks'
import { useSearchParams } from 'react-router-dom'
import { getMonthName, getMonthNames, getTranslatedMonthName } from 'utils'
import ShortDate from 'components/ShortDate/ShortDate'
import FavoriteButton from 'components/FavoriteButton/FavoriteButton'
import TagBadges from 'components/TagBadges/TagBadges'
import CfpSpeakerStatus from 'components/CfpSpeakerStatus/CfpSpeakerStatus'
import { useTranslation } from 'contexts/LanguageContext'
import { filterEventsBySpeakerStatus } from 'utils/cfpSpeakerStatuses'

const CfpCompanionView = ({ events }) => {
  const { toggleTag } = useFilters()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const selectedStatuses = (searchParams.get('cfpStatus') || '').split(',').filter(Boolean)

  const sortedEvents = [...filterEventsBySpeakerStatus(events, selectedStatuses)].sort((firstEvent, secondEvent) => (
    new Date(firstEvent.date[0]) - new Date(secondEvent.date[0])
  ))

  const eventsByMonth = sortedEvents.reduce((result, event) => {
    const monthKey = getMonthName(new Date(event.date[0]).getMonth())
    if (!result[monthKey]) {
      result[monthKey] = []
    }
    result[monthKey].push(event)
    return result
  }, {})

  const monthOrder = Object.keys(eventsByMonth).sort((firstMonth, secondMonth) => (
    getMonthNames().indexOf(firstMonth) - getMonthNames().indexOf(secondMonth)
  ))

  return (
    <div className="listView cfp-companion-view">
      {monthOrder.map(month => {
        const monthIndex = getMonthNames().indexOf(month)
        const translatedMonth = getTranslatedMonthName(monthIndex, t)

        return (
          <React.Fragment key={month}>
            <h1>{t('months.monthEvents').replace('{month}', translatedMonth)}</h1>
            {eventsByMonth[month].map(event => {
              const eventId = `${event.name}-${event.date[0]}`

              return (
                <div className="event-list-entry" key={eventId}>
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