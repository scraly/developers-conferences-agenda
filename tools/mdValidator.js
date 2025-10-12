const fs=require('fs');

const ROOT= "../"
const MAIN_INPUT = ROOT+"README.md"
const TAGS_CSV = ROOT + "TAGS.csv";
const confIdentifierPattern = /^ *\* ?(\[.*\]\s?)?[0-9?x\/-]+/

// Structure générale (date, nom, lien, lieu)
const confValidationPattern = /^\*( \[(?<status>[\w ]+)\])? (?<date>\d{1,2}(\/\d{1,2})?(-\d{1,2})?(\/\d{1,2})?)\s?: \[(?<name>[^\]]*)\]\((?<link>https?:\S*)\)( - (?<place>[^<\n]*))?/;

// Permettre aussi les dates sans année (ex : 6-7: ...)
const confValidationPatternLoose = /^\*( \[(?<status>[\w ]+)\])? (?<date>\d{1,2}(-\d{1,2})?)\s?: \[(?<name>[^\]]*)\]\((?<link>https?:\S*)\)( - (?<place>[^<\n]*))?/;

const extractArchiveFiles = markdown => //eg: " * [2017](archives/2017.md)"
    [...markdown.matchAll(/^\s*\*\s*\[.*\]\(archives\/.*\.md\)\s*$/gm)].map( match => match[0])
    .map( archiveLine => ROOT + archiveLine.trim().replaceAll(/^.*(archives\/.*\.md).*$/g,'$1'));

const findConfLines = (fileContent, fileName) => 
    fileContent.toString().split(/\n/)
    .map((lineContent,index) => ({
      content: lineContent,
      lineNum:index+1,
      fileName:fileName
    }))
    .filter(line => !!line.content.match(confIdentifierPattern))

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
    if(confLine.content.includes("img.shields.io") && !(
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
    if(confLine.content.includes("img.shields.io") && !confLine.content.match(/>\s*$/) ){
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