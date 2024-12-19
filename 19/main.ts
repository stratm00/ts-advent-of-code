import fs from "node:fs";
const CHAR_CAPTURE_REGEX = /(\w+)/gm;

fs.readFile("./19/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const dataString = data.toString();
    const delimiterIndex = dataString.indexOf("\r\n\r\n")
    
    const patternsAvailable:string[] = [];
    const goals:string[] = [];

    [...dataString.matchAll(CHAR_CAPTURE_REGEX)].forEach((regexpexecarr)=>{
        if(regexpexecarr.index<delimiterIndex){
            patternsAvailable.push(regexpexecarr[1]);
        }else {
            goals.push(regexpexecarr[1]);
        }
    });
    patternsAvailable.sort((s1,s2)=>s2.length-s1.length);
    goals.sort((s1,s2)=>s1.length-s2.length);
    console.log("goals",goals);

    //perhaps make a map or list of proven patterns.
    const provenSet = new Set<string>();
    patternsAvailable.forEach(v=>provenSet.add(v));

    console.log("provens", provenSet);

    const creatablePatterns = goals.filter(g=>patternLayable(g, provenSet));
    console.log("provens", provenSet);
    console.log("creatable patterns:", creatablePatterns);
    console.log("We can make", creatablePatterns.length, "patterns.");
});

function patternLayable(goalPattern:string, provenSet:Set<string>):boolean{
    //ending conditions
    if(goalPattern.length==0)return true;
    if(provenSet.has(goalPattern))return true;

    for(const pattern of provenSet){
        if(goalPattern.startsWith(pattern) && patternLayable(goalPattern.substring(pattern.length), provenSet)){
            provenSet.add(goalPattern);
            console.log("proven set extended");
            return true;
        }
    }
    return false;
}