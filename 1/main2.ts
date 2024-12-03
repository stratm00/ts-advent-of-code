
import fs from "node:fs";

fs.readFile("./1/input.txt", (err, data)=> {
    if(err){
        console.error(err);
        return;
    }

    let left: number[] = [];
    let right: number[] = [];
    const contents = data.toString();
    contents.split("\n").forEach((line)=>{
        const splitLine = line.split("   ");
        left.push(Number(splitLine[0]));
        right.push(Number(splitLine[1]));
    });
    const result = computeListSimilarityScore(left, right);
    console.log(`Der Ähnlichkeitswert zwischen links und rechts ist ${result}`);
});

function computeListSimilarityScore(left: number[], right: number[]){
    
    //naive solution, we might prefer a lookup table or Map if this is a commonly recurring computation
    const _occurencesInRight = (n: number) => right.filter(x=>x==n).length;
    
    return left.map(
        leftNumber=> leftNumber * _occurencesInRight(leftNumber)
    ).reduce((a,b)=>a+b
            ,0);
}