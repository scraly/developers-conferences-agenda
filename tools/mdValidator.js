const fs=require('fs');

const ROOT= "../"
const MAIN_INPUT = ROOT+"README.md"
const TAGS_CSV = ROOT + "TAGS.csv";
const METADATA_CSV = ROOT + "METADATA.csv";
const MONTHS_NAMES = "january,february,march,april,may,june,july,august,september,october,november,december".split(",");
const confIdentifierPattern = /^ *\* ?(\[.*\]\s?)?[0-9?x\/-]+/

// Structure générale (date, nom, lien, lieu)
const confValidationPattern = /^\*( \[(?<status>[\w ]+)\])? (?<date>\d{1,2}(\/\d{1,2})?(-\d{1,2})?(\/\d{1,2})?)\s?: \[(?<name>[^\]]*)\]\((?<link>https?:\S*)\)( - (?<place>[^<\n]*))?/;

// Permettre aussi les dates sans année (ex : 6-7: ...)
const confValidationPatternLoose = /^\*( \[(?<status>[\w ]+)\])? (?<date>\d{1,2}(-\d{1,2})?)\s?: \[(?<name>[^\]]*)\]\((?<link>https?:\S*)\)( - (?<place>[^<\n]*))?/;

const extractArchiveFiles = markdown => //eg: " * [2017](archives/2017.md)"
    [...markdown.matchAll(/^\s*\*\s*\[.*\]\(archives\/.*\.md\)\s*$/gm)].map( match => match[0])
    .map( archiveLine => ROOT + archiveLine.trim().replaceAll(/^.*(archives\/.*\.md).*$/g,'$1'));

