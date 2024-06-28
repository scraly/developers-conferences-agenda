import React, { useState, useCallback, useContext, useEffect } from 'react';
import {useSearchParams} from "react-router-dom";

import { Filter, FilterX } from 'lucide-react';

import {useCountries} from 'app.hooks';

import 'styles/Filters.css';
import { FilterContext } from 'contexts/FilterContext';

const Filters = () => {
  const context = useContext(FilterContext);
  const [searchParams, setSearchParams] = useSearchParams(context.searchParams);
  const [open, setOpen] = useState(context.open);

  useEffect(() => {
    context.searchParams = searchParams;
    context.open = open;
  }, [searchParams, open]);

  const onChange = useCallback((key, value) => {
      const clone = { ...Object.fromEntries(searchParams), [key]: value };
      if (value === undefined) delete clone[key];
      setSearchParams(clone);
  }, [searchParams, setSearchParams]);

  const countries = useCountries()

  const search = Object.fromEntries(searchParams);
  if (search.showEventsMode0 === undefined) {
    
  }

  return (
    <div className={"filters " + (open ? 'open' : 'closed')}>
      <div
          className='filters-header'
          title={open ? 'Close filters' : 'Open filters'}
          onClick={() => {
              if (open) {
                  // setSearchParams({});
                  setOpen(false);
                  return;
              }
              setOpen(true);
          }}
      >
          <div className='filters-icon'>{open ? <FilterX size={'32px'}/> : <Filter size={'32px'}/>}</div>
          <span className='filters-title'>Filters</span>
      </div>

      <div className='filtersItem'>
        <input id='filter-query' type='text' value={search.query} onChange={(e) => onChange('query', e.target.value)} placeholder="Search..."/>
      </div>

      <div className='filtersList'>
        <div className='filtersItem'>
          <input checked={search.callForPapers == 'true'} type='checkbox' id='filter-call-for-papers' onChange={(e) => onChange('callForPapers', e.target.checked)}/>
          <label htmlFor='filter-call-for-papers'>Call For Papers Open</label>
        </div>
        <div className='filtersItem'>
          <input checked={search.closedCaptions == 'true'} type='checkbox' id='filter-closed-captions' onChange={(e) => onChange('closedCaptions', e.target.checked)}/>
          <label htmlFor='filter-closed-captions'>Closed Captions</label>
        </div>
        <div className='filtersItem'>
          <input checked={search.scholarship == 'true'} type='checkbox' id='filter-scholarship' onChange={(e) => onChange('scholarship', e.target.checked)}/>
          <label htmlFor='filter-scholarship'>Scholarship</label>
        </div>
        <div className='filtersItem'>
          <input checked={search.online == 'true'} type='checkbox' id='filter-online' onChange={(e) => onChange('online', e.target.checked)}/>
          <label htmlFor='filter-online'>Online</label>
        </div>
      </div>

      <fieldset className='filtersList'>
        <legend>Calendar Highlight</legend>
        
        {/* TODO: Make showEventsMode an array */}
        <div className='filtersItem'>
          <input checked={search.showEventsMode0 == 'true' || search.showEventsMode0 === undefined} type='checkbox' id='filter-sem-0' onChange={(e) => onChange('showEventsMode0', e.target.checked || false)}/>
          <label htmlFor='filter-sem-0'>Start Date</label>
        </div>
        <div className='filtersItem'>
          <input checked={search.showEventsMode1 == 'true'} type='checkbox' id='filter-sem-1' onChange={(e) => onChange('showEventsMode1', e.target.checked || undefined)}/>
          <label htmlFor='filter-sem-1'>In-Between Dates</label>
        </div>
        <div className='filtersItem'>
          <input checked={search.showEventsMode2 == 'true'} type='checkbox' id='filter-sem-2' onChange={(e) => onChange('showEventsMode2', e.target.checked || undefined)}/>
          <label htmlFor='filter-sem-2'>End Date</label>
        </div>
      </fieldset>

      <div className='filtersItem'>
        <label htmlFor='filter-country'>Country:</label>
        <select value={search.country} id='filter-country' onChange={(e) => onChange('country', e.target.value)}>
          <option value=''>All</option>
          {countries.map((c) => (<option value={c} key={c}>{c}</option>))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
