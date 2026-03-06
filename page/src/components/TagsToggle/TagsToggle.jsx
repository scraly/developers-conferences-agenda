import React from 'react';
import { Tag } from 'lucide-react';
import { useTagsVisibility } from 'contexts/TagsContext';
import { useTranslation } from 'contexts/LanguageContext';
import 'styles/TagsToggle.css';

const TagsToggle = () => {
  const { tagsVisible, toggleTagsVisibility } = useTagsVisibility();
  const { t } = useTranslation();

  return (
    <button 
      aria-label={tagsVisible ? t('filters.hideTags') : t('filters.showTags')}
      className={`tags-toggle-button ${!tagsVisible ? 'strikethrough' : ''}`}
      onClick={toggleTagsVisibility}
      title={tagsVisible ? t('filters.hideTags') : t('filters.showTags')}
    >
      <Tag size={20} />
    </button>
  );
};

export default TagsToggle;