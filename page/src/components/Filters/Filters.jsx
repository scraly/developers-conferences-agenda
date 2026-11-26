import React, { useState, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigationType, useSearchParams } from "react-router-dom";

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
import { getFilterParamKeys, hasActiveFilters } from './Filters.utils';

const QUERY_UPDATE_DELAY_MS = 250;

const Filters = ({ view }) => {
  const context = useContext(FilterContext);
  const { t } = useTranslation();
  const { tagsVisible } = useTagsVisibility();
  const [searchParams, setSearchParams] = useSearchParams(context.searchParams);
  const navigationType = useNavigationType();
  const urlQuery = searchParams.get('query') || '';
  const [queryValue, setQueryValue] = useState(urlQuery);
  const [open, setOpen] = useState(context.open);
  const queryUpdateTimeoutRef = useRef(null);
  const pendingQueryUpdatesRef = useRef(new Map());
  const filtersRef = useRef(null);
  const filtersToggleRef = useRef(null);
  const setSearchParamsRef = useRef(setSearchParams);
  const navigationTypeRef = useRef(navigationType);
  setSearchParamsRef.current = setSearchParams;
  navigationTypeRef.current = navigationType;

  const clearQueryUpdateTimeout = useCallback(() => {
    if (queryUpdateTimeoutRef.current !== null) {
      clearTimeout(queryUpdateTimeoutRef.current);
      queryUpdateTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    context.searchParams = searchParams;
    context.open = open;
  }, [searchParams, open]);

  // Sync external navigation, but do not let our own debounced URL updates
  // overwrite newer text while a route render is still pending.
  useEffect(() => {
    const pendingUpdates = pendingQueryUpdatesRef.current;
    const pendingCount = pendingUpdates.get(urlQuery) || 0;

    if (navigationTypeRef.current === 'REPLACE' && pendingCount > 0) {
      if (pendingCount === 1) {
        pendingUpdates.delete(urlQuery);
      } else {
        pendingUpdates.set(urlQuery, pendingCount - 1);
      }
      return;
    }

    clearQueryUpdateTimeout();
    pendingUpdates.clear();
    setQueryValue(urlQuery);
  }, [urlQuery, clearQueryUpdateTimeout]);

  useEffect(() => clearQueryUpdateTimeout, [clearQueryUpdateTimeout]);

  // Close the panel when clicking outside it or pressing Escape.
  // Only the panel visibility changes: filter values live in the URL and the
  // query text stays in local state, so everything entered is kept.
  useEffect(() => {
    if (!open) return undefined;

    const isInsidePanel = (target) => {
      if (!(target instanceof Node)) return false;
      if (filtersRef.current && filtersRef.current.contains(target)) return true;
      // react-select renders its dropdown menu in a portal on document.body.
      return Boolean(target instanceof Element && target.closest('.filter-ms__menu-portal'));
    };

    const handlePointerDown = (event) => {
      if (!isInsidePanel(event.target)) setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      // Let an open dropdown menu consume Escape before closing the panel.
      if (document.querySelector('.filter-ms__menu')) return;
      // Move focus out of the controls that are about to slide off-screen,
      // otherwise typing keeps editing an invisible filter field.
      if (filtersRef.current?.contains(document.activeElement)) {
        filtersToggleRef.current?.focus({ preventScroll: true });
      }
      setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    // Capture phase: react-select removes its menu from the DOM in the same
    // keydown, so check for an open dropdown before React handles the event.
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  // Update the visible text immediately and debounce expensive route renders.
  const handleQueryChange = useCallback((value) => {
    setQueryValue(value);
    clearQueryUpdateTimeout();
    queryUpdateTimeoutRef.current = setTimeout(() => {
      const pendingUpdates = pendingQueryUpdatesRef.current;
      pendingUpdates.set(value, (pendingUpdates.get(value) || 0) + 1);
      setSearchParamsRef.current(currentSearchParams => {
        const next = new URLSearchParams(currentSearchParams);
        if (value) {
          next.set('query', value);
        } else {
          next.delete('query');
        }
        return next;
      }, { replace: true });
      queryUpdateTimeoutRef.current = null;
    }, QUERY_UPDATE_DELAY_MS);
  }, [clearQueryUpdateTimeout]);

  const search = Object.fromEntries(searchParams)
  const filtersActive = hasActiveFilters(search)
  const filtersTitle = `${open ? t('filters.close') : t('filters.open')}${filtersActive ? ' (Filters active)' : ''}`

  const updateParams = useCallback((updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
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
    clearQueryUpdateTimeout();
    pendingQueryUpdatesRef.current.clear();
    setQueryValue('');
    // Clear filter keys from the live URLSearchParams so repeated and empty
    // values of unrelated parameters are preserved as-is.
    const cleared = new URLSearchParams(searchParams)
    const filterKeys = getFilterParamKeys()
    filterKeys.forEach(key => cleared.delete(key))
    setSearchParams(cleared)
  }, [searchParams, setSearchParams, clearQueryUpdateTimeout])

  // Country and Region options for FilterMultiSelect
  const countryOptions = useMemo(() => {
    return availableCountries.map(c => ({ value: c, label: c }))
  }, [availableCountries])

  const regionOptions = useMemo(() => {
    return regionNames.map(r => ({ value: r, label: r }))
  }, [regionNames])

  const toggleOpen = useCallback(() => {
    setOpen(current => !current);
  }, []);

  const handleToggleKeyDown = useCallback((event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setOpen(current => !current);
  }, []);

  return (
    <div className={"filters " + (open ? 'open' : 'closed')} ref={filtersRef}>
      <div
        aria-controls='filters-panel'
        aria-expanded={open}
        aria-label={filtersTitle}
        className='filters-header'
        onClick={toggleOpen}
        onKeyDown={handleToggleKeyDown}
        ref={filtersToggleRef}
        role='button'
        tabIndex={0}
        title={filtersTitle}
      >
        <div className='filters-icon'>
          {open ? <FilterX size="42px" /> : <Filter size="42px" />}
          {filtersActive ? <span className='filters-active-indicator' aria-hidden='true' /> : null}
        </div>
        <span className='filters-title'>{t('filters.title')}</span>
        <span className='sr-only' aria-live='polite'>{filtersActive ? 'Filters active' : ''}</span>
      </div>

      <div className='tags-toggle-container'>
        <TagsToggle />
      </div>

      <div className='favorites-toggle-container'>
        <FavoritesToggle />
      </div>

      <div className='filters-content' id='filters-panel'>
        <div className='filtersItem'>
          <label htmlFor='filter-query'>{t('filters.query')}</label>
          <input id='filter-query' onChange={(e) => handleQueryChange(e.target.value)} placeholder={t('filters.searchPlaceholder')} type='text' value={queryValue} />
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

        {view !== 'cfp-companion' ? <div className='filtersItem'>
          <label htmlFor='filter-until'>{t('filters.cfpUntil')}</label>
          <input id="filter-until" onChange={(e) => onChange('untilDate', e.target.value)} type="date" value={search.untilDate || ''} />
        </div> : null}

        <div className='filtersItem filter-min-attendees'>
          <label htmlFor='filter-min-attendees'>{t('filters.minAttendees')}</label>
          <input id='filter-min-attendees' min='0' onChange={(e) => onChange('minAttendees', e.target.value)} placeholder={t('filters.minAttendeesPlaceholder')} step='1' type='number' value={search.minAttendees || ''} />
        </div>

        <div className='filtersList'>

          {view === 'cfp-companion' ? <fieldset className='cfp-companion-status-filters'>
            <legend>{t('filters.cfpStatus')}</legend>
            <div className='filtersItem'>
              <input checked={(search.cfpStatus || '').split(',').includes('pending')} id='filter-cfp-pending' onChange={(event) => {
                const statuses = new Set((search.cfpStatus || '').split(',').filter(Boolean))
                event.target.checked ? statuses.add('pending') : statuses.delete('pending')
                onChange('cfpStatus', Array.from(statuses).join(','))
              }} type='checkbox' />
              <label htmlFor='filter-cfp-pending'>{t('filters.cfpPending')}</label>
            </div>
            <div className='filtersItem'>
              <input checked={(search.cfpStatus || '').split(',').includes('accepted')} id='filter-cfp-accepted' onChange={(event) => {
                const statuses = new Set((search.cfpStatus || '').split(',').filter(Boolean))
                event.target.checked ? statuses.add('accepted') : statuses.delete('accepted')
                onChange('cfpStatus', Array.from(statuses).join(','))
              }} type='checkbox' />
              <label htmlFor='filter-cfp-accepted'>{t('filters.cfpAccepted')}</label>
            </div>
            <div className='filtersItem'>
              <input checked={(search.cfpStatus || '').split(',').includes('rejected')} id='filter-cfp-rejected' onChange={(event) => {
                const statuses = new Set((search.cfpStatus || '').split(',').filter(Boolean))
                event.target.checked ? statuses.add('rejected') : statuses.delete('rejected')
                onChange('cfpStatus', Array.from(statuses).join(','))
              }} type='checkbox' />
              <label htmlFor='filter-cfp-rejected'>{t('filters.cfpRejected')}</label>
            </div>
          </fieldset> : null}

          {view != "cfp" && view !== 'cfp-companion' ?
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

          {['list', 'calendar', 'map'].includes(view) ? <div className='filtersItem'>
            <input checked={search.recordings === 'true'} id='filter-recordings' onChange={(e) => onChange('recordings', e.target.checked ? 'true' : '')} type='checkbox' />
            <label htmlFor='filter-recordings'>{t('filters.recordings')}</label>
          </div> : null}

          <div className='filtersItem'>
            <input checked={search.online == 'true'} id='filter-online' onChange={(e) => onChange('online', e.target.checked)} type='checkbox' />
            <label htmlFor='filter-online'>{t('filters.online')}</label>
          </div>

          <div className='filtersItem'>
            <input checked={search.inPerson == 'true'} id='filter-in-person' onChange={(e) => onChange('inPerson', e.target.checked)} type='checkbox' />
            <label htmlFor='filter-in-person'>{t('filters.inPerson')}</label>
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
          onModeChange={null}
          options={regionOptions}
        />

        <FilterMultiSelect
          {...makeDimensionHandlers('country')}
          disabled={countryOptions.length === 0}
          excluded={getDimensionState('country').excluded}
          included={getDimensionState('country').included}
          label={t('filters.country')}
          onModeChange={null}
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
            <option value='attendees'>{t('filters.sortAttendees')}</option>
          </select>
        </div> : ''}
      </div>

    </div>
  );
};

export default Filters;
