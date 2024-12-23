import fs from "node:fs";
const ITERATIONS = 2000;
fs.readFile("./22/input.txt", (err, data) => {

    if(err){
        console.error(err);
        return;
    }
    
    const startingBuyerNums = data.toString().trim().split("\r\n").map(Number);
    let currentBuyerNums = startingBuyerNums.slice();
    console.log("Starting buyer nums", startingBuyerNums);

    for(let i = 0;i<ITERATIONS;i++){
        currentBuyerNums = currentBuyerNums.map(secret => {
            /*
    Calculate the result of multiplying the secret number by 64. Then, mix this result into the secret number. Finally, prune the secret number.
    Calculate the result of dividing the secret number by 32. Round the result down to the nearest integer. Then, mix this result into the secret number. Finally, prune the secret number.
    Calculate the result of multiplying the secret number by 2048. Then, mix this result into the secret number. Finally, prune the secret number.
            */
           let sn = secret << 6;
           secret ^= sn;
           secret &= (2 << 23) - 1;

           sn = secret >> 5;
           secret ^= sn;
           secret &= (2 << 23) - 1;

           sn = secret << 11;
           secret ^= sn;
           secret &= (2 << 23) - 1;
            return secret;
        });
    }
    console.log("current buyer nums after",ITERATIONS, "iterations:",currentBuyerNums);
    console.log("sum of current buyer nums", currentBuyerNums.reduce((a,b)=>a+b,0))
});