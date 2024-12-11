import fs from "node:fs";
const COMPUTATION_LINE_REGEX = /(\d+): (.+)/gm;
type Computation = { result: number; input: number[] };

fs.readFile("./7/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const matches = [...data.toString().matchAll(COMPUTATION_LINE_REGEX)];

    const computationsInAssignment: Computation[] = matches
        .map((match) => {
            if (!match) {
                console.error("Regex parsing failed");
                return { result: -1, input: [] };
            }
            return {
                result: Number(match[1]),
                input: match[2].split(" ").map(Number),
            };
        });

    const correctComputation = computationsInAssignment.filter((c) =>
        computationPossible(c)
    );

    const totalCalibrationResult = correctComputation.reduce(
        (n, c) => n + c.result,
        0,
    );
    console.log(`The total calibration result is: ${totalCalibrationResult}`);
});

function computationPossible(c: Computation): boolean {
    //We can recurse this!
    if (c.input.length == 1) {
        return c.result == c.input[c.input.length - 1];
    }

    const new_input = c.input.slice();
    const last_element = new_input.pop();

    if (last_element == undefined) {
        console.error("ALGO ERROR");
        return false;
    }

    const multiply_ver: Computation = {
        result: c.result / last_element,
        input: new_input,
    };

    const add_ver: Computation = {
        result: c.result - last_element,
        input: new_input,
    };

    return computationPossible(add_ver) || computationPossible(multiply_ver);
}
