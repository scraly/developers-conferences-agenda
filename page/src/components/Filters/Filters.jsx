import React, { useState } from 'react';

import { Filter, FilterX } from 'lucide-react';

import {useCountries} from 'app.hooks';

import 'styles/Filters.css';

const Filters = ({ query, callForPapers, closedCaptions, online, country, onChange, onClose }) => {
  const [open, setOpen] = useState(false);
  const countries = useCountries()

  return (
    <div className={"filters " + (open ? 'open' : 'closed')}>
      <div
          className='filters-header'
          title={open ? 'Close filters' : 'Open filters'}
          onClick={() => {
              if (open) {
                  onClose();
                  setOpen(false);
                  return;
              }
              setOpen(true);
          }}
      >
          {open ? <FilterX/> : <Filter/>}
          <span className='filters-title'>Filters</span>
      </div>

      <div className='filtersItem'>
        <label htmlFor='filter-query'>Search:</label>
        <input id='filter-query' type='text' value={query} onChange={(e) => onChange('query', e.target.value)}/>
      </div>

      <div className='filtersItem'>
        <label htmlFor='filter-call-for-papers'>Call For Papers Open:</label>
        <input checked={callForPapers} type='checkbox' id='filter-call-for-papers' onChange={(e) => onChange('callForPapers', e.target.checked)}/>
      </div>

      <div className='filtersItem'>
        <label htmlFor='filter-closed-captions'>Closed Captions:</label>
        <input checked={closedCaptions} type='checkbox' id='filter-closed-captions' onChange={(e) => onChange('closedCaptions', e.target.checked)}/>
      </div>

      <div className='filtersItem'>
        <label htmlFor='filter-online'>Online:</label>
        <input checked={online} type='checkbox' id='filter-online' onChange={(e) => onChange('online', e.target.checked)}/>
      </div>

      <div className='filtersItem'>
        <label htmlFor='filter-country'>Country:</label>
        <select value={country} id='filter-country' onChange={(e) => onChange('country', e.target.value)}>
          <option value=''>All</option>
          {countries.map((c) => (<option value={c} key={c}>{c}</option>))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
