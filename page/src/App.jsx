import {HashRouter as Router, Routes, Route} from "react-router-dom";
import 'misc/fonts/inter/inter.css';
import 'styles/App.css';
import 'styles/theme.css';

import { Index } from 'routes';
import { Year } from 'routes/year';
import { DatePage } from 'routes/datepage';
import { MapPage } from 'routes/mappage';
import { ListPage } from 'routes/listpage';
import { CfpPage } from 'routes/cfppage';
import { FilterContext } from 'contexts/FilterContext';
import { FavoritesProvider } from 'contexts/FavoritesContext';
import { TagsProvider } from 'contexts/TagsContext';
import { LanguageProvider, useTranslation } from 'contexts/LanguageContext';
import { ThemeProvider } from 'contexts/ThemeContext';
import { ScrollToTopButton } from './components/ScrollToTopButton/ScrollToTopButton';
import AddEventButton from './components/AddEventButton/AddEventButton';
import LanguageSelector from './components/LanguageSelector/LanguageSelector';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import Footer from './components/Footer/Footer';

const AppContent = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="app-header">
        <h1 className="dcaTitle">{t('common.title')}</h1>
        <div className="header-buttons">
          <AddEventButton />
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

const App = () => {
  // TODO: DRY
  const filtercontextdefaults = {
    searchParams: {},
    open: false,
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <TagsProvider>
            <FilterContext.Provider value={filtercontextdefaults}>
              <Router>
                <AppContent />
                <Routes>
                  <Route Component={Index} path="/" />
                  <Route Component={Year} path=":year" />
                  <Route Component={DatePage} path=":year/calendar/:month?/:date?" />
                  <Route Component={MapPage} path="/:year/map" />
                  <Route Component={ListPage} path="/:year/list" />
                  <Route Component={CfpPage} path="/:year/cfp" />
                </Routes>
                <ScrollToTopButton />
                <Footer />
              </Router>
            </FilterContext.Provider>
          </TagsProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
