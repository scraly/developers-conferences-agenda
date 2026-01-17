const fs = require("fs");

const ROOT = "../";
const MAIN_INPUT = ROOT + "README.md";
const TAGS_INPUT = ROOT + "TAGS.csv";
const MAIN_OUTPUT = ROOT + "page/src/misc/all-events.json";
const CFP_OUTPUT = ROOT + "page/src/misc/all-cfps.json";
const MONTHS_NAMES =
  "january,february,march,april,may,june,july,august,september,october,november,december".split(
    ","
  );
const MONTHS_SHORTNAMES = MONTHS_NAMES.map((m) => m.slice(0, 3));

const getTimeStamp = (year,month,day) => new Date(Date.UTC(year,month,day,0,0,0)).getTime()

const parseTags = () => {
  try {
    const tagsContent = fs.readFileSync(TAGS_INPUT, 'utf8');
    const lines = tagsContent.split('\n').filter(line => line.trim() !== '');
    const tagsMap = new Map();
    
    for (let i = 1; i < lines.length; i++) { // Skip header row
      const line = lines[i].trim();
      if (!line) continue;
      
      const [eventId, ...tagsParts] = line.split(',');
      const tagsString = tagsParts.join(',');
      const tags = tagsString.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '' && tag.includes(':'))
        .map(tag => {
          const [key, value] = tag.split(':');
          return { key: key.trim(), value: value.trim() };
        });
      tagsMap.set(eventId, tags);
    }
    
    return tagsMap;
  } catch (error) {
    console.warn('TAGS.csv not found or invalid, continuing without tags');
    return new Map();
  }
}

const generateEventId = (conf) => {
  // Generate ISO date from the first date in the date array
  const firstDate = new Date(conf.date[0]);
  const isoDate = firstDate.toISOString().split('T')[0];
  return `${isoDate}-${conf.name}`;
}

const extractArchiveFiles = (
  markdown //eg: " * [2017](archives/2017.md)"
) =>
  [...markdown.matchAll(/^\s*\*\s*\[.*\]\(archives\/.*\.md\)\s*$/gm)]
    .map((match) => match[0])
    .map(
      (archiveLine) =>
        ROOT + archiveLine.trim().replaceAll(/^.*(archives\/.*\.md).*$/g, "$1")
    );

const extractConfs = (markdown) =>
  extractYearBlocks(markdown).flatMap((y) =>
    extractMonthBlocks(y.markdown).flatMap((m) =>
      extractEvents(m.markdown, y.year, m.month)
    )
  );

const extractYearBlocks = (markdown) => {
  const years = [...markdown.matchAll(/^## \d+$/gm)].map((m) => ({
    start: m.index,
    year: m[0].replaceAll(/^\D*(\d+)\D*$/g, "$1"),
  }));
  if (!years) return;
  for (let index = 0; index < years.length - 1; index++) {
    const year = years[index];
    year.markdown = markdown.slice(year.start, years[index + 1].start);
  }
  const lastYear = years[years.length - 1];
  lastYear.markdown = markdown.slice(lastYear.start);
  return years;
};

