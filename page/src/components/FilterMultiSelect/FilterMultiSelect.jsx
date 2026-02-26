import React, { useMemo, useCallback } from 'react';
import Select, { components } from 'react-select';
import { X } from 'lucide-react';
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
      onExcludedChange(excluded.filter(v => v !== value));
      onIncludedChange([...included, value]);
    } else if (included.includes(value)) {
      onIncludedChange(included.filter(v => v !== value));
      onExcludedChange([...excluded, value]);
    }
  }, [included, excluded, onIncludedChange, onExcludedChange]);

  const handleRemoveValue = useCallback((value, isExcluded) => {
    if (isExcluded) {
      onExcludedChange(excluded.filter(v => v !== value));
    } else {
      onIncludedChange(included.filter(v => v !== value));
    }
  }, [included, excluded, onIncludedChange, onExcludedChange]);

  // Fully custom MultiValue — no sub-components, just a clean chip
  const CustomMultiValue = useCallback(({ data, selectProps }) => {
    const isExcluded = data.isExcluded;
    return (
      <div className={`filter-chip ${isExcluded ? 'filter-chip--excluded' : 'filter-chip--included'}`}>
        <span
          className="filter-chip__toggle"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleExcludeToggle(data.value);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          title={isExcluded ? 'Click to include' : 'Click to exclude'}
        >
          {isExcluded ? '−' : '+'}
        </span>
        <span className="filter-chip__label">{data.label}</span>
        <span
          className="filter-chip__remove"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveValue(data.value, isExcluded);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          title={`Remove ${data.label}`}
        >
          <X size={12} />
        </span>
      </div>
    );
  }, [handleExcludeToggle, handleRemoveValue]);

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
    multiValue: (provided) => ({
      ...provided,
      background: 'none',
      border: 'none',
      padding: 0,
      margin: '2px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      display: 'none'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      display: 'none'
    }),
    clearIndicator: (provided) => ({
      ...provided,
      display: 'none'
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
        isClearable={true}
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
