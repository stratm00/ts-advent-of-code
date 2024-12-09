import fs from 'node:fs';

type InstructionData = number[];
type Disk = number[];
const EMPTY_SPACE_IDENTIFIER = -1

fs.readFile("./9/input.txt", (err, data)=> {

    if(err){
        console.error(err);
        return;
    }

    const readInstructions:InstructionData = data.toString().split("").map(Number);
    console.log(readInstructions);
    
    let diskBuilt:Disk = constructDisk(readInstructions);
    
    diskBuilt = compactDisk(diskBuilt);

    const checksum = getDiskChecksum(diskBuilt);
    
    console.log(`Disk CHKSUM=${checksum}`)
    
});

function constructDisk(readInstructions: InstructionData): Disk {
    let disk: Disk = [];
    let switchEmpty = false;
    let currentID = 0;
    for(let instruction of readInstructions){
        
        for(let i =0;i<instruction;i++){
            disk.push(
                switchEmpty?EMPTY_SPACE_IDENTIFIER:currentID
            );
        }

        if(switchEmpty){
            currentID++
        }
        switchEmpty = !switchEmpty;
    }
    return disk;
}

function diskIsCompacted(d: Disk): boolean{
    const firstEmptyIndex = d.findIndex((n)=>n==EMPTY_SPACE_IDENTIFIER);
    if(firstEmptyIndex==-1)return true;
    
    for(let idx = firstEmptyIndex;idx<d.length;idx++){
        if(d[idx]!=EMPTY_SPACE_IDENTIFIER)return false;
    }
    
    return true;
}

function compactDisk(d: Disk):Disk {

    d = d.slice();
    
    while(!diskIsCompacted(d)){
        //Move last non-empty number to first index of empty number
        const firstEmptyIndex = d.findIndex((n)=>n==EMPTY_SPACE_IDENTIFIER);
        const lastNumberIndex = findLastIndexOfNumber(d);
        
        d[firstEmptyIndex] = d[lastNumberIndex];
        d[lastNumberIndex] = EMPTY_SPACE_IDENTIFIER;
    
    }

    
    return d;
}

function getDiskChecksum(d: Disk):number{
    let res = 0;
    for(let idx = 0;idx<d.length;idx++){
        if(d[idx]!=EMPTY_SPACE_IDENTIFIER)res += (d[idx]*idx);
    }
    return res;
}

function findLastIndexOfNumber(d: Disk):number {
        
    for(let idx = d.length-1;idx>=0;idx--){
        if(d[idx]!=EMPTY_SPACE_IDENTIFIER)return idx;
    }
    return -1;
    
}

function printDisk(d: Disk):void {
    console.log(d.map(n=>n==EMPTY_SPACE_IDENTIFIER?".":n).join(""))
}