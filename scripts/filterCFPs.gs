function main() {
  checkOngoingCFPsThisWeek('(France)');
}

function checkOngoingCFPsThisWeek(locationFilter) {
  var cfpJsonDataList = JSON.parse(UrlFetchApp.fetch('https://developers.events/all-cfps.json').getContentText());

  var todayDate = new Date();
  var day = todayDate.getDay();

  var thisDateOnMonday = new Date(todayDate);
  thisDateOnMonday.setDate(todayDate.getDate() - day + (day == 0 ? -6 : 1));
  var thisDateOnSunday = new Date(thisDateOnMonday);
  thisDateOnSunday.setDate(thisDateOnMonday.getDate() + 6);

  var filteredCfps = filter(
    cfpJsonDataList, 
    [
      locationFilter ? buildFilterLocation(locationFilter) : null,
      buildFilterThisYear(),
      buildFilterOpenDuringDateRange(thisDateOnMonday, thisDateOnSunday),
    ].filter((filterMethod) => filterMethod != null),
  );
  // Sort by untilDate ASC
  filteredCfps.sort( (cfpJsonData1, cfpJsonData2) => new Date(cfpJsonData1.untilDate) - new Date(cfpJsonData2.untilDate) );

  if (filteredCfps.length > 0) {
    sendMarkdownChatMessage(toMarkdown(filteredCfps, thisDateOnMonday, thisDateOnSunday))
  }
}

// Filter methods

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

// Format methods

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
  var cfpUntilDate = new Date(cfpJsonData.untilDate);
  rowBuilder.push('[' + buildEmergencyLevelIndicator(cfpUntilDate) + ' Open until ' + formatDate(cfpUntilDate) + '](' + cfpJsonData.link + ')');

  return '|' + rowBuilder.join('|') + '|';
}

function buildEmergencyLevelIndicator(endDate) {
  var daysUntilEndDate = Math.floor(Math.abs(endDate - new Date()) / (1000 * 60 * 60 * 24) );
  switch(true) {
    case (daysUntilEndDate <= 7):
      return '🔴';
    case (daysUntilEndDate <= 30):
      return '🟡';
    default:
      return '🟢';
  }
}

function formatDate(date) {
  return (date.getDate()) + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
}
