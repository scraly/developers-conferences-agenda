import React, { useMemo, useCallback } from 'react';
import Select, { components } from 'react-select';
import 'styles/FilterMultiSelect.css';

const FilterMultiSelect = ({
  label,
  options,
  included,
  excluded,
  mode,
  onIncludedChange,
  onExcludedChange,
  onModeChange,
  disabled
}) => {
  const selectOptions = useMemo(() => {
    return options.map(opt => ({
      value: opt.value,
      label: opt.label,
      isExcluded: excluded.includes(opt.value)
    }));
  }, [options, excluded]);

  const selectedValues = useMemo(() => {
    const inc = included.map(val => {
      const opt = options.find(o => o.value === val);
      return { value: val, label: opt ? opt.label : val, isExcluded: false };
    });
    const exc = excluded.map(val => {
      const opt = options.find(o => o.value === val);
      return { value: val, label: opt ? opt.label : val, isExcluded: true };
    });
    return [...inc, ...exc];
  }, [included, excluded, options]);

  const handleChange = useCallback((selectedOptions, actionMeta) => {
    if (actionMeta.action === 'remove-value' || actionMeta.action === 'pop-value') {
      const removedValue = actionMeta.removedValue.value;
      if (actionMeta.removedValue.isExcluded) {
        onExcludedChange(excluded.filter(v => v !== removedValue));
      } else {
        onIncludedChange(included.filter(v => v !== removedValue));
      }
      return;
    }

    if (actionMeta.action === 'clear') {
      onIncludedChange([]);
      onExcludedChange([]);
      return;
    }

    if (actionMeta.action === 'select-option') {
      const newVal = actionMeta.option.value;
      if (!included.includes(newVal) && !excluded.includes(newVal)) {
        onIncludedChange([...included, newVal]);
      }
    }
  }, [included, excluded, onIncludedChange, onExcludedChange]);

  const handleExcludeToggle = useCallback((value) => {
    if (excluded.includes(value)) {
      // Move from excluded to included
      onExcludedChange(excluded.filter(v => v !== value));
      onIncludedChange([...included, value]);
    } else if (included.includes(value)) {
      // Move from included to excluded
      onIncludedChange(included.filter(v => v !== value));
      onExcludedChange([...excluded, value]);
    }
  }, [included, excluded, onIncludedChange, onExcludedChange]);

  const CustomMultiValue = useCallback((props) => {
    const isExcluded = props.data.isExcluded;
    return (
      <div
        className={`filter-chip ${isExcluded ? 'filter-chip--excluded' : 'filter-chip--included'}`}
        title={isExcluded ? `Excluding: ${props.data.label}` : `Including: ${props.data.label}`}
      >
        <span
          className="filter-chip__toggle"
          onClick={(e) => {
            e.stopPropagation();
            handleExcludeToggle(props.data.value);
          }}
          role="button"
          tabIndex={0}
          title={isExcluded ? 'Click to include' : 'Click to exclude'}
        >
          {isExcluded ? '−' : '+'}
        </span>
        <components.MultiValueLabel {...props} />
        <components.MultiValueRemove {...props} />
      </div>
    );
  }, [handleExcludeToggle]);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#007bff' : '#ccc',
      boxShadow: state.isFocused ? '0 0 0 1px #007bff' : 'none',
      '&:hover': { borderColor: '#007bff' }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999999
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999999
    }),
    multiValue: (provided, state) => ({
      ...provided,
      backgroundColor: state.data.isExcluded ? '#f8d7da' : '#d4edda',
      borderColor: state.data.isExcluded ? '#f5c6cb' : '#c3e6cb',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '12px'
    }),
    multiValueLabel: (provided, state) => ({
      ...provided,
      color: state.data.isExcluded ? '#721c24' : '#155724'
    }),
    multiValueRemove: (provided, state) => ({
      ...provided,
      color: state.data.isExcluded ? '#721c24' : '#155724',
      ':hover': {
        backgroundColor: state.data.isExcluded ? '#f5c6cb' : '#c3e6cb',
        color: state.data.isExcluded ? '#491217' : '#0b2e13'
      }
    })
  };

  const modeToggle = onModeChange ? (
    <button
      className="filter-mode-toggle"
      onClick={() => onModeChange(mode === 'any' ? 'all' : 'any')}
      title={mode === 'any' ? 'Matching ANY selected value' : 'Matching ALL selected values'}
      type="button"
    >
      {mode === 'any' ? 'Any' : 'All'}
    </button>
  ) : null;

  return (
    <div className="filter-multiselect">
      <div className="filter-multiselect__header">
        <label className="filter-multiselect__label">{label}</label>
        {modeToggle}
      </div>
      <Select
        className="filter-multiselect__select"
        classNamePrefix="filter-ms"
        closeMenuOnSelect={false}
        components={{ MultiValue: CustomMultiValue }}
        hideSelectedOptions={true}
        isDisabled={disabled}
        isMulti
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        onChange={handleChange}
        options={selectOptions}
        placeholder={`Select ${label.toLowerCase()}...`}
        styles={customStyles}
        value={selectedValues}
      />
    </div>
  );
};

export default FilterMultiSelect;