const findConfLines = (fileContent, fileName) => {
    let year;
    let month;

    return fileContent.toString().split(/\n/)
        .map((content, index) => {
            const yearMatch = content.match(/^## (\d{4})$/);
            if (yearMatch) year = yearMatch[1];

            const monthMatch = content.match(/^### (\w+)$/);
            if (monthMatch) month = MONTHS_NAMES.indexOf(monthMatch[1].toLowerCase());

            return { content, lineNum: index + 1, fileName, year, month };
        })
        .filter(line => !!line.content.match(confIdentifierPattern))
}

const getEventIdentifier = (confLine) => {
    const dateMatch = confLine.content.match(/^\* (?:\[[^\]]+\] )?(\d{1,2})/);
    const nameMatch = confLine.content.match(/\[([^\]]+)\]\(https?:\/\//);
    if (!dateMatch || !nameMatch || confLine.month === -1 || !confLine.year) return null;

    const date = new Date(Date.UTC(confLine.year, confLine.month, dateMatch[1]));
    return `${date.toISOString().slice(0, 10)}-${nameMatch[1]}`;
}

const hasTrustedShieldsUrl = (text) => {
    const urls = text.match(/https?:\/\/[^\s"')>]+/g) || []
    return urls.some((urlString) => {
        try {
            const host = new URL(urlString).hostname.toLowerCase()
            return host === "img.shields.io" || host === "shields.io"
        } catch {
            return false
        }
    })
}

const hasOpenCfpBadge = (text) => {
    const badgeUrls = [...text.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map(match => match[1])
    return badgeUrls.some((urlString) => {
        try {
            const url = new URL(urlString)
            return url.searchParams.get("label") === "CFP" && url.searchParams.get("message") === "Open"
        } catch {
            return false
        }
    })
}

const addHints = confLine => {
    const hints = []
    if(!confLine.content.match(/^\*( \[(?<status>[\w ]+)\])? (?<date>\d{1,2}(\/\d{1,2})?(-\d{1,2})?(\/\d{1,2})?)/)){
        hints.push("date format seems wrong : 'DD' or 'DD-DD' or 'DD/MM-DD/MM'")
    }
    if(confLine.content.includes("—") || confLine.content.includes("–")){
        hints.push("long dash '—' found. did you mean '-' ?")
    }
    if(!confLine.content.includes("http")){
        hints.push("links should start with http:// or https://")
    }
    if(confLine.content.match(/\s{2,}/)){
        hints.push("avoid multiple spaces in a row")
    }
    if(!confLine.content.match(/^\*( \[(?<status>[\w ]+)\])? (?<date>\d{1,2}(\/\d{1,2})?(-\d{1,2})?(\/\d{1,2})?)\s?: \[(?<name>[^\]]*)\]\((?<link>https?:\S*)\)\s*$/)
     && !confLine.content.includes(" - ")){
        hints.push("there should be ' - ' between the event link and the location")
    }
    if(confLine.content.includes("label=CFP") && !confLine.content.includes("</a>")){
        hints.push("CFP shields should have a link")
    }
    if(hasTrustedShieldsUrl(confLine.content) && !(
        confLine.content.includes("label=CFP") || confLine.content.includes("Closed%20Captions") || confLine.content.includes("Scholarship") || confLine.content.includes("label=Meetup") || confLine.content.includes("Sponsoring") )){
        hints.push("shields are for 'CFP' or 'Closed Content' or 'Scholarship' or 'Sponsoring' or 'Meetup' with provided format only")
    }
    if(confLine.content.includes("label=CFP") && 
        confLine.content.includes("Closed%20Captions") &&
        confLine.content.indexOf("Closed%20Captions") < confLine.content.indexOf("label=CFP")){
        hints.push("please order your shields : CFP, ClosedContent")
    }
    if(confLine.content.includes("label=CFP") && 
    confLine.content.includes("Scholarship") &&
    confLine.content.indexOf("Scholarship") < confLine.content.indexOf("label=CFP")){
    hints.push("please order your shields : CFP, Scholarship")
}
    if(confLine.content.includes("label=CFP") && 
    confLine.content.includes("Sponsoring") &&
    confLine.content.indexOf("Sponsoring") < confLine.content.indexOf("label=CFP")){
    hints.push("please order your shields : CFP, Sponsoring")
}
    if(hasTrustedShieldsUrl(confLine.content) && !confLine.content.match(/>\s*$/) ){
        hints.push("please place your shields at the end of the line")
    }
    if(confLine.content.includes("label=CFP") && !confLine.content.match(/<a.*label=CFP.*([a-zA-Z]+-\d{2}-\d{4}|\d{2}-[a-zA-Z]+-\d{4}|\d{4}-[a-zA-Z]+-\d{2})&.*<\/a>/) ){
        hints.push("please use a conform CFP date format (DD-MMM-YYYY, MMM-DD-YYYY, YYYY-MMM-DD) eg: 04-Jan-2023")
    }
    if(confLine.content.includes("label=Sponsoring") && !confLine.content.match(/<a.*label=Sponsoring.*([a-zA-Z]+-\d{2}-\d{4}|\d{2}-[a-zA-Z]+-\d{4}|\d{4}-[a-zA-Z]+-\d{2})&.*<\/a>/) ){
        hints.push("please use a conform Sponsoring date format (DD-MMM-YYYY, MMM-DD-YYYY, YYYY-MMM-DD) eg: 04-Jan-2023")
    }
    // Vérification de la présence des badges Sponsoring, Scholarship, Closed Captions
    if (/alt=["']Sponsoring["']/.test(confLine.content) && !/<a[^>]*><img[^>]*alt=["']Sponsoring["'][^>]*><\/a>/.test(confLine.content)) {
        hints.push("Sponsoring badge should be inside a <a> tag");
    }
    if (/alt=["']Scholarship["']/.test(confLine.content) && !/<a[^>]*><img[^>]*alt=["']Scholarship["'][^>]*><\/a>/.test(confLine.content)) {
        hints.push("Scholarship badge should be inside a <a> tag");
    }
    if (/alt=["']Closed Captions["']/.test(confLine.content) && !/<img[^>]*alt=["']Closed Captions["'][^>]*>/.test(confLine.content)) {
        hints.push("Closed Captions badge should be a <img> tag");
    }
    return {...confLine, hints:hints}
}

const mainContent = fs.readFileSync(MAIN_INPUT).toString()
const mainLines = findConfLines(mainContent,MAIN_INPUT)


//archives parsing
const archives = extractArchiveFiles(mainContent)
const confLines = mainLines.concat( archives.flatMap( archive => findConfLines(fs.readFileSync(archive).toString(), archive)) )

console.info(`found ${confLines.length} conferences`)

const openCfpLines = confLines.filter(confLine => hasOpenCfpBadge(confLine.content))
console.warn(`found ${openCfpLines.length} conferences with CFP "message=Open"`)
for (const openCfpLine of openCfpLines) {
    console.warn(`${openCfpLine.fileName}:${openCfpLine.lineNum} ${openCfpLine.content}`)
}

const findDuplicateEvents = () => {
    const eventsByIdentifier = new Map();

    for (const confLine of confLines) {
        const eventIdentifier = getEventIdentifier(confLine);
        if (!eventIdentifier) continue;

        const events = eventsByIdentifier.get(eventIdentifier) || [];
        events.push(confLine);
        eventsByIdentifier.set(eventIdentifier, events);
    }

    return [...eventsByIdentifier.entries()].filter(([, events]) => events.length > 1);
}

const duplicateEvents = findDuplicateEvents()
console.warn(`found ${duplicateEvents.length} duplicate events`)
for (const [eventIdentifier, events] of duplicateEvents) {
    console.warn(eventIdentifier)
    for (const event of events) {
        console.warn(`${event.fileName}:${event.lineNum} ${event.content}`)
    }
}

const warnings = confLines.filter(line => {
    if (line.content.match(confValidationPattern)) return false;
    if (line.content.match(confValidationPatternLoose)) return false;
    return true;
}).map(addHints)


console.warn(`found ${warnings.length} conferences with wrong format entries`)

if(warnings.length > 0) {
    console.warn(warnings)
}

if(warnings.length > 1) {
    process.exit(1)
}

const duplicateValidator = () => {
    if (!fs.existsSync(TAGS_CSV)) {
        return console.error("CSV not found");
    }

    const readFile = fs.readFileSync(TAGS_CSV, "utf-8").split("\n").map((line) => line.trim()).filter((line) => line.length > 0 && !line.startsWith("#"))
    const uniqueTags = new Set();
    const duplicates = []

    for (const tag of readFile) {
        if (uniqueTags.has(tag)) {
            duplicates.push(tag);
        }

        uniqueTags.add(tag);
    }
    
    if(duplicates.length > 0) {
        return duplicates
    }
    return []
};

const duplicateTags = duplicateValidator()
console.warn(`found ${duplicateTags?.length || 0} duplicate tags`)

if(duplicateTags?.length > 0) {
    for(const tag of duplicateTags) {
        console.warn(`${tag}`)
    }
    process.exit(1)
}

const duplicateMetadataValidator = () => {
    if (!fs.existsSync(METADATA_CSV)) {
        return console.error("Metadata CSV not found");
    }

    const eventIds = fs.readFileSync(METADATA_CSV, "utf-8")
        .split("\n")
        .slice(1)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"))
        .map((line) => line.split(",")[0]);
    const uniqueEventIds = new Set();
    const duplicates = [];

    for (const eventId of eventIds) {
        if (uniqueEventIds.has(eventId)) {
            duplicates.push(eventId);
        }

        uniqueEventIds.add(eventId);
    }

    return duplicates;
};

const duplicateMetadata = duplicateMetadataValidator()
console.warn(`found ${duplicateMetadata?.length || 0} duplicate metadata`)

if(duplicateMetadata?.length > 0) {
    for(const eventId of duplicateMetadata) {
        console.warn(`${eventId}`)
    }
    process.exit(1)
}