import 'styles/ShortDate.css';
import {getMonthNameShort, getTranslatedMonthNameShort} from 'utils';
import {ArrowRight} from 'lucide-react';
import { useTranslation } from 'contexts/LanguageContext';

const ShortDate = ({dates}) => {
  const { t } = useTranslation();
  const startDate = `${new Date(dates[0]).getDate()}-${getTranslatedMonthNameShort(new Date(dates[0]).getMonth(), t)}`;
  let endDate = '';
  if (dates.length > 1) {
    endDate = new Date(dates[1]).getDate();
    endDate = `${new Date(dates[1]).getDate()}-${getTranslatedMonthNameShort(new Date(dates[1]).getMonth(), t)}`;
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
