const lpad2 = (number) => ('0' + number).slice(-2)

export const formatDate = (date) => date.getFullYear() + '-' + lpad2(date.getMonth() + 1) + '-' + lpad2(date.getDate())

export const getMonthNames = () => [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export const getMonthName = (month) => getMonthNames()[month]
export const getMonthNameShort = (month) => getMonthName(month).slice(0, 3)
