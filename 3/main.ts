//Going the naive Route for parsing, using the regex
const correctlyFormedMulRegex = /mul\((\d+),(\d+)\)/gm;


import fs from "node:fs";

fs.readFile("./3/input.txt", (err, data)=> {
    if(err){
        console.error(err);
        return;
    }

    const fileString = data.toString();
    //Find all numbers, filter out numbers that violate our constraint (only numbers with 1 to 3 digits are allowed)
    const properExpressions = [...fileString.matchAll(correctlyFormedMulRegex)].map(expr => [Number(expr[1]),Number(expr[2])]).filter(factors => factors[0]<1000&&factors[1]<1000)
    const sumOfAllMuls = properExpressions.map(factors => factors[0]*factors[1]).reduce((a,b)=>a+b, 0);

    console.log(`The sum of all valid mul(X,Y) statements is ${sumOfAllMuls}`);
});
