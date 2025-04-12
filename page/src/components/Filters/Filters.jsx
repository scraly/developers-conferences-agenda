import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';

import {useCountries, useRegions, useRegionsMap} from 'app.hooks';

import FilterContext from 'contexts/FilterContext';

import './Filters.css';

const Filters = ({view}) => {
  const context = useContext(FilterContext);
  const [searchParams, setSearchParams] = useSearchParams(context.searchParams);

  useEffect(() => {
    context.searchParams = searchParams;
  }, [searchParams, context]);

  const onChange = useCallback(
    (key, value) => {
      if (key === 'region') {
        setSearchParams({...Object.fromEntries(searchParams), region: value, country: ''});
      } else {
        setSearchParams({...Object.fromEntries(searchParams), [key]: value});
      }
    },
    [searchParams, setSearchParams]
  );

  const countries = useCountries();
  const regions = useRegions();
  const regionsMap = useRegionsMap();

  const search = Object.fromEntries(searchParams);

  const countriesList = useMemo(() => {
    let result = countries;
    if (search.region) {
      result = regionsMap[search.region];
      result.sort();
    }
    return result;
  }, [search.region, regionsMap, countries]);

  return (
    <dialog id="filters">
      <article>
        <header>
          <button
            type="button"
            onClick={() => document.querySelector('#filters').setAttribute('open', false)}
          >
            &times;
          </button>
        </header>
        <form>
          <fieldset>
            <label htmlFor="filter-query">Query:</label>
            <input
              id="filter-query"
              onChange={e => onChange('query', e.target.value)}
              placeholder="Search..."
              type="text"
              value={search.query}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="filter-until">CFP Until:</label>
            <input
              id="filter-until"
              onChange={e => onChange('untilDate', e.target.value)}
              type="date"
              value={search.untilDate}
            />
          </fieldset>

          <fieldset>
            {view !== 'cfp' ? (
              <>
                {' '}
                <label>
                  <input
                    checked={search.callForPapers === 'true'}
                    id="filter-call-for-papers"
                    onChange={e => onChange('callForPapers', e.target.checked)}
                    type="checkbox"
                    role="switch"
                    aria-checked
                  />
                  Call For Papers Open
                </label>
                <label>
                  <input
                    checked={search.closedCaptions === 'true'}
                    id="filter-closed-captions"
                    onChange={e => onChange('closedCaptions', e.target.checked)}
                    type="checkbox"
                    role="switch"
                    aria-checked
                  />
                  Closed Captions
                </label>
                <label>
                  <input
                    checked={search.scholarship === 'true'}
                    id="filter-scholarship"
                    onChange={e => onChange('scholarship', e.target.checked)}
                    type="checkbox"
                    role="switch"
                    aria-checked
                  />
                  Scholarship
                </label>
              </>
            ) : (
              ''
            )}
            <label>
              <input
                checked={search.online === 'true'}
                id="filter-online"
                onChange={e => onChange('online', e.target.checked)}
                type="checkbox"
                role="switch"
                aria-checked
              />
              Online
            </label>
          </fieldset>
          <fieldset>
            <label htmlFor="filter-region">Region:</label>
            <select
              id="filter-region"
              onChange={e => onChange('region', e.target.value)}
              value={search.region}
            >
              <option value="">All</option>
              {regions.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </fieldset>
          {countriesList ? (
            <fieldset>
              <label htmlFor="filter-country">Country:</label>
              <select
                id="filter-country"
                onChange={e => onChange('country', e.target.value)}
                value={search.country}
              >
                <option value="">All</option>
                {countriesList.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </fieldset>
          ) : null}
          {view === 'list' ? (
            <fieldset>
              <label htmlFor="filter-sort">Sort:</label>
              <select
                id="filter-sort"
                onChange={e => onChange('sort', e.target.value)}
                value={search.sort}
              >
                <option value="date">Event Start Date</option>
                <option value="cfp">CFP Close Date</option>
              </select>
            </fieldset>
          ) : (
            ''
          )}
        </form>
      </article>
    </dialog>
  );
};

export default Filters;
