import {getMonthNameShort} from 'utils';
import {ArrowRight} from 'lucide-react';
import './ShortDate.css';

const ShortDate = ({dates}) => {
  const startDate = `${new Date(dates[0]).getDate()}-${getMonthNameShort(
    new Date(dates[0]).getMonth()
  )}`;
  let endDate = '';
  if (dates.length > 1) {
    endDate = new Date(dates[1]).getDate();
    endDate = `${new Date(dates[1]).getDate()}-${getMonthNameShort(new Date(dates[1]).getMonth())}`;
  }
  if (endDate) {
    return (
      <span className="shortDate">
        {startDate}
        <ArrowRight />
        {endDate}
      </span>
    );
  }
  return <span className="shortDate">{startDate}</span>;
};

export default ShortDate;
