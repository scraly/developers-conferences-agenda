import { Check, FileText, X } from 'lucide-react'

import { useCfpSpeakerStatusContext } from 'contexts/CfpSpeakerStatusContext'
import { useTranslation } from 'contexts/LanguageContext'
import 'styles/CfpSpeakerStatus.css'

const statuses = [
  { id: 'applied', Icon: FileText },
  { id: 'accepted', Icon: Check },
  { id: 'rejected', Icon: X }
]

const CfpSpeakerStatus = ({ eventId }) => {
  const { t } = useTranslation()
  const { getStatus, updateStatus } = useCfpSpeakerStatusContext()
  const status = getStatus(eventId)

  return (
    <div aria-label={t('cfp.companionStatus')} className="cfp-speaker-status">
      {statuses.map(({ id, Icon }) => (
        <button
          aria-label={t(`cfp.${id}`)}
          aria-pressed={id === 'applied' ? Boolean(status.applied) : status.outcome === id}
          className={`cfp-speaker-status-button ${id} ${(id === 'applied' ? status.applied : status.outcome === id) ? 'selected' : ''}`}
          key={id}
          onClick={() => updateStatus(eventId, id)}
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