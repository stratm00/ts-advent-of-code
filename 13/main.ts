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

function vec2n_sub(a: Vec2n, b: Vec2n) {
    return { x: a.x - b.x, y: a.y - b.y };
}

function vec2n_scalar_mul(a: Vec2n, n: number) {
    return { x: a.x * n, y: a.y * n };
}

function vec2n_is_scalar_multiple(a: Vec2n, b: Vec2n) {
    for (let i = 1; i <= Math.ceil(a.x / b.x); i++) {
        const remainder = vec2n_sub(a, vec2n_scalar_mul(b, i));
        if (remainder.x == 0 && remainder.y == 0) return true;
    }
    return false;
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
            prize: prizes[i],
        });
    }

    console.log(capturedProblems);

    const solutions: SolutionStatement[] = getSolutions(capturedProblems, {
        a_presses: 100,
        b_presses: 100,
    });

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
    constraint: Constraint = {
        a_presses: Number.MAX_SAFE_INTEGER,
        b_presses: Number.MAX_SAFE_INTEGER,
    },
): SolutionStatement[] {
    const solutions: SolutionStatement[] = [];

    //respecting our constraint, let's get a Solution for each problem in order
    for (const problem of problems) {
        solutions.push(getSolution(problem, constraint));
    }

    return solutions;
}

function getSolution(
    problem: ProblemStatement,
    constraint: Constraint,
): SolutionStatement {
    let [solution_a, solution_b] = [0, 0];
    const ERROR_VAL = { a_presses: -1, b_presses: -1 };
    // linear eq system
    // I (solution_a * problem.a_movement).x + (solution_b * problem.b_movement).x = problem.prize.x
    //II (solution_a * problem.a_movement).y + (solution_b * problem.b_movement).y = problem.prize.y
    let currentPos = vec2n_add(
        vec2n_scalar_mul(problem.a_movement, solution_a),
        vec2n_scalar_mul(problem.b_movement, solution_b),
    );
    let distFromPrize = vec2n_sub(problem.prize, currentPos);

    while (!(distFromPrize.x == 0 && distFromPrize.y == 0)) {
        //if distFromPrize is a scalar multiple of B: B++
        const distanceBCoefficient = vec2n_is_scalar_multiple(
            distFromPrize,
            problem.b_movement,
        );

        if (
            solution_a > constraint.a_presses ||
            solution_b > constraint.b_presses
        ) {
            return ERROR_VAL;
        }
        //If we overshot (it doesnt work), quit
        if (distFromPrize.x < 0 || distFromPrize.y < 0) {
            return ERROR_VAL;
        } else if (distanceBCoefficient) {
            solution_b++;
        } else {
            solution_a++;
        }

        //if not out of constraint, press A until the rest is a scalar multiple of B

        //set B to that scalar coefficient
        //if remainder is not a scalar multiple of B or A: return fail

        currentPos = vec2n_add(
            vec2n_scalar_mul(problem.a_movement, solution_a),
            vec2n_scalar_mul(problem.b_movement, solution_b),
        );
        distFromPrize = vec2n_sub(problem.prize, currentPos);
    }
    //solve

    //find the lowest costed solution within constraints
    //since costs are so linear, we can stop the selection and just greedily build the lowest solution
    return { a_presses: solution_a, b_presses: solution_b };
}

function costSolution(solution: SolutionStatement) {
    return solution.a_presses * BUTTON_COSTS.a +
        solution.b_presses * BUTTON_COSTS.b;
}
