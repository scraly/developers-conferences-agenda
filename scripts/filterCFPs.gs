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

  Logger.log("Ongoing CFPs from "+formatDate(thisDateOnMonday)+" to "+formatDate(thisDateOnSunday));
  for (cfpIndex in filteredCfps) {
    var cfpJsonData = filteredCfps[cfpIndex];
    Logger.log(toPretty(cfpJsonData));
  }
}

function toPretty(cfpJsonData) {
  return "[" + cfpJsonData.conf.date.map((date) => formatDate(new Date(date))).join(" to ") + "] " + cfpJsonData.conf.name + " @" + cfpJsonData.conf.location + " - CFP open until " + formatDate(new Date(cfpJsonData.untilDate)) + " : " + cfpJsonData.link;
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
