import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { isToday, isTomorrow } from 'date-fns';
import 'styles/CfpDeadline.css';

const CfpDeadline = ({ until, untilDate }) => {
  const date = new Date(untilDate);
  const isUrgent = isToday(date);
  const isClosingSoon = isTomorrow(date);

  return (
    <div className={`cfp-deadline ${isUrgent ? 'cfp-urgent' : ''} ${isClosingSoon ? 'cfp-closing-soon' : ''}`}>
      {isUrgent ? (
        <AlertCircle color="#dc2626" size={24} />
      ) : isClosingSoon ? (
        <Clock color="#f59e0b" size={24} />
      ) : (
        <Clock color="green" size={24} />
      )}
      <span>
        Until {isToday(date) && ''}
        {isTomorrow(date) && ''}
        {until}
      </span>
    </div>
  );
};

export default CfpDeadline;