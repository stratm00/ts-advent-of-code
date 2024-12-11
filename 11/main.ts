import fs from 'node:fs';
const ITERATIONS = 25;

fs.readFile("./11/input.txt", (err, data)=> {
   
    if(err){
        console.error(err);
        return;
    }
    const inputListOfNumbers: number[] = data.toString().split(" ").map(Number);
    

    let latestIteration = inputListOfNumbers;
    for(let i = 0;i<ITERATIONS; i++){
        latestIteration = latestIteration.map(applyRules).reduce(arrUnion, []);
    }

    console.log(`Total amount of stones after 25 iterations: ${latestIteration.length}`);
});

function applyRules(num: number): number[] {
    if (num==0) return [1];
    if (num.toString().length % 2 == 0){
        const numString = num.toString();
        return [numString.substring(0, numString.length/2), numString.substring(numString.length/2)].map(Number);
    }
    return [num * 2024];
}
function arrUnion<T> (a:T[], b:T[]):T[] {
    
    for(const item of b)a.push(item);
    return a;
}