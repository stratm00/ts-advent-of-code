import fs from 'node:fs';

const EMPTY_SPACE_IDENTIFIER = -1
type InstructionData = number[];
type Disk = number[];
type NumberFragment = {number: number, index: number, width: number};

fs.readFile("./9/input_test.txt", (err, data)=> {

    if(err){
        console.error(err);
        return;
    }

    const readInstructions:InstructionData = data.toString().split("").map(Number);
    
    const diskBuilt:Disk = constructDisk(readInstructions);
    
    const diskCompacted = compactDisk(diskBuilt);

    const checksum = getDiskChecksum(diskCompacted);
    
    console.log(`PT2 Disk CHKSUM=${checksum}`)
    
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

function compactDisk(d: Disk): Disk{
    let disk = d.slice();


    //identify all numbers that have to be considered
    const allNumbers: number[] = getAllDiskNumbers(disk);
    console.log(allNumbers)

    
    //keep a list of considered numbers
    let consideredNumbers: number[] = [];
    // printDisk(disk);


    while(consideredNumbers.length != allNumbers.length){
        //map all empty spaces
        let consideredEmptySpaces: NumberFragment[] = [];
        for(let i = 0; i<disk.length;i++){
            // conditions for this: nf.index>=1<nf.index+nf.width
            if(disk[i]==EMPTY_SPACE_IDENTIFIER && !consideredEmptySpaces.find((nf)=>nf.index<=i&&nf.index+nf.width>i)){
                let _width = 1;
                while(disk[i+_width]==disk[i])_width++;
                consideredEmptySpaces.push({number: -1, index:i, width: _width});
            }
        }

        //get latest number block in the back
        let lastNumber = 0;
        let numberWidth = 0;   
        let lastNumberIndex = 0;

        for(let i = disk.length-1;i>=0;i--){
            if(disk[i]!=EMPTY_SPACE_IDENTIFIER && !consideredNumbers.includes(disk[i])){
                //we have a hit
                lastNumber = disk[i];
                numberWidth = 1;
                lastNumberIndex = i;
                break;
            }
        }
        while(disk[lastNumberIndex-numberWidth]==lastNumber)numberWidth++;
        //correcting for the width, we want the starting index
        lastNumberIndex = lastNumberIndex - (numberWidth - 1);
        
        
        //see if it can be moved ahead
        let emptySpaceFit = consideredEmptySpaces.find((nf) => nf.width>=numberWidth && nf.index<lastNumberIndex);
        if(emptySpaceFit !== undefined){
            
            for(let offset=0;offset<numberWidth;offset++){
                disk[lastNumberIndex+offset]=EMPTY_SPACE_IDENTIFIER;
                disk[emptySpaceFit.index+offset]=lastNumber;
            }

        } 



        console.log(`${consideredNumbers.length} / ${allNumbers.length}`)
        //add number to consideredNumbers
        consideredNumbers.push(lastNumber);
    }
    // printDisk(disk);
    return disk;
}

function getAllDiskNumbers(d: Disk){
    let baseList: number[] = [];
    d.forEach((n)=>{
        if(!(n==EMPTY_SPACE_IDENTIFIER||baseList.includes(n)))baseList.push(n);
    });
    return baseList;
}

function getDiskChecksum(d: Disk):number{
    return d.map((value:number, index:number)=> {return value!=EMPTY_SPACE_IDENTIFIER ? value * index:0}).reduce((a,b)=>a+b,0);
}

function printDisk(d: Disk):void {
    console.log(d.map(n=>n==EMPTY_SPACE_IDENTIFIER?".":n).join(""))
}