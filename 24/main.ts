import fs from "node:fs";

const DECLARATION_REGEX = /(\w\d+): (\d)/gm;
const OPERATION_REGEX =
    /(?<arg1>\S+) (?<op>OR|XOR|AND) (?<arg2>\S+) -> (?<res>\S+)/gm;

type Declaration = { register: string; val: 1 | 0 };
type Operation = {
    arg1: string;
    arg2: string;
    operation: "OR" | "XOR" | "AND";
    resultDestination: string;
};

fs.readFile("./24/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const dataString = data.toString();
    const [declarationsString, operationsString] = dataString.split("\r\n\r\n");

    const declarations: Declaration[] = [
        ...declarationsString.matchAll(DECLARATION_REGEX),
    ].map((regexp) => {
        if (![1, 0].includes(Number(regexp[2]))) {
            console.error("FAULTY DECLARATION");
            return { register: "error", val: 1 };
        }
        return { register: regexp[1], val: Number(regexp[2]) as 1 | 0 };
    });

    const operations: Operation[] = [
        ...operationsString.matchAll(OPERATION_REGEX),
    ].map((regexp) => {
        if (!["OR", "XOR", "AND"].includes(regexp.groups?.op ?? "")) {
            console.error("FAULTY OPERAND");
            return {
                arg1: "",
                operation: "XOR",
                arg2: "",
                resultDestination: "",
            };
        }
        return {
            arg1: regexp.groups?.arg1 ?? "",
            operation: (regexp.groups?.op ?? "OR") as "OR" | "XOR" | "AND",
            arg2: regexp.groups?.arg2 ?? "",
            resultDestination: regexp.groups?.res ?? "",
        };
    });

    //parse until all operations with results starting in z are done
    const zOperations = operations.filter((op) =>
        op.resultDestination.startsWith("z")
    );
    
    const dependencySet: Set<string> = new Set<string>();
    zOperations.forEach((zop) => {
        dependencySet.add(zop.arg1);
        dependencySet.add(zop.arg2);
        dependencySet.add(zop.resultDestination);
    });
    
    
    
    let oldSize = dependencySet.size;
    //just a starting value
    let newSize = dependencySet.size + 1;
    
    let dependencyCalcs = operations.filter((op) =>
        dependencySet.has(op.resultDestination)
    );
    
    //walk the dependency graoh as long as we discover new things
    while (newSize > oldSize) {
        oldSize = dependencySet.size;

        dependencyCalcs.forEach((op) => {
            dependencySet.add(op.arg1);
            dependencySet.add(op.arg2);
        });

        dependencyCalcs = operations.filter((op) =>
            dependencySet.has(op.resultDestination)
        );

        newSize = dependencySet.size;
        
    }
    
    
    //Enact dependency calcs
    let newCalculations = true;
    while(newCalculations){
        newCalculations = false;
        //Find doable computation ,keep doing them
        //achievable and usable ^= arg1 and arg2 are defined, result is undefined
        const achievableCalcs = dependencyCalcs.filter(c => declarations.find(d=>d.register == c.arg1) && declarations.find(d=>d.register == c.arg2) && !declarations.find(d=>d.register == c.resultDestination));
        for(const calculation of achievableCalcs){
            const arg1Val = declarations.find(d=>d.register==calculation.arg1)?.val ?? -1;
            const arg2Val = declarations.find(d=>d.register==calculation.arg2)?.val ?? -1;

            let result = 0;
            switch(calculation.operation){
                case "OR":
                    result = arg1Val || arg2Val;
                    break;
                case "AND":
                    result = arg1Val && arg2Val;
                    break;
                case "XOR":
                    result = arg1Val ^ arg2Val;
                    break;
            }
            declarations.push({register: calculation.resultDestination, val: result as 0|1})
            //Calculate, then push a declaration into the declarations
            newCalculations = true;
        }
    }
    
    const zVals = declarations.filter(d=>d.register.startsWith("z")).map(d=>[d.register, d.val]).toSorted();
    
    const zStr = zVals.map(arr=>arr[1]).reverse().join("");
    console.log("Hidden message in binary:", zStr);
});
