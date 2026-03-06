# page
This is a React project directory.

## Development

* Install tools

```
$ cd page
$ npm install -D
```

* Build

```
$ npm run build
```

* Edit files in `src/` or `public/` directory only.

### Testing

Run unit tests:

```bash
$ npm test          # Run in watch mode (auto-rerun on changes)
$ npm test -- --run # Run once
$ npm run test:ui   # Open visual test UI
```

Tests are located next to source files (e.g., `src/app.hooks.test.js`).

### Run locally

Open react hot-reload environment:

```
$ npm start
```

## Production

There are GitHub Actions available at `.github/workflows/ghpages.yml` which will:
1. **Run unit tests** - Ensures all tests pass before deployment
2. Parse markdown files and combine them into `all-events.json` 
3. Move the JSON file to `page/src/misc/all-events.json`
4. Build the project with `npm run build`
5. Deploy the `build/` directory to GitHub Pages

**Note:** The deployment will fail if any tests fail, ensuring code quality.

## Configuration

### Filter Dimensions

The CFP page filter panel is driven by `TAG_FILTER_CONFIG` in `src/app.hooks.js`:

```javascript
export const TAG_FILTER_CONFIG = {
  allowed: ['topic', 'tech', 'language'],
  blocked: ['location']
}
```

- **`allowed`** — tag keys that get their own multi-select filter dropdown. Each key listed here generates a filter if at least one event has a tag with that key.
- **`blocked`** — tag keys that are explicitly suppressed, even if they exist in the data. The `location` key is blocked because it duplicates the dedicated Country/Region filters.
- Tag keys not in either list are silently ignored (no filter generated).

To add a new filter dimension (e.g. when `type` tags are added to the data), add the key to `allowed`:

```javascript
allowed: ['topic', 'tech', 'language', 'type'],
```

### URL Parameter Format

Each filter dimension maps to URL query parameters for shareable filtered views:

| Parameter | Format | Example |
|-----------|--------|---------|
| `{dim}` | comma-separated included values | `topic=Frontend,DevOps` |
| `{dim}_not` | comma-separated excluded values | `tech_not=PHP` |
| `{dim}_mode` | `any` (default, OR) or `all` (AND) | `topic_mode=all` |
| `country` | comma-separated | `country=France,Germany` |
| `region` | comma-separated | `region=Europe,Asia` |
| `online` | boolean | `online=true` |
| `inPerson` | boolean | `inPerson=true` |

Legacy `tags=key:value,...` URLs are still parsed for backward compatibility.

### Region/Country Mappings

Region-to-country groupings are defined in `src/misc/regions.json`. When a user selects a region, the country filter narrows to show only countries in that region.

### Components
#### YearSelector
```
<YearSelector year={number} onChange={Function}/>
```
 - `year` - Used to display the big year label.
 - `onChange` - Invoked upon year selection changed (using left/right caret icon in UI).

#### downloadButton
A simple `<div>` that is an interface to .ics file export.

#### CalendarGrid
```
<CalendarGrid year={number} displayDate={Function} />
```
 - `year` - Used to refer the selected year and render only it.
 - `displayDate` - Invoked when user clicked on any date (`<Day/>`) element, also enables smooth scrolling.

#### SelectedEvents
```
<SelectedEvents events={Array} date={Date} />
```
 - `events` - Used to render the events on supplied date.
 - `date` - Used to render ISO format date YYYY-MM-DD.

#### Week
```
<Week>{children}</Week>
```
 - `children` - Array of `<Day/>`

#### Day
```
<Day date={Date} events={Array} displayDate={Function} />
```
 - `date` - Used to render calendar date (`Date.getDate()`)
 - `events` - Used to determine date event intensity level.
 - `displayDate` - Invoked when user clicked this element.