const extractMonthBlocks = (yearMarkdown) => {
  const months = [...yearMarkdown.matchAll(/^### \w+$/gm)]
    .map((m) => ({
      start: m.index,
      month_en: m[0].replaceAll(/^\W*(\w+)\W*$/g, "$1"),
    }))
    .map((month) => ({
      ...month,
      month: MONTHS_NAMES.indexOf(month.month_en.toLowerCase()),
    }));
  if (!months) return;
  for (let index = 0; index < months.length - 1; index++) {
    const month = months[index];
    month.markdown = yearMarkdown.slice(month.start, months[index + 1].start);
  }
  const lastMonth = months[months.length - 1];
  lastMonth.markdown = yearMarkdown.slice(lastMonth.start);
  return months;
};

const extractEvents = (monthMarkdown, year, month) => {
  // '* 31-03/02: [SnowCamp](https://snowcamp.io/fr/) - Grenoble (France)\n'
  const eventLines = monthMarkdown
    .match(/^\s*\*\s*(\[[^\]]*\])?\s*[0-9\/-]+:?.*$/gm)
  if (!eventLines) return [];
  return eventLines.map((eventLine) => {
      // Remove discount tags before parsing other fields to avoid polluting name/location/country
      const eventLineWithoutDiscounts = eventLine.replace(/\[discount:[^\]]+\]/g, '').trim();
      
      const links = eventLineWithoutDiscounts.match(/<a[^>]*>.*?<\/a>/g) || [];
      const sponsoringLink = links.find(link => link.includes('alt="Sponsoring"')) || "";
      const sponsoringUrl = sponsoringLink.match(/href="([^"]+)"/)?.[1];

      const cfpLink = links.find(link => link.includes('alt="CFP"')) || "";

      const miscContent = eventLineWithoutDiscounts.includes("</a>")
        ? eventLineWithoutDiscounts.trim().replaceAll(/^.*?(<a.*a>.*)$/g, "$1")
        : "";
      const misc = miscContent.replace(sponsoringLink, "").replace(cfpLink, "").trim();

      const event = {
        name: eventLineWithoutDiscounts.trim().replaceAll(/^.*[?0-9\/\-]+.*\[(.*)\].*$/g, "$1"),
        date: getTimeSpan(
          year,
          month,
          eventLineWithoutDiscounts.trim().replaceAll(/^\s*\*\s*([0-9\/-]*).*$/g, "$1")
        ),
        hyperlink: eventLineWithoutDiscounts.trim().replaceAll(/^.*\]\(([^)]*)\).*$/g, "$1"),
        location: eventLineWithoutDiscounts
          .trim()
          .replaceAll(/^[^\]]*[^)]*[\P{Letter}]*([^<]*).*$/ug, "$1")
          .trim(),
        city: eventLineWithoutDiscounts
          .trim()
          .replaceAll(/^[^\]]*[^)]*[\P{Letter}]*([^<]*).*$/ug, "$1")
          .trim()
          .replaceAll(/ \& Online/g, "")
          .replaceAll(/^([^(]*)\(.*$/g, "$1")
          .trim(),
        country: eventLineWithoutDiscounts 
          .trim()
          .replaceAll(/^[^\]]*[^)]*[\P{Letter}]*([^<]*).*$/ug, "$1")
          .trim()
          .replaceAll(/ \& Online/g, "")
          .replaceAll(/^[^(]*\(([^)]*)\)$/g, "$1")
          .trim(),
        misc: misc,
        cfp: extractCfp(misc),
  sponsoring: sponsoringUrl,
  closedCaptions: eventLineWithoutDiscounts.trim().match(/^.*(<img alt=.Closed Captions.).*$/) !== null,
  scholarship: eventLineWithoutDiscounts.trim().match(/^.*(<img alt=.Scholarship.).*$/) !== null,
  sponsoringBadge: eventLineWithoutDiscounts.trim().match(/^.*(<img alt=.Sponsoring.).*$/) !== null,
  discounts: extractDiscounts(eventLine),
        status: eventLineWithoutDiscounts.trim().startsWith("* [")
          ? eventLineWithoutDiscounts.trim().replaceAll(/^[^[]*\[([\w\s]*)\].*$/g, "$1")
          : "open",
      };
    return event;
  });
}

const getTimeSpan = (year, month, datespan) => {
  const [startDay, endDay] = datespan.split("-").map((d) => d.trim());
  if (!endDay) {
    return [ getTimeStamp(year,month,+startDay) ]
  }
  if (endDay.includes("/")) {
    //event ends next month "31-02/04"
    return [ getTimeStamp(year,month,+startDay), getTimeStamp(year,month+1,+endDay.split('/')[0])]
  }
  if (+startDay > +endDay) {
    //event ends next month "31-02"
    return [ getTimeStamp(year,month,+startDay), getTimeStamp(year,month+1,+endDay)]
  }
  return [ getTimeStamp(year,month,+startDay), getTimeStamp(year,month,+endDay,0,0,0)]
};
const extractCfp = (shieldCode) => {
  if (!shieldCode.includes("shields.io")) return {};
  const label = shieldCode.replaceAll(/^.*label=([^&]*)&.*$/g, "$1");
  if (!label.match(/cfp/i)) return {};

  const message = decodeURI(
    shieldCode.replaceAll(/^.*&message=([^&]*)&.*$/g, "$1")
  );
  const untilStr = decodeURI(
    shieldCode.replaceAll(/^.*&message=([^&]*)&.*$/g, "$1")
  )
    .replace(/^.*(until|to)\s/gi, "")
    .trim();
  const year = untilStr.replaceAll(/^.*(\d{4})$/g, "$1");
  const monthStr = untilStr.replaceAll(/[^a-zA-Z]/g, "");
  const month = MONTHS_SHORTNAMES.indexOf(monthStr.slice(0, 3).toLowerCase());
  const day = untilStr.replaceAll(/^\D*(\d{1,2}).*$/g, "$1");
  const untilDate = getTimeStamp(year, month, day)

  return {
    link: shieldCode.includes("href=")
      ? shieldCode.replaceAll(/^.*href="([^"]*)".*$/g, "$1")
      : "",
    until: untilStr,
    untilDate: untilDate,
  };
};

const extractDiscounts = (eventLine) => {
  // Pattern: [discount:CODE|20%|until=2025-10-31]
  const discountMatches = [...eventLine.matchAll(/\[discount:([^\]]+)\]/g)];
  if (!discountMatches || discountMatches.length === 0) return [];
  
  return discountMatches.map((match) => {
    const content = match[1];
    const parts = content.split('|').map(p => p.trim());
    
    const discount = {
      code: parts[0] || "",
      value: "",
      type: "percent",
      until: "",
      untilDate: null
    };
    
    // Parse remaining parts (value, type, until)
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.includes('=')) {
        const [key, val] = part.split('=').map(p => p.trim());
        if (key === 'until') discount.until = val;
      } else {
        // Assume it's the discount value (e.g., "20%" or "€50")
        discount.value = part;
      }
    }
    
    // Parse until date if present
    if (discount.until) {
      const dateParts = discount.until.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (dateParts) {
        const year = parseInt(dateParts[1]);
        const month = parseInt(dateParts[2]) - 1;
        const day = parseInt(dateParts[3]);
        discount.untilDate = getTimeStamp(year, month, day);
      }
    }
    
    return discount;
  });
};

//main file parsing
const mainContent = fs.readFileSync(MAIN_INPUT).toString();
const currentConfs = extractConfs(mainContent);

//archives parsing
const archives = extractArchiveFiles(mainContent);
const archiveConfs = archives.flatMap((archive) =>
  extractConfs(fs.readFileSync(archive).toString())
);

//tags parsing
const tagsMap = parseTags();

//aggregation and tags integration
const allConfs = archiveConfs.concat(currentConfs).map((conf) => {
  const eventId = generateEventId(conf);
  const tags = tagsMap.get(eventId) || [];
  return {
    ...conf,
    tags: tags
  };
});
try {
    fs.writeFileSync(MAIN_OUTPUT, JSON.stringify(allConfs));
} catch (error) {
    console.error("Error writing to file:", error);
}

const allCFPs = allConfs
  .filter((conf) => conf.cfp.untilDate)
  .map((conf) => ({
    ...conf.cfp,
    conf: {
      name: conf.name,
      date: conf.date,
      hyperlink: conf.hyperlink,
      status: conf.status,
      location: conf.location,
    },
  }))
  .sort((a, b) => a.untilDate - b.untilDate);
fs.writeFileSync(CFP_OUTPUT, JSON.stringify(allCFPs));
