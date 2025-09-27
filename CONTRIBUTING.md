# Contributing

This list of tech conferences is growing every day thanks to you.
There is no small contribution! 💪

## Eligible conference

The aim of this calendar is to list community events. To be accepted, events must meet the following criteria:
* include a variety of presentations from people outside the organization
* offer a CFP
* last at least 1/2 day
* be open to the public
* target a developer audience

Examples of rejected conferences:
* regular "meetup" events
* corporate promotional events

## Guidelines

* All changes must be made in a branch and submitted as a Pull Request (PR)
* Future conference(s) must be added to the `README.md` file
* Past conferences appear in the `archives/YYYY.md` file
* Add one or several events per PR with the following format:
```
* date: [Conference Name](https://example.com/) - City, state (Country)
```
* If there's an ongoing Call For Proposals (CFP), please specify it at the end of the line: 
```
<a href="https://example.com/"><img alt="CFP conference-name" src="https://img.shields.io/static/v1?label=CFP&message=until%20DD-MONTH-YYYY&color=green"></a>
```
* If the conference has a sponsoring deck, please specify it at the end of the line:
```
<a href="https://www.linkofthesponsoring.deck"><img alt="Sponsoring" src="https://img.shields.io/badge/sponsoring-8A2BE2"></a>
```
* If the conference will be subtitles with closed captions, please specify it at the end of the line:
```
<img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" />
```
* Make sure the PR title is in the format of `Add Conference Name`
* Check your spelling and grammar
* Remove any trailing whitespace
* Use Prettier to format the code: `npm run format`
* Use ESLint for linters: `npm run lint`

Thanks! ❤️
