import { useState } from 'react'

import { Check, FileText, X } from 'lucide-react'

import { getCfpSpeakerStatus, setCfpSpeakerStatus } from 'utils/cfpSpeakerStatuses'
import { useTranslation } from 'contexts/LanguageContext'
import 'styles/CfpSpeakerStatus.css'

const statuses = [
  { id: 'applied', Icon: FileText },
  { id: 'accepted', Icon: Check },
  { id: 'rejected', Icon: X }
]

const CfpSpeakerStatus = ({ eventId }) => {
  const { t } = useTranslation()
  const [status, setStatus] = useState(() => getCfpSpeakerStatus(eventId))

  const selectStatus = (nextStatus) => {
    setCfpSpeakerStatus(eventId, nextStatus)
    setStatus(currentStatus => currentStatus === nextStatus ? undefined : nextStatus)
  }

  return (
    <div aria-label={t('cfp.companionStatus')} className="cfp-speaker-status">
      {statuses.map(({ id, Icon }) => (
        <button
          aria-label={t(`cfp.${id}`)}
          aria-pressed={status === id}
          className={`cfp-speaker-status-button ${id} ${status === id ? 'selected' : ''}`}
          key={id}
          onClick={() => selectStatus(id)}
          title={t(`cfp.${id}`)}
          type="button"
        >
          <Icon aria-hidden="true" size={18} />
        </button>
      ))}
    </div>
  )
}

export default CfpSpeakerStatus