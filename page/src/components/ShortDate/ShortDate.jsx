import 'styles/ShortDate.css';
import {getTranslatedMonthNameShort, getUTCDay, getUTCMonth} from 'utils';
import {ArrowRight} from 'lucide-react';
import { useTranslation } from 'contexts/LanguageContext';

const ShortDate = ({dates}) => {
  const { t } = useTranslation();
  const startDate = `${getUTCDay(dates[0])}-${getTranslatedMonthNameShort(getUTCMonth(dates[0]), t)}`;
  let endDate = '';
  if (dates.length > 1) {
    endDate = `${getUTCDay(dates[1])}-${getTranslatedMonthNameShort(getUTCMonth(dates[1]), t)}`;
  }
  if (endDate) {
    return (
      <span className='shortDate'>
        {startDate}
          <ArrowRight />
        {endDate}
      </span>
    );
  }
  return <span className='shortDate'>{startDate}</span>;
};

export default ShortDate;
