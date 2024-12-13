import fs from "node:fs";
const PRIZE_CAPTURE_REGEX = /Prize: X=(\d+), Y=(\d+)/gm;
const A_CAPTURE_REGEX = /A: X\+(\d+), Y\+(\d+)/gm;
const B_CAPTURE_REGEX = /B: X\+(\d+), Y\+(\d+)/gm;

const BUTTON_COSTS = {
    a: 3,
    b: 1,
};

type Constraint = { a_presses: number; b_presses: number };
type Vec2n = { x: number; y: number };
function vec2n_add(a: Vec2n, b: Vec2n) {
    return { x: a.x + b.x, y: a.y + b.y };
}

type ProblemStatement = { prize: Vec2n; a_movement: Vec2n; b_movement: Vec2n };
type SolutionStatement = { a_presses: number; b_presses: number };

fs.readFile("./13/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const _captureRegexVec2n = (regexArr: RegExpExecArray): Vec2n => {
        return { x: Number(regexArr[1]), y: Number(regexArr[2]) };
    };
    const _adjustPrizePos = (prize: Vec2n): Vec2n => {
        const OFFSET = 10000000000000;
        return vec2n_add(prize, { x: OFFSET, y: OFFSET });
    };

    const dataString = data.toString();
    const prizes = [...dataString.matchAll(PRIZE_CAPTURE_REGEX)].map(
        _captureRegexVec2n,
    );
    const a_movements = [...dataString.matchAll(A_CAPTURE_REGEX)].map(
        _captureRegexVec2n,
    );
    const b_movements = [...dataString.matchAll(B_CAPTURE_REGEX)].map(
        _captureRegexVec2n,
    );
    const capturedProblems: ProblemStatement[] = [];

    for (let i = 0; i < prizes.length; i++) {
        capturedProblems.push({
            a_movement: a_movements[i],
            b_movement: b_movements[i],
            prize: _adjustPrizePos(prizes[i]),
        });
    }

    const solutions: SolutionStatement[] = getSolutions(capturedProblems);
    console.log(solutions.filter((sol) => sol.a_presses != -1));

    const totalCost = solutions.filter((sol) => sol.a_presses != -1).map(
        costSolution,
    ).reduce((a, b) => a + b, 0);
    console.log(
        "total cost for all achievable wins under constraint: ",
        totalCost,
    );
});

function getSolutions(
    problems: ProblemStatement[],
): SolutionStatement[] {
    const solutions: SolutionStatement[] = [];

    //respecting our constraint, let's get a Solution for each problem in order
    for (const problem of problems) {
        solutions.push(getSolution(problem));
    }

    return solutions;
}

function getSolution(problem: ProblemStatement): SolutionStatement {
    // linear eq system
    // I (solution_a * problem.a_movement).x + (solution_b * problem.b_movement).x = problem.prize.x
    //II (solution_a * problem.a_movement).y + (solution_b * problem.b_movement).y = problem.prize.y
    //usign cramer's rule to solve this: (referencing https://www.reddit.com/r/adventofcode/comments/1hd7irq)
    const common_divisor = problem.a_movement.x * problem.b_movement.y -
        problem.a_movement.y * problem.b_movement.x;
    const a_presses = ((problem.prize.x * problem.b_movement.y) -
        (problem.prize.y * problem.b_movement.x)) / common_divisor;
    const b_presses = (problem.a_movement.x * problem.prize.y -
        problem.a_movement.y * problem.prize.x) / common_divisor;

    if (Number.isInteger(a_presses) && Number.isInteger(b_presses)) {
        return { a_presses: a_presses, b_presses: b_presses };
    } else return { a_presses: -1, b_presses: -1 };
}

function costSolution(solution: SolutionStatement) {
    return solution.a_presses * BUTTON_COSTS.a +
        solution.b_presses * BUTTON_COSTS.b;
}
