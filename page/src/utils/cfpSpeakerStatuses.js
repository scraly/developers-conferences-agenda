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

export const getCfpSpeakerStatus = (eventId) => getStatuses()[eventId]

export const setCfpSpeakerStatus = (eventId, status) => {
  const statuses = getStatuses()

  if (statuses[eventId] === status) {
    delete statuses[eventId]
  } else {
    statuses[eventId] = status
  }

  saveStatuses(statuses)
}