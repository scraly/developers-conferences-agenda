import { formatDate } from 'utils'

export const formatEventDates = (dates) => [...dates].map((d) => formatDate(new Date(d))).join(' -> ')
