import React, { useState, useCallback, useContext, useEffect, useMemo } from 'react';
import { useSearchParams } from "react-router-dom";

import { Filter, FilterX } from 'lucide-react';

import { useCountries, useRegions, useRegionsMap } from 'app.hooks';
import { useTagsVisibility } from 'contexts/TagsContext';
import TagMultiSelect from 'components/TagMultiSelect/TagMultiSelect';
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

  const onChange = useCallback((key, value) => {
    if (key === 'region') {
      setSearchParams({ ...Object.fromEntries(searchParams), region: value, country: '' })
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), [key]: value })
    }
  }, [searchParams, setSearchParams]);

  const countries = useCountries()
  const regions = useRegions()
  const regionsMap = useRegionsMap()

  const search = Object.fromEntries(searchParams)

  const selectedTags = useMemo(() => {
    if (!search.tags) return [];
    return Array.isArray(search.tags) ? search.tags : search.tags.split(',');
  }, [search.tags]);

  const handleTagsChange = useCallback((newTags) => {
    onChange('tags', newTags.length > 0 ? newTags.join(',') : '');
  }, [onChange]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    handleTagsChange(newTags);
  }, [selectedTags, handleTagsChange]);

  const countriesList = useMemo(() => {
    let result = countries
    if (search.region) {
      result = regionsMap[search.region]
      result.sort()
    }
    return result
  }, [search.region, regionsMap, countries])

  return (
    <div className={"filters " + (open ? 'open' : 'closed')}>
      <div
        className='filters-header'
        onClick={() => {
          if (open) {
            // setSearchParams({});
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
          <input id='filter-query' onChange={(e) => onChange('query', e.target.value)} placeholder={t('filters.searchPlaceholder')} type='text' value={search.query} />
        </div>

  {tagsVisible ? <div className='filtersItem tags-filter'>
            <label>{t('filters.tags')}</label>
            <TagMultiSelect
              onChange={handleTagsChange}
              selectedTags={selectedTags}
              showSelectedTags={false}
            />
            <SelectedTags
              onRemoveTag={handleRemoveTag}
              selectedTags={selectedTags}
            />
          </div> : null}

        <div className='filtersItem'>
          <label htmlFor='filter-until'>{t('filters.cfpUntil')}</label>
          <input id="filter-until" onChange={(e) => onChange('untilDate', e.target.value)} type="date" value={search.untilDate} />
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
            <input checked={search.online == 'true'} id='filter-online' onChange={(e) => onChange('online', e.target.checked)} type='checkbox' />
            <label htmlFor='filter-online'>{t('filters.online')}</label>
          </div>

          <div className='filtersItem'>
            <input checked={search.favorites == 'true'} id='filter-favorites' onChange={(e) => onChange('favorites', e.target.checked)} type='checkbox' />
            <label htmlFor='filter-favorites'>{t('filters.favorites')}</label>
          </div>
        </div>

        <div className='filtersItem'>
          <label htmlFor='filter-region'>{t('filters.region')}</label>
          <select id='filter-region' onChange={(e) => onChange('region', e.target.value)} value={search.region}>
            <option value=''>{t('filters.all')}</option>
            {regions.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>

        {countriesList ? <div className='filtersItem'>
            <label htmlFor='filter-country'>{t('filters.country')}</label>
            <select id='filter-country' onChange={(e) => onChange('country', e.target.value)} value={search.country}>
              <option value=''>{t('filters.all')}</option>
              {countriesList.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div> : null}

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