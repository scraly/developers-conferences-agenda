const lpad2 = number => ('0' + number).slice(-2);

export const formatDate = date =>
  date.getFullYear() + '-' + lpad2(date.getMonth() + 1) + '-' + lpad2(date.getDate());
