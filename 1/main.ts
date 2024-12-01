
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
    const result = computeSumOfListDiffs(left, right);
    console.log(`Das Ergebnis ist ${result}`);
});

function computeSumOfListDiffs(left: number[], right: number[]){
    let sortAsc = (a:number,b:number) => b-a;
    //Sort ascending (or descending, it matters only that the arrays are numerically sorted)
    left.sort(sortAsc);
    right.sort(sortAsc)
    //add up distances between left[n] and right[n]
    let sumOfDifferences = 0;
    
    for (let index in left){
        sumOfDifferences += Math.abs((left[index]-right[index]));
    }


    return sumOfDifferences;
}