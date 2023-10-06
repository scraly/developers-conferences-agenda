import React from 'react';

import 'styles/Filters.css';

const Filters = ({ query, callForPapers, onChange }) => {
  return (
    <div className="filters">
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
