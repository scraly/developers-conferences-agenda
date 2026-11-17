import { useState } from 'react'

import { getCfpSubmissionDurations, toggleCfpSubmissionDuration } from 'utils/cfpSubmissionDurations'
import { useTranslation } from 'contexts/LanguageContext'
import 'styles/CfpCompanionView.css'

const formatDuration = (duration, t) => {
  const [type, value] = duration.split(':')
  const label = t(`cfpCompanion.${type === 'talk' ? 'talks' : 'workshops'}`)
  return `${label}: ${/^\d+$/.test(value) ? `${value} min` : value}`
}

const CfpSubmissionDurations = ({ eventId, durations }) => {
  const { t } = useTranslation()
  const [submittedDurations, setSubmittedDurations] = useState(() => getCfpSubmissionDurations(eventId))

  const toggleDuration = duration => {
    setSubmittedDurations(toggleCfpSubmissionDuration(eventId, duration))
  }

  return (
    <div aria-label={t('cfpCompanion.submittedFormats')} className="cfp-submission-durations">
      {durations.map(duration => (
        <button
          aria-pressed={submittedDurations.includes(duration)}
          className={`cfp-submission-duration ${submittedDurations.includes(duration) ? 'selected' : ''}`}
          key={duration}
          onClick={() => toggleDuration(duration)}
          title={t('cfpCompanion.submittedFormats')}
          type="button"
        >
          {formatDuration(duration, t)}
        </button>
      ))}
    </div>
  )
}

export default CfpSubmissionDurations