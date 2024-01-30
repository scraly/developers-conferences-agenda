import {useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route, useParams, useNavigate, useSearchParams, createSearchParams} from "react-router-dom";

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

const App = () => {
  return (
    <Router>
      <h1 className="dcaTitle">Developer Conferences Agenda</h1>
      <Routes path="/">
        <Route path="" Component={() => {
            const navigate = useNavigate();
            useEffect(() => {
                return navigate('/' + new Date().getFullYear());
            }, []);
        }} />
        <Route path=":year" Component={() => {
            const {year} = useParams();
            const navigate = useNavigate();
            useEffect(() => {
                return navigate('/' + year + '/calendar');
            }, [year]);
        }} />
        <Route path=":year/calendar/:month?/:date?" Component={() => {
            const {year, month, date} = useParams();
            const navigate = useNavigate();
            const [searchParams] = useSearchParams();
            const hasYearEvents = useHasYearEvents(year);

            return (
                <div className="dcaGrid">
                  <Filters/>
                  <div className="dcaContent">
                    <YearSelector
                      isMap={false}
                      year={parseInt(year, 10)}
                      onChange={year => {
                        navigate(`/${year}/calendar?${createSearchParams(searchParams)}`);
                      }}
                    />
                    {hasYearEvents && (
                      <div className='downloadButtons'>
                        <a href={'/developer-conference-' + year + '.ics'} title={'Download ' + year + ' Calendar'} className="downloadButton">
                          <CalendarDays />
                          {year} Calendar
                        </a>
                        <a href={'/developer-conference-opened-cfps.ics'} title="Download Opened CFP Calendar" className="downloadButton">
                          <CalendarClock />
                          Opened CFP Calendar
                        </a>
                      </div>
                    )}

                    <ViewSelector selected={'calendar'}/>

                    <CalendarGrid year={year} />
                    <SelectedEvents date={date} month={month} />
                </div>
              </div>
            );
        }} />
        <Route path="/:year/map" Component={() => {
            const {year} = useParams();
            const navigate = useNavigate();
            const [searchParams] = useSearchParams();

            return (
                <div className="dcaGrid">
                  <Filters/>
                  <div className="dcaContent">
                    <YearSelector
                      isMap={true}
                      year={parseInt(year, 10)}
                      onChange={year => {
                        navigate(`/${year}/map?${createSearchParams(searchParams)}`);
                      }}
                    />

                    <ViewSelector selected={'map'}/>

                    <MapView year={year} />
                </div>
              </div>
            );
        }} />
        <Route path="/:year/list" Component={() => {
            const {year} = useParams();
            const navigate = useNavigate();
            const [searchParams] = useSearchParams();

            return (
                <div className="dcaGrid">
                  <Filters/>
                  <div className="dcaContent">
                    <YearSelector
                      isMap={false}
                      year={parseInt(year, 10)}
                      onChange={year => {
                        navigate(`/${year}/list?${createSearchParams(searchParams)}`);
                      }}
                    />

                    <ViewSelector selected={'list'}/>

                    <ListView year={year} />
                </div>
              </div>
            );
        }} />
      </Routes>
    </Router>
  );
};

export default App;
