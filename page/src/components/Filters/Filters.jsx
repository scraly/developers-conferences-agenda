import React, { useState, useCallback, useContext, useEffect, useMemo } from 'react';
import { useSearchParams } from "react-router-dom";

import { Filter, FilterX } from 'lucide-react';

import { useCountries, useRegions, useRegionsMap, useAvailableCountries, useTags, TAG_FILTER_CONFIG } from 'app.hooks';
import { useTagsVisibility } from 'contexts/TagsContext';
import FilterMultiSelect from 'components/FilterMultiSelect/FilterMultiSelect';
import SelectedTags from 'components/SelectedTags/SelectedTags';
import TagsToggle from 'components/TagsToggle/TagsToggle';
import FavoritesToggle from 'components/FavoritesToggle/FavoritesToggle';
import { useTranslation } from 'contexts/LanguageContext';

import 'styles/Filters.css';
import { FilterContext } from 'contexts/FilterContext';

const Filters = ({ view }) => {
  const context = useContext(FilterContext);
  const { t } = useTranslation();
  const { tagsVisible } = useTagsVisibility();
  const [searchParams, setSearchParams] = useSearchParams(context.searchParams);
  const [open, setOpen] = useState(context.open);

  useEffect(() => {
    context.searchParams = searchParams;
    context.open = open;
  }, [searchParams, open]);

  const search = Object.fromEntries(searchParams)

  const updateParams = useCallback((updates) => {
    const current = Object.fromEntries(searchParams);
    const next = { ...current, ...updates };
    // Remove empty keys
    Object.keys(next).forEach(k => {
      if (next[k] === '' || next[k] === null || next[k] === undefined) {
        delete next[k];
      }
    });
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const onChange = useCallback((key, value) => {
    updateParams({ [key]: value });
  }, [updateParams]);

  const countries = useCountries()
  const regionNames = useRegions()
  const regionsMap = useRegionsMap()
  const tags = useTags()

  // Parse per-dimension state from URL params
  const getDimensionState = useCallback((dim) => {
    const included = search[dim] ? search[dim].split(',').filter(Boolean) : []
    const excluded = search[`${dim}_not`] ? search[`${dim}_not`].split(',').filter(Boolean) : []
    const mode = search[`${dim}_mode`] === 'all' ? 'all' : 'any'
    return { included, excluded, mode }
  }, [search])

  // Region → Country cascading
  const regionState = getDimensionState('region')
  const availableCountries = useAvailableCountries(regionState.included, countries)

  // Trim country selections when region changes
  useEffect(() => {
    if (regionState.included.length > 0) {
      const countryState = getDimensionState('country')
      const trimmed = countryState.included.filter(c => availableCountries.includes(c))
      if (trimmed.length !== countryState.included.length) {
        updateParams({ country: trimmed.length > 0 ? trimmed.join(',') : '' })
      }
    }
  }, [regionState.included.join(','), availableCountries])

  // Build tag dimension options
  const tagDimensionOptions = useMemo(() => {
    const result = {}
    TAG_FILTER_CONFIG.allowed.forEach(key => {
      const values = tags[key] || []
      result[key] = values.map(v => ({ value: v, label: v }))
    })
    return result
  }, [tags])

  // Per-dimension URL param handlers
  const makeDimensionHandlers = useCallback((dim) => ({
    onIncludedChange: (values) => {
      updateParams({ [dim]: values.length > 0 ? values.join(',') : '' })
    },
    onExcludedChange: (values) => {
      updateParams({ [`${dim}_not`]: values.length > 0 ? values.join(',') : '' })
    },
    onModeChange: (mode) => {
      updateParams({ [`${dim}_mode`]: mode === 'all' ? 'all' : '' })
    }
  }), [updateParams])

  // Selected tags for display (all dimensions combined)
  const selectedTags = useMemo(() => {
    const result = []
    TAG_FILTER_CONFIG.allowed.forEach(key => {
      const state = getDimensionState(key)
      state.included.forEach(val => result.push({ key, value: val, type: 'include' }))
      state.excluded.forEach(val => result.push({ key, value: val, type: 'exclude' }))
    })
    const countryState = getDimensionState('country')
    countryState.included.forEach(val => result.push({ key: 'country', value: val, type: 'include' }))
    countryState.excluded.forEach(val => result.push({ key: 'country', value: val, type: 'exclude' }))
    const rState = getDimensionState('region')
    rState.included.forEach(val => result.push({ key: 'region', value: val, type: 'include' }))
    rState.excluded.forEach(val => result.push({ key: 'region', value: val, type: 'exclude' }))
    return result
  }, [search])

  const handleRemoveTag = useCallback((tag) => {
    const state = getDimensionState(tag.key)
    if (tag.type === 'include') {
      const newIncluded = state.included.filter(v => v !== tag.value)
      updateParams({ [tag.key]: newIncluded.length > 0 ? newIncluded.join(',') : '' })
    } else {
      const newExcluded = state.excluded.filter(v => v !== tag.value)
      updateParams({ [`${tag.key}_not`]: newExcluded.length > 0 ? newExcluded.join(',') : '' })
    }
  }, [getDimensionState, updateParams])

  // Clear All Filters
  const handleClearAll = useCallback(() => {
    const cleared = {}
    // Keep non-filter params (view-related)
    const filterKeys = new Set()
    const allDims = [...TAG_FILTER_CONFIG.allowed, 'country', 'region']
    allDims.forEach(dim => {
      filterKeys.add(dim)
      filterKeys.add(`${dim}_not`)
      filterKeys.add(`${dim}_mode`)
    })
    filterKeys.add('tags')
    filterKeys.add('online')
    filterKeys.add('notOnline')
    filterKeys.add('closedCaptions')
    filterKeys.add('scholarship')
    filterKeys.add('sponsoring')
    filterKeys.add('callForPapers')
    filterKeys.add('favorites')
    filterKeys.add('query')
    filterKeys.add('untilDate')

    Object.keys(search).forEach(k => {
      if (!filterKeys.has(k)) {
        cleared[k] = search[k]
      }
    })
    setSearchParams(cleared)
  }, [search, setSearchParams])

  // Country and Region options for FilterMultiSelect
  const countryOptions = useMemo(() => {
    return availableCountries.map(c => ({ value: c, label: c }))
  }, [availableCountries])

  const regionOptions = useMemo(() => {
    return regionNames.map(r => ({ value: r, label: r }))
  }, [regionNames])

  return (
    <div className={"filters " + (open ? 'open' : 'closed')}>
      <div
        className='filters-header'
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          setOpen(true);
        }}
        title={open ? t('filters.close') : t('filters.open')}
      >
        <div className='filters-icon'>{open ? <FilterX size="42px" /> : <Filter size="42px" />}</div>
        <span className='filters-title'>{t('filters.title')}</span>
      </div>

      <div className='tags-toggle-container'>
        <TagsToggle />
      </div>

      <div className='favorites-toggle-container'>
        <FavoritesToggle />
      </div>

      <div className='filters-content'>
        <div className='filtersItem'>
          <label htmlFor='filter-query'>{t('filters.query')}</label>
          <input id='filter-query' onChange={(e) => onChange('query', e.target.value)} placeholder={t('filters.searchPlaceholder')} type='text' value={search.query || ''} />
        </div>

        {tagsVisible ? <>
          {TAG_FILTER_CONFIG.allowed.map(key => {
            const state = getDimensionState(key)
            const handlers = makeDimensionHandlers(key)
            const options = tagDimensionOptions[key] || []
            return (
              <FilterMultiSelect
                disabled={options.length === 0}
                excluded={state.excluded}
                included={state.included}
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                mode={key !== 'language' ? state.mode : undefined}
                onExcludedChange={handlers.onExcludedChange}
                onIncludedChange={handlers.onIncludedChange}
                onModeChange={key !== 'language' ? handlers.onModeChange : null}
                options={options}
              />
            )
          })}

          <SelectedTags
            onRemoveTag={handleRemoveTag}
            selectedTags={selectedTags}
          />
        </> : null}

        <div className='filtersItem'>
          <label htmlFor='filter-until'>{t('filters.cfpUntil')}</label>
          <input id="filter-until" onChange={(e) => onChange('untilDate', e.target.value)} type="date" value={search.untilDate || ''} />
        </div>

        <div className='filtersList'>

          {view != "cfp" ?
          <div className='filtersItem'>
            <input checked={search.callForPapers == 'true'} id='filter-call-for-papers' onChange={(e) => onChange('callForPapers', e.target.checked)} type='checkbox' />
            <label htmlFor='filter-call-for-papers'>{t('filters.callForPapersOpen')}</label>
          </div> : ''}

          {view != "cfp" ?
          <div className='filtersItem'>
            <input checked={search.closedCaptions == 'true'} id='filter-closed-captions' onChange={(e) => onChange('closedCaptions', e.target.checked)} type='checkbox' />
            <label htmlFor='filter-closed-captions'>{t('filters.closedCaptions')}</label>
          </div> : ''}

          {view != "cfp" ?
          <div className='filtersItem'>
            <input checked={search.scholarship == 'true'} id='filter-scholarship' onChange={(e) => onChange('scholarship', e.target.checked)} type='checkbox' />
            <label htmlFor='filter-scholarship'>{t('filters.scholarship')}</label>
          </div> : ''}

          {view != "cfp" ?
          <div className='filtersItem'>
            <input checked={search.sponsoring == 'true'} id='filter-sponsoring' onChange={(e) => onChange('sponsoring', e.target.checked)} type='checkbox' />
            <label htmlFor='filter-sponsoring'>{t('filters.sponsoring')}</label>
          </div> : ''}

          <div className='filtersItem'>
            <input checked={search.online == 'true'} id='filter-online' onChange={(e) => {
              if (e.target.checked) {
                updateParams({ online: 'true', notOnline: '' })
              } else {
                onChange('online', '')
              }
            }} type='checkbox' />
            <label htmlFor='filter-online'>{t('filters.online')}</label>
          </div>

          <div className='filtersItem'>
            <input checked={search.notOnline == 'true'} id='filter-not-online' onChange={(e) => {
              if (e.target.checked) {
                updateParams({ notOnline: 'true', online: '' })
              } else {
                onChange('notOnline', '')
              }
            }} type='checkbox' />
            <label htmlFor='filter-not-online'>Not Online</label>
          </div>

          <div className='filtersItem'>
            <input checked={search.favorites == 'true'} id='filter-favorites' onChange={(e) => onChange('favorites', e.target.checked)} type='checkbox' />
            <label htmlFor='filter-favorites'>{t('filters.favorites')}</label>
          </div>
        </div>

        <FilterMultiSelect
          {...makeDimensionHandlers('region')}
          disabled={regionOptions.length === 0}
          excluded={regionState.excluded}
          included={regionState.included}
          label={t('filters.region')}
          options={regionOptions}
        />

        <FilterMultiSelect
          {...makeDimensionHandlers('country')}
          disabled={countryOptions.length === 0}
          excluded={getDimensionState('country').excluded}
          included={getDimensionState('country').included}
          label={t('filters.country')}
          options={countryOptions}
        />

        <button
          className="clear-all-filters"
          onClick={handleClearAll}
          type="button"
        >
          Clear All Filters
        </button>

        {view == "list" ?
         <div className='filters-header'>
          <span className='filters-title'>{t('filters.sorting')}</span>
        </div> : ''}

        {view == "list" ?
        <div className='filtersItem'>
          <label htmlFor='filter-sort'>{t('filters.sort')}</label>
          <select id='filter-sort' onChange={(e) => onChange('sort', e.target.value)} value={search.sort}>
            <option value='date'>{t('filters.sortEventStartDate')}</option>
            <option value='cfp'>{t('filters.sortCfpCloseDate')}</option>
          </select>
        </div> : ''}
      </div>

    </div>
  );
};

export default Filters;
