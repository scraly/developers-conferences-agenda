import {HashRouter as Router, Routes, Route, useParams, useNavigate, useSearchParams, createSearchParams} from "react-router-dom";
import 'misc/fonts/inter/inter.css';
import 'styles/App.css';

import { Index } from 'routes';
import { Year } from 'routes/year';
import { DatePage } from 'routes/datepage';
import { MapPage } from 'routes/mappage';
import { ListPage } from 'routes/listpage';
import { FilterContext } from 'contexts/FilterContext';
import ScrollToTopButton from './components/ScrollToTopButton';

const App = () => {
  // TODO: DRY
  const filtercontextdefaults = {
    searchParams: {},
    open: false,
  };

  return (
    <FilterContext.Provider value={filtercontextdefaults}>
      <Router>
        <h1 className="dcaTitle">Developer Conferences Agenda</h1>
        <Routes>
          <Route path="/" Component={Index} />
          <Route path=":year" Component={Year} />
          <Route path=":year/calendar/:month?/:date?" Component={DatePage} />
          <Route path="/:year/map" Component={MapPage} />
          <Route path="/:year/list" Component={ListPage} />
        </Routes>
        <ScrollToTopButton />
      </Router>
    </FilterContext.Provider>
  );
};

export default App;
