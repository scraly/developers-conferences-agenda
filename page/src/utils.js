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

// Get translated month name using translation function
export const getTranslatedMonthName = (monthIndex, t) => {
  const monthKeys = [
    'january', 'february', 'march', 'april',
    'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december'
  ];
  return t(`months.${monthKeys[monthIndex]}`);
};

// Get translated short month name using translation function
export const getTranslatedMonthNameShort = (monthIndex, t) => {
  const monthShortKeys = [
    'jan', 'feb', 'mar', 'apr',
    'mayShort', 'jun', 'jul', 'aug',
    'sep', 'oct', 'nov', 'dec'
  ];
  return t(`months.${monthShortKeys[monthIndex]}`);
};
