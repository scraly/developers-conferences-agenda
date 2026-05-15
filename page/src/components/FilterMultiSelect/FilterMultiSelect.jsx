import React, { useMemo, useCallback } from 'react';
import Select, { components } from 'react-select';
import { X } from 'lucide-react';
import { useTheme } from 'contexts/ThemeContext';
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

  // Subscribe to theme — causes re-render on toggle so customStyles updates
  const { theme } = useTheme();

  // Color tokens per theme, mirroring theme.css variables.
  // Hardcoded here (not read via getComputedStyle) so react-select/Emotion
  // always receives the correct values synchronously during the re-render.
  const tok = theme === 'dark'
    ? { bg: '#303446', bgAlt: '#292c3c', bgHover: '#3a3d52', text: '#c6d0f5', muted: '#838ba7', border: '#51576d', primary: '#8caaee' }
    : { bg: '#ffffff', bgAlt: '#f8f8f8', bgHover: '#f5f5f5', text: '#333333', muted: '#666666', border: '#cccccc', primary: '#007bff' };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: tok.bgAlt,
      borderColor: state.isFocused ? tok.primary : tok.border,
      boxShadow: state.isFocused ? `0 0 0 1px ${tok.primary}` : 'none',
      '&:hover': { borderColor: tok.primary }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999999,
      backgroundColor: tok.bg,
      border: `1px solid ${tok.border}`
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999999
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? tok.bgHover : tok.bg,
      color: tok.text,
      cursor: 'pointer'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: tok.muted
    }),
    singleValue: (provided) => ({
      ...provided,
      color: tok.text
    }),
    input: (provided) => ({
      ...provided,
      color: tok.text
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
