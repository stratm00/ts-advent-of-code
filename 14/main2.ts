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

fs.readFile(load_file, (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    let guards = [...data.toString().matchAll(GUARD_CAPTURE_REGEX)].map((arr) =>
        captureGuardData(arr.groups)
    );
    // console.log(guards);
    //Simulate x steps
    let breakLoop = false;
    let steps = 0;
    //Try another thing:
    while (!breakLoop) {
        guards = guards.map(stepGuard);
        steps++;
        const found = searchForTree(guards);
        if (found) breakLoop = true;
    }
    printGuardMap(guards);
    console.log("Step count: ", steps);
});

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
function printGuardMap(guards: GuardData[]) {
    for (let y = 0; y < SPACE_DIMENSIONS[1]; y++) {
        let lineBuf = "";
        for (let x = 0; x < SPACE_DIMENSIONS[0]; x++) {
            if (guards.find((g) => g.position.x == x && g.position.y == y)) {
                lineBuf += "*";
            } else lineBuf += " ";
        }
        console.log(lineBuf);
    }
}

//We detect the picture by the border, which has a solid frame.
const LINE_THRESHOLD = Math.ceil(.10 * SPACE_DIMENSIONS[0]);
function searchForTree(guards: GuardData[]) {
    let line_run = 0;
    for (let y = 0; y < SPACE_DIMENSIONS[1]; y++) {
        for (let x = 0; x < SPACE_DIMENSIONS[0]; x++) {
            if (guards.find((g) => g.position.x == x && g.position.y == y)) {
                line_run++;
            } else line_run = 0;
            if (line_run >= LINE_THRESHOLD) return true;
        }
    }
    return false;
}
