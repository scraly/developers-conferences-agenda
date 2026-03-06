import React from 'react';
import { X } from 'lucide-react';
import 'styles/SelectedTags.css';

const SelectedTags = ({ selectedTags, onRemoveTag }) => {
  if (!selectedTags || selectedTags.length === 0) {
    return null;
  }

  return (
    <div className="selected-tags">
      <div className="selected-tags-label">Active Filters:</div>
      <div className="selected-tags-list">
        {selectedTags.map(tag => {
          // Support both old format ("key:value" string) and new format ({ key, value, type })
          const isObject = typeof tag === 'object'
          const key = isObject ? tag.key : tag.split(':')[0]
          const value = isObject ? tag.value : tag.split(':')[1]
          const isExcluded = isObject ? tag.type === 'exclude' : false
          const tagId = isObject ? `${tag.key}:${tag.value}:${tag.type}` : tag

          return (
            <div
              className={`selected-tag ${isExcluded ? 'selected-tag--excluded' : ''}`}
              key={tagId}
              title={`${key}: ${isExcluded ? 'NOT ' : ''}${value}`}
            >
              {isExcluded && <span className="selected-tag-prefix">NOT</span>}
              <span className="selected-tag-value">{value}</span>
              <button
                aria-label={`Remove ${value} ${isExcluded ? 'exclusion' : 'filter'}`}
                className="selected-tag-remove"
                onClick={() => onRemoveTag(isObject ? tag : tag)}
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
