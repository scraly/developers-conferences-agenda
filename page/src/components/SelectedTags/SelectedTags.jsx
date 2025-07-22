import React from 'react';
import { X } from 'lucide-react';
import 'styles/SelectedTags.css';

const SelectedTags = ({ selectedTags, onRemoveTag }) => {
  if (!selectedTags || selectedTags.length === 0) {
    return null;
  }

  return (
    <div className="selected-tags">
      <div className="selected-tags-label">Selected Tags:</div>
      <div className="selected-tags-list">
        {selectedTags.map(tagString => {
          const [key, value] = tagString.split(':');
          return (
            <div className="selected-tag" key={tagString} title={`${key}: ${value}`}>
              <span className="selected-tag-value">{value}</span>
              <button 
                aria-label={`Remove ${value} tag`}
                className="selected-tag-remove"
                onClick={() => onRemoveTag(tagString)}
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedTags;