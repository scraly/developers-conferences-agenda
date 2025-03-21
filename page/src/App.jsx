import {HashRouter as Router, Routes, Route} from 'react-router-dom';

import FilterContext from 'contexts/FilterContext';
import Layout from './layout/Layout';
import IndexPage from 'routes/IndexPage';
import YearPage from 'routes/YearPage';
import DatePage from 'routes/datepage';
import MapPage from 'routes/mappage';
import ListPage from 'routes/listpage';
import CfpPage from 'routes/cfppage';
import ScrollToTopButton from './components/ScrollToTopButton/ScrollToTopButton';

const App = () => {
  // TODO: DRY
  const filtercontextdefaults = {
    searchParams: {},
    open: false,
  };

  return (
    <FilterContext.Provider value={filtercontextdefaults}>
      <Router>
        <Routes>
          <Route element={<IndexPage />} path="/" />
          <Route path=":year" element={<Layout />}>
            <Route index element={<YearPage />} />
            <Route element={<CfpPage />} path="cfp" />
            <Route element={<DatePage />} path="calendar/:month?/:date?" />
            <Route element={<ListPage />} path="list" />
            <Route element={<MapPage />} path="map" />
          </Route>
        </Routes>
        <ScrollToTopButton />
      </Router>
    </FilterContext.Provider>
  );
};

export default App;
