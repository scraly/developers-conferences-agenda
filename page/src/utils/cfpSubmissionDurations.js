const CFP_SUBMISSION_DURATIONS_KEY = 'developer-conferences-cfp-submission-durations'

const getSubmissions = () => {
  try {
    const submissions = localStorage.getItem(CFP_SUBMISSION_DURATIONS_KEY)
    return submissions ? JSON.parse(submissions) : {}
  } catch (error) {
    console.error('Error loading CFP submission durations:', error)
    return {}
  }
}

const saveSubmissions = submissions => {
  try {
    localStorage.setItem(CFP_SUBMISSION_DURATIONS_KEY, JSON.stringify(submissions))
  } catch (error) {
    console.error('Error saving CFP submission durations:', error)
  }
}

export const getCfpSubmissionDurations = eventId => getSubmissions()[eventId] || []

export const toggleCfpSubmissionDuration = (eventId, duration) => {
  const submissions = getSubmissions()
  const selectedDurations = submissions[eventId] || []
  const nextDurations = selectedDurations.includes(duration)
    ? selectedDurations.filter(selectedDuration => selectedDuration !== duration)
    : [...selectedDurations, duration]

  if (nextDurations.length === 0) {
    delete submissions[eventId]
  } else {
    submissions[eventId] = nextDurations
  }

  saveSubmissions(submissions)
  return nextDurations
}