import {HashRouter as Router, Routes, Route} from "react-router-dom";
import 'misc/fonts/inter/inter.css';
import 'styles/App.css';

import { Index } from 'routes';
import { Year } from 'routes/year';
import { DatePage } from 'routes/datepage';
import { MapPage } from 'routes/mappage';
import { ListPage } from 'routes/listpage';
import { CfpPage } from 'routes/cfppage';
import { FilterContext } from 'contexts/FilterContext';
import { FavoritesProvider } from 'contexts/FavoritesContext';
import { TagsProvider } from 'contexts/TagsContext';
import { ScrollToTopButton } from './components/ScrollToTopButton/ScrollToTopButton';
import AddEventButton from './components/AddEventButton/AddEventButton';

const App = () => {
  // TODO: DRY
  const filtercontextdefaults = {
    searchParams: {},
    open: false,
  };

  return (
    <FavoritesProvider>
      <TagsProvider>
        <FilterContext.Provider value={filtercontextdefaults}>
          <Router>
            <div className="app-header">
              <h1 className="dcaTitle">Developer Conferences Agenda</h1>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <AddEventButton />
              </div>
            </div>
            <Routes>
              <Route Component={Index} path="/" />
              <Route Component={Year} path=":year" />
              <Route Component={DatePage} path=":year/calendar/:month?/:date?" />
              <Route Component={MapPage} path="/:year/map" />
              <Route Component={ListPage} path="/:year/list" />
              <Route Component={CfpPage} path="/:year/cfp" />
            </Routes>
            <ScrollToTopButton />
          </Router>
        </FilterContext.Provider>
      </TagsProvider>
    </FavoritesProvider>
  );
};

export default App;
