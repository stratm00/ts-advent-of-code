//Going the naive Route for parsing, using the regex
const correctlyFormedRegex = /(do)\(\)|(don't)\(\)|(mul)\((\d+),(\d+)\)/gm;


import fs from "node:fs";

fs.readFile("./3/input.txt", (err, data)=> {
    if(err){
        console.error(err);
        return;
    }

    const fileString = data.toString();
    const matchedExpressions = [...fileString.matchAll(correctlyFormedRegex)]
    
    
    //flag defaults to open
    let doFlag = true;
    let sumOfAllEnabledMuls = 0;
    for(const expr of matchedExpressions){
        //expr[0] ^= detected string, the following numerical values are the detected groups
        if(expr[1]=="do"){
            //do expression
            doFlag=true;
        }else if (expr[2]=="don't"){
            //dont expression
            doFlag=false;
            //mul expression, triggered only if doFlag is active
        }else if(doFlag){
            const fac1 = Number(expr[4]);
            const fac2 = Number(expr[5]);
            //Don't forget the constraint!
            if(fac1<1000 && fac2<1000) sumOfAllEnabledMuls += fac1*fac2;
            
        }
        
    }

    
    console.log(`The sum of all valid mul(X,Y) statements is ${sumOfAllEnabledMuls}`);
});
