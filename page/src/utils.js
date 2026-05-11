const lpad2 = (number) => ('0' + number).slice(-2)

const asDate = (dateLike) => (dateLike instanceof Date ? dateLike : new Date(dateLike))

export const createUTCDate = (year, month, day) => new Date(Date.UTC(year, month, day))

export const getUTCYear = (dateLike) => asDate(dateLike).getUTCFullYear()

export const getUTCMonth = (dateLike) => asDate(dateLike).getUTCMonth()

export const getUTCDay = (dateLike) => asDate(dateLike).getUTCDate()

export const getUTCDateValue = (dateLike) => Date.UTC(
  getUTCYear(dateLike),
  getUTCMonth(dateLike),
  getUTCDay(dateLike)
)

export const isSameUTCDate = (leftDate, rightDate) => getUTCDateValue(leftDate) === getUTCDateValue(rightDate)

export const isUTCDateInRange = (date, startDate, endDate) => {
  const dateValue = getUTCDateValue(date)
  return getUTCDateValue(startDate) <= dateValue && dateValue <= getUTCDateValue(endDate)
}

export const formatDate = (date) => getUTCYear(date) + '-' + lpad2(getUTCMonth(date) + 1) + '-' + lpad2(getUTCDay(date))

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

// Get translated month name using translation function
export const getTranslatedMonthName = (monthIndex, t) => {
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return '';
  }

  const monthKeys = [
    'january', 'february', 'march', 'april',
    'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december'
  ];
  return t(`months.${monthKeys[monthIndex]}`);
};

// Get translated short month name using translation function
export const getTranslatedMonthNameShort = (monthIndex, t) => {
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return '';
  }

  const monthShortKeys = [
    'jan', 'feb', 'mar', 'apr',
    'mayShort', 'jun', 'jul', 'aug',
    'sep', 'oct', 'nov', 'dec'
  ];
  return t(`months.${monthShortKeys[monthIndex]}`);
};
