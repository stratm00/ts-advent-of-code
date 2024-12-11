import fs from 'node:fs';
const ITERATIONS = 75;

fs.readFile("./11/input.txt", (err, data)=> {
   
    if(err){
        console.error(err);
        return;
    }
    const inputListOfNumbers: number[] = data.toString().split(" ").map(Number);
    
    let numbersMap: Map<number, number> = new Map<number, number>();
    inputListOfNumbers.forEach((n)=>incrementInMap(numbersMap, n));   
        
    for(let i = 0;i<ITERATIONS;i++){
        numbersMap = applyRulesToMap(numbersMap);
    }

    let totalSumOfValues = 0;
    for(const value of numbersMap.values()){
        totalSumOfValues += value;
    }

    console.log(`Total amount of stones after ${ITERATIONS} iterations: ${totalSumOfValues}`)
});

function incrementInMap(map: Map<number, number>, key:number, by:number =1){
    const previousValue = map.get(key) ?? 0;
    map.set(key, previousValue+by);
}

function applyRulesToMap(nums: Map<number, number>):Map<number, number> {
    const newMap = new Map<number, number>();
    
    nums.forEach((occurences, number) => {
        
        if(number == 0){
            
            incrementInMap(newMap, 1, occurences);
        
        }else if(number.toString().length % 2 == 0){

            const keyString = number.toString();
            const newNums = [keyString.substring(0, keyString.length/2), keyString.substring(keyString.length/2)].map(Number);

            incrementInMap(newMap, newNums[0], occurences);
            incrementInMap(newMap, newNums[1], occurences);

        }else incrementInMap(newMap, number * 2024, occurences)

    });

    return newMap;
}
