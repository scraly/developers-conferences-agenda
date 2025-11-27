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
