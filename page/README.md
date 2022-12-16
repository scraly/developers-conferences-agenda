# page
This is a React project directory.

## Development
 - Edit files in `src/` or `public/` directory only.
 - `npm start` to open react hot-reload environment.

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
