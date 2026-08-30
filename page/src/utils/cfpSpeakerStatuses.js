const CFP_SPEAKER_STATUSES_KEY = 'developer-conferences-cfp-speaker-statuses'

const getStatuses = () => {
  try {
    const statuses = localStorage.getItem(CFP_SPEAKER_STATUSES_KEY)
    return statuses ? JSON.parse(statuses) : {}
  } catch (error) {
    console.error('Error loading CFP speaker statuses:', error)
    return {}
  }
}

const saveStatuses = (statuses) => {
  try {
    localStorage.setItem(CFP_SPEAKER_STATUSES_KEY, JSON.stringify(statuses))
  } catch (error) {
    console.error('Error saving CFP speaker statuses:', error)
  }
}

const normalizeStatus = (status) => {
  if (typeof status === 'string') {
    return {
      applied: status === 'applied',
      outcome: status === 'accepted' || status === 'rejected' ? status : undefined
    }
  }

  return status || { applied: false, outcome: undefined }
}

export const getCfpSpeakerStatus = (eventId) => normalizeStatus(getStatuses()[eventId])

export const setCfpSpeakerStatus = (eventId, status) => {
  const statuses = getStatuses()
  const currentStatus = normalizeStatus(statuses[eventId])
  const nextStatus = { ...currentStatus }

  if (status === 'applied') {
    nextStatus.applied = !currentStatus.applied
  } else {
    nextStatus.outcome = currentStatus.outcome === status ? undefined : status
  }

  if (!nextStatus.applied && !nextStatus.outcome) {
    delete statuses[eventId]
  } else {
    statuses[eventId] = nextStatus
  }

  saveStatuses(statuses)
}