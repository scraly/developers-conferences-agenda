import React, { useState } from 'react';

import { Filter, FilterX } from 'lucide-react';

import 'styles/Filters.css';

const Filters = ({ query, callForPapers, onChange, onClose }) => {
  const [open, setOpen] = useState(false);
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
        <label for='filter-query'>Search:</label>
        <input id='filter-query' type='text' value={query} onChange={(e) => onChange('query', e.target.value)}/>
      </div>

      <div className='filtersItem'>
        <label for='filter-call-for-papers'>Call For Papers Open:</label>
        <input checked={callForPapers} type='checkbox' id='filter-call-for-papers' onChange={(e) => onChange('callForPapers', e.target.checked)}/>
      </div>
    </div>
  );
};

export default Filters;
