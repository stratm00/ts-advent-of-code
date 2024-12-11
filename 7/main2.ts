import fs from "node:fs";
const COMPUTATION_LINE_REGEX = /(\d+): (.+)/gm;
type Computation = { result: number; input: number[] };

fs.readFile("./7/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const computationsInAssignment: Computation[] = [
        ...data.toString().matchAll(COMPUTATION_LINE_REGEX),
    ]
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
    console.log(
        `The total calibration result (respecting the concatenation operator) is: ${totalCalibrationResult}`,
    );
});

function computationPossible(c: Computation): boolean {
    if (c.input.length == 1) {
        return c.result == c.input[c.input.length - 1];
    }

    const full_input_list = c.input.slice();

    const last_element = full_input_list.pop();
    if (last_element == undefined) {
        console.error("ALGO ERROR");
        return false;
    }
    const new_input = full_input_list;

    const multiply_ver: Computation = {
        result: c.result / last_element,
        input: new_input,
    };

    const add_ver: Computation = {
        result: c.result - last_element,
        input: new_input,
    };

    const last_element_digits = last_element.toString().length;

    //previous: Math.floor(c.result/(10 ** last_element_digits))
    //This now works. The Math.floor version gave us inaccuracies
    const new_result = (c.result - last_element) / (10 ** last_element_digits);

    const concat_ver: Computation = {
        result: new_result,
        input: new_input,
    };

    return computationPossible(add_ver) || computationPossible(multiply_ver) ||
        computationPossible(concat_ver);
}
