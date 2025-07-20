import { useTagsVisibility } from 'contexts/TagsContext';
import 'styles/TagBadges.css';

const TagBadges = ({tags = [], onTagClick}) => {
  const { tagsVisible } = useTagsVisibility();
  
  if (!tagsVisible || !tags || tags.length === 0) {
    return null;
  }

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
          key={index} 
          className={`tag-badge ${onTagClick ? 'clickable' : ''}`}
          onClick={() => handleTagClick(tag)}
        >
          {typeof tag === 'object' ? `${tag.key}: ${tag.value}` : tag}
        </span>
      ))}
    </div>
  );
};

export default TagBadges;