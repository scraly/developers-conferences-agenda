import React, { useMemo } from 'react';
import Select from 'react-select';
import { useTags } from 'app.hooks';
import 'styles/TagMultiSelect.css';

const TagMultiSelect = ({ selectedTags, onChange, showSelectedTags = true }) => {
  const tags = useTags();

  const options = useMemo(() => {
    const groups = [];
    
    // If no tags from events, create sample options for testing
    if (Object.keys(tags).length === 0) {
      return [
        {
          label: 'Type',
          options: [
            { value: 'type:conference', label: 'conference' },
            { value: 'type:workshop', label: 'workshop' },
            { value: 'type:meetup', label: 'meetup' }
          ]
        },
        {
          label: 'Tech',
          options: [
            { value: 'tech:javascript', label: 'javascript' },
            { value: 'tech:python', label: 'python' },
            { value: 'tech:java', label: 'java' },
            { value: 'tech:react', label: 'react' }
          ]
        },
        {
          label: 'Topic',
          options: [
            { value: 'topic:web-development', label: 'web-development' },
            { value: 'topic:mobile', label: 'mobile' },
            { value: 'topic:devops', label: 'devops' }
          ]
        }
      ];
    }
    
    Object.keys(tags).forEach(key => {
      const groupOptions = tags[key].map(value => ({
        value: `${key}:${value}`,
        label: value,
        groupKey: key
      }));
      
      groups.push({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        options: groupOptions
      });
    });
    
    return groups;
  }, [tags]);

  const selectedValues = useMemo(() => {
    if (!selectedTags || selectedTags.length === 0) return [];
    
    return selectedTags.map(tagString => {
      const [key, value] = tagString.split(':');
      return {
        value: tagString,
        label: value,
        groupKey: key
      };
    });
  }, [selectedTags]);

  const handleChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    onChange(values);
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#007bff' : '#ccc',
      boxShadow: state.isFocused ? '0 0 0 1px #007bff' : 'none',
      '&:hover': {
        borderColor: '#007bff'
      }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999999
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999999
    }),
    multiValue: (provided) => ({
      ...provided,
      display: showSelectedTags ? 'flex' : 'none'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      display: showSelectedTags ? 'block' : 'none'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      display: showSelectedTags ? 'flex' : 'none'
    }),
    groupHeading: (provided) => ({
      ...provided,
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      color: '#6c757d',
      backgroundColor: '#f8f9fa',
      padding: '8px 12px'
    })
  };

  return (
    <div className="tag-multiselect-wrapper">
      <Select
        isMulti
        options={options}
        value={selectedValues}
        onChange={handleChange}
        placeholder="Select tags..."
        className="tag-multiselect"
        classNamePrefix="tag-multiselect"
        styles={customStyles}
        closeMenuOnSelect={false}
        hideSelectedOptions={true}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
      />
    </div>
  );
};

export default TagMultiSelect;