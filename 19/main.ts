import fs from "node:fs";
const CHAR_CAPTURE_REGEX = /(\w+)/gm;

fs.readFile("./19/input_test.txt", (err, data) => {
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

    
    const provenSet = new Set<string>();
    const provenMap = new Map<string, string[]>();
    patternsAvailable.forEach(v=>{
        extendMap(v, provenMap);
        provenSet.add(v)
    });
    

    console.log("provens", provenMap);

    // const creatablePatterns = goals.filter(g=>patternLayable(g, provenSet));
    const creatablePatterns = goals.filter(g=>patternLayableMap(g, provenMap));
    console.log("provens", provenMap);
    console.log("creatable patterns:", creatablePatterns);
    console.log("We can make", creatablePatterns.length, "patterns.");
});

function patternLayable(goalPattern:string, provenSet:Set<string>):boolean{
    //ending conditions
    if(goalPattern.length==0||goalPattern==""||provenSet.has(goalPattern))return true;

    for(const pattern of provenSet){
        console.log(pattern);
        if(goalPattern.startsWith(pattern) && patternLayable(goalPattern.substring(pattern.length), provenSet)){
            provenSet.add(goalPattern);
            console.log("proven set extended");
            return true;
        }
    }
    return false;
}

function patternLayableMap(goalPattern:string, provenMap:Map<string, string[]>):boolean{
    //ending conditions
    if(goalPattern.length==0||goalPattern==""||provenMap.get(goalPattern[0])?.includes(goalPattern))return true;
    
    const sameInitial = provenMap.get(goalPattern[0]);
    if(sameInitial==undefined)return false;
    for(const pattern of sameInitial){
        if(goalPattern.startsWith(pattern) && patternLayableMap(goalPattern.substring(pattern.length), provenMap)){
            extendMap(goalPattern, provenMap);
            console.log("proven map extended");
            return true;
        }
    }
    return false;
}
function extendMap(input:string, map:Map<string, string[]>){
    const preexisting = map.get(input[0]);
    if(preexisting != undefined){
        preexisting.push(input);   
        preexisting.sort((s1, s2)=>s2.length-s1.length)
    }else map.set(input[0], [input]);
}