import { useTagsVisibility } from 'contexts/TagsContext';
import { useFilters } from 'app.hooks';
import { isLanguageFlag, languageFlags, orderTagsForDisplay } from 'utils/languageFlags';
import 'styles/TagBadges.css';

const getTagDisplay = (tag) => {
  if (typeof tag === 'object' && tag.key === 'language' && languageFlags[tag.value]) {
    return languageFlags[tag.value];
  }

  return typeof tag === 'object' ? `${tag.key}: ${tag.value}` : tag;
};


const TagBadges = ({tags = [], onTagClick}) => {
  const { tagsVisible } = useTagsVisibility();
  const { isTagSelected } = useFilters();
  
  if (!tagsVisible || !tags || tags.length === 0) {
    return null;
  }

  const isSelected = (tag) => {
    if (typeof tag === 'object') {
      return isTagSelected(tag.key, tag.value);
    } else {
      return isTagSelected('tag', tag);
    }
  };

  const handleTagClick = (tag) => {
    if (onTagClick) {
      if (typeof tag === 'object') {
        onTagClick(tag.key, tag.value);
      } else {
        onTagClick('tag', tag);
      }
    }
  };

  return (
    <div className="tag-badges">
      {orderTagsForDisplay(tags).map((tag, index) => (
        <span 
          className={`tag-badge ${isLanguageFlag(tag) ? 'language-flag' : ''} ${onTagClick ? 'clickable' : ''} ${isSelected(tag) ? 'selected' : ''}`} 
          key={index}
          onClick={() => handleTagClick(tag)}
          title={typeof tag === 'object' && tag.key === 'language' ? tag.value : undefined}
          aria-label={typeof tag === 'object' && tag.key === 'language' ? tag.value : undefined}
        >
          {getTagDisplay(tag)}
        </span>
      ))}
    </div>
  );
};

export default TagBadges;