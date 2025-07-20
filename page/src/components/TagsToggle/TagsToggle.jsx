import React from 'react';
import { Tag, EyeOff } from 'lucide-react';
import { useTagsVisibility } from 'contexts/TagsContext';
import 'styles/TagsToggle.css';

const TagsToggle = () => {
  const { tagsVisible, toggleTagsVisibility } = useTagsVisibility();

  return (
    <button 
      className={`tags-toggle-button ${!tagsVisible ? 'strikethrough' : ''}`}
      onClick={toggleTagsVisibility}
      title={tagsVisible ? 'Hide tags' : 'Show tags'}
      aria-label={tagsVisible ? 'Hide tags' : 'Show tags'}
    >
      <Tag size={20} />
    </button>
  );
};

export default TagsToggle;