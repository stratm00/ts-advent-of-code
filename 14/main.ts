import fs from "node:fs";
const IS_TESTING = false;
const GUARD_CAPTURE_REGEX =
    /p=(?<px>-?\d+),(?<py>-?\d+) v=(?<vx>-?\d+),(?<vy>-?\d+)/gm;
type Vec2n = { x: number; y: number };
type GuardData = { position: Vec2n; velocity: Vec2n };

function captureGuardData(
    groups: { [key: string]: string } | undefined,
): GuardData {
    return {
        position: { x: Number(groups?.px), y: Number(groups?.py) },
        velocity: { x: Number(groups?.vx), y: Number(groups?.vy) },
    };
}
const load_file = IS_TESTING ? "./14/input_test.txt" : "./14/input.txt";
const SPACE_DIMENSIONS = IS_TESTING ? [11, 7] : [101, 103];
const NUM_STEPS = 100;

fs.readFile(load_file, (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    let guards = [...data.toString().matchAll(GUARD_CAPTURE_REGEX)].map((arr) =>
        captureGuardData(arr.groups)
    );
    console.log(guards);
    //Simulate x steps
    for (let x = 0; x < NUM_STEPS; x++) {
        guards = guards.map(stepGuard);
    }
    console.log(guards);

    const _inQuadrantNW = (position: Vec2n): boolean => {
        return (position.x >= 0 &&
            position.x < Math.floor(SPACE_DIMENSIONS[0] / 2)) &&
            (position.y >= 0 &&
                position.y < Math.floor(SPACE_DIMENSIONS[1] / 2));
    };

    const _inQuadrantNE = (position: Vec2n): boolean => {
        return (position.x >= Math.ceil(SPACE_DIMENSIONS[0] / 2) &&
            position.x < SPACE_DIMENSIONS[0]) &&
            (position.y >= 0 &&
                position.y < Math.floor(SPACE_DIMENSIONS[1] / 2));
    };

    const _inQuadrantSE = (position: Vec2n): boolean => {
        return (position.x >= Math.ceil(SPACE_DIMENSIONS[0] / 2) &&
            position.x < SPACE_DIMENSIONS[0]) &&
            (position.y >= Math.ceil(SPACE_DIMENSIONS[1] / 2) &&
                position.y < SPACE_DIMENSIONS[1]);
    };

    const _inQuadrantSW = (position: Vec2n): boolean => {
        return (position.x >= 0 &&
            position.x < Math.floor(SPACE_DIMENSIONS[0] / 2)) &&
            (position.y >= Math.ceil(SPACE_DIMENSIONS[1] / 2) &&
                position.y < SPACE_DIMENSIONS[1]);
    };
    //Find the numbers of guards in each quadrant
    const inNWQuadrant = guards.filter((g) => _inQuadrantNW(g.position)).length;
    const inNEQuadrant = guards.filter((g) => _inQuadrantNE(g.position)).length;
    const inSEQuadrant = guards.filter((g) => _inQuadrantSE(g.position)).length;
    const inSWQuadrant = guards.filter((g) => _inQuadrantSW(g.position)).length;

    console.log(
        `result: ${inNWQuadrant} * ${inNEQuadrant} * ${inSEQuadrant} * ${inSWQuadrant}  = ${
            inNWQuadrant * inNEQuadrant * inSEQuadrant * inSWQuadrant
        } `,
    );
});
/*
PERFROM ONE STEP. THis is, of course, slow
*/
function stepGuard(g: GuardData): GuardData {
    const newPosition = {
        x: (g.position.x + g.velocity.x) % SPACE_DIMENSIONS[0],
        y: (g.position.y + g.velocity.y) % SPACE_DIMENSIONS[1],
    };

    if (newPosition.x < 0) newPosition.x += SPACE_DIMENSIONS[0];
    if (newPosition.y < 0) newPosition.y += SPACE_DIMENSIONS[1];

    return {
        position: newPosition,
        velocity: g.velocity,
    };
}
