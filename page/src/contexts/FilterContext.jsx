import {createContext} from 'react';

const FilterContext = createContext({
  searchParams: {},
  open: false,
});

export default FilterContext;
