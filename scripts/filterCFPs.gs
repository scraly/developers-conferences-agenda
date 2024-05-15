function checkOngoingCFPsInFranceThisWeek() {
  var cfpJsonDataList = JSON.parse(UrlFetchApp.fetch("https://developers.events/all-cfps.json").getContentText());

  var todayDate = new Date();
  var day = todayDate.getDay();

  var thisDateOnMonday = new Date(todayDate);
  thisDateOnMonday.setDate(todayDate.getDate() - day + (day == 0 ? -6 : 1));
  var thisDateOnSunday = new Date(thisDateOnMonday);
  thisDateOnSunday.setDate(thisDateOnMonday.getDate() + 6);

  var filteredCfps = filter(
    cfpJsonDataList, 
    [
      buildFilterLocation("(France)"),
      buildFilterThisYear(),
      buildFilterOpenDuringDateRange(thisDateOnMonday, thisDateOnSunday),
    ],
  );

  if (filteredCfps.length > 0) {
    sendMarkdownChatMessage(toMarkdown(filteredCfps, thisDateOnMonday, thisDateOnSunday))
  }
}

function toMarkdown(filteredCfps, thisDateOnMonday, thisDateOnSunday) {
  var stringBuilder = [];
  stringBuilder.push('### Ongoing CFPs from '+formatDate(thisDateOnMonday)+' to '+formatDate(thisDateOnSunday));
  stringBuilder.push('');
  stringBuilder.push('|Name|🗓️ Dates|📍 Location|🗣️ CFP Status|');
  stringBuilder.push('|---|---|---|---|');

  for (cfpIndex in filteredCfps) {
    stringBuilder.push(cfpToMarkdown(filteredCfps[cfpIndex]));
  }

  return stringBuilder.join('\n');
}

function cfpToMarkdown(cfpJsonData) {
  var rowBuilder = [];
  rowBuilder.push('[' + cfpJsonData.conf.name + '](' + cfpJsonData.conf.hyperlink + ')');
  rowBuilder.push(cfpJsonData.conf.date.map((date) => formatDate(new Date(date))).join(' to '));
  rowBuilder.push(cfpJsonData.conf.location);
  rowBuilder.push('[Open until ' + formatDate(new Date(cfpJsonData.untilDate)) + '](' + cfpJsonData.link + ')');

  return '|' + rowBuilder.join('|') + '|';
}

function buildFilterLocation(countryCode) {
  return (cfpJsonData) => {
      return (cfpJsonData && cfpJsonData.conf && cfpJsonData.conf.location && cfpJsonData.conf.location.includes(countryCode));
  };
}

function buildFilterThisYear() {
  var todayDate = new Date();

  return (cfpJsonData) => {
      return (cfpJsonData && cfpJsonData.untilDate && new Date(cfpJsonData.untilDate).getFullYear() == todayDate.getFullYear());
  };
}

function buildFilterOpenDuringDateRange(dateStart, dateEnd) {
  return (cfpJsonData) => {
      if (cfpJsonData && cfpJsonData.untilDate) {
        var cfpEndDate = new Date(cfpJsonData.untilDate);
        return (cfpEndDate >= dateStart || cfpEndDate > dateEnd);
      }
      return false;
  };
}

function filter(cfpJsonDataList, filterMethods) {
  var filteredCfps = [];

  for (cfpIndex in cfpJsonDataList) {
    var cfpJsonData = cfpJsonDataList[cfpIndex];
    if (cfpJsonData && filterMethods.every((filterMethod) => filterMethod(cfpJsonData))) {
      filteredCfps.push(cfpJsonData);
    }
  }

  return filteredCfps;
}

function formatDate(date) {
  return (date.getDate()) + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
}
