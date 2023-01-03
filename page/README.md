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

### Run locally

Open react hot-reload environment:

```
$ npm start
```

## Production

There are a GitHub Action available at `.github/workflows/ghpages.yml` which will begin parsing markdown files and combine them into one file named `all-events.json` which then moved to `page/src/misc/all-events.json`. Finally, this project directory will begin building with `npm run build` and another GitHub Workflow to push the `build/` directory to GitHub Pages is executed.

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
