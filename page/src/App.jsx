import {useEffect} from 'react';
import {HashRouter as Router, Routes, Route, useParams, useNavigate, useSearchParams, createSearchParams} from "react-router-dom";

import {CalendarDays, CalendarClock} from 'lucide-react';

import CalendarGrid from 'components/CalendarGrid/CalendarGrid';
import ListView from 'components/ListView/ListView';
import ViewSelector from 'components/ViewSelector/ViewSelector';
import MapView from 'components/MapView/MapView';
import YearSelector from 'components/YearSelector/YearSelector';
import Filters from 'components/Filters/Filters';

import {useHasYearEvents} from 'app.hooks';
import SelectedEvents from 'components/SelectedEvents/SelectedEvents';
import 'misc/fonts/inter/inter.css';
import 'styles/App.css';

import { Index } from 'routes';
import { Year } from 'routes/year';
import { DatePage } from 'routes/datepage';
import { MapPage } from 'routes/mappage';
import { ListPage } from 'routes/listpage';

const App = () => {
  return (
    <Router>
      <h1 className="dcaTitle">Developer Conferences Agenda</h1>
      <Routes path="/">
        <Route path="" Component={Index} />
        <Route path=":year" Component={Year} />

        <Route path=":year/calendar/:month?/:date?" Component={DatePage} />
        <Route path="/:year/map" Component={MapPage} />
        <Route path="/:year/list" Component={ListPage} />
      </Routes>
    </Router>
  );
};

export default App;
