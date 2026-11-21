import React from 'react';
import { Youtube } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'contexts/LanguageContext';

const RecordingsToggle = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const recordings = Object.fromEntries(searchParams).recordings === 'true';
  const label = recordings ? t('filters.clearRecordingsFilter') : t('filters.showOnlyRecordings');

  const toggleRecordings = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (recordings) {
      newSearchParams.delete('recordings');
    } else {
      newSearchParams.set('recordings', 'true');
    }
    setSearchParams(newSearchParams);
  };

  return (
    <button
      aria-label={label}
      aria-pressed={recordings}
      className={`view-selector recordings-toggle-button${recordings ? ' active' : ''}`}
      onClick={toggleRecordings}
      title={label}
      type="button"
    >
      <Youtube aria-hidden="true" size="42px" />
    </button>
  );
};

export default RecordingsToggle;
