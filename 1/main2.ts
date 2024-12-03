
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
    
    let similarityScore = 0;
    //naive solution, we might prefer a lookup table or Map if this is a commonly recurring computation
    const _occurencesInRight = (n: number) => right.filter(x=>x==n).length;
    //Similarity Score for Number n in Left

    for(const leftNumber of left){
        similarityScore += leftNumber*_occurencesInRight(leftNumber);
    }

    return similarityScore;
}