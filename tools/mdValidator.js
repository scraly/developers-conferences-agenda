const fs=require('fs');

const ROOT= "../"
const MAIN_INPUT = ROOT+"README.md"
const confIdentifierPattern = /^ *\* ?(\[.*\]\s?)?[0-9?x\/-]+/

//complex example : "* [Virtualized] 31/05-04/06: [event : stuff](http://link.io) - chambéry (France) <a ... ><img ...label=CFP.../></a> <img ...Closed%20Captions... />" 
const confValidationPattern = /^\*( \[(?<status>[\w ]+)\])? (?<date>\d{1,2}(\/\d{1,2})?(-\d{1,2})?(\/\d{1,2})?)\s?: \[(?<name>[^\]]*)\]\((?<link>https?:\S*)\)( - (?<place>[^<\n]*))?(?<cfp><a.*label=CFP.*<\/a>)?\s*(?<cc><img.*Closed%20Captions.*\/>)?\s*$/

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
        hints.push("long dash '—' fond. did you mean '-' ?")
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
        confLine.content.includes("label=CFP") || confLine.content.includes("Closed%20Captions") )){
        hints.push("shields are for 'CFP' or 'Closed Content' with provided format only")
    }
    if(confLine.content.includes("label=CFP") && 
        confLine.content.includes("Closed%20Captions") &&
        confLine.content.indexOf("Closed%20Captions") < confLine.content.indexOf("label=CFP")){
        hints.push("please order your shields : CFP, ClosedContent")
    }
    if(confLine.content.includes("img.shields.io") && !confLine.content.match(/>\s*$/) ){
        hints.push("please place your shields at the end of the line")
    }

    return {...confLine, hints:hints}
}

const mainContent = fs.readFileSync(MAIN_INPUT).toString()
const mainLines = findConfLines(mainContent,MAIN_INPUT)


//archives parsing
const archives = extractArchiveFiles(mainContent)
const confLines = mainLines.concat( archives.flatMap( archive => findConfLines(fs.readFileSync(archive).toString(), archive)) )

console.info(`found ${confLines.length} conferences`)

const warnings = confLines.filter(line => !line.content.match(confValidationPattern))
                          .map(addHints)


console.warn(`${warnings.length} conferences with wrong format entries found`)
console.warn(warnings)