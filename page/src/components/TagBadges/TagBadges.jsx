import { useTagsVisibility } from 'contexts/TagsContext';
import { useFilters } from 'app.hooks';
import 'styles/TagBadges.css';

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
      {tags.map((tag, index) => (
        <span 
          className={`tag-badge ${onTagClick ? 'clickable' : ''} ${isSelected(tag) ? 'selected' : ''}`} 
          key={index}
          onClick={() => handleTagClick(tag)}
        >
          {typeof tag === 'object' ? `${tag.key}: ${tag.value}` : tag}
        </span>
      ))}
    </div>
  );
};

export default TagBadges;