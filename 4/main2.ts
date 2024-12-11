import fs from "node:fs";

type Vec2n = { x: number; y: number };
function mul_vec2n(x: Vec2n, scalar: number) {
    return { x: x.x * scalar, y: x.y * scalar };
}
function sub_vec2n(x: Vec2n, sub: Vec2n) {
    return { x: x.x - sub.x, y: x.y - sub.y };
}
function add_vec2n(x: Vec2n, sub: Vec2n) {
    return { x: x.x + sub.x, y: x.y + sub.y };
}

const DIMS: Vec2n = { x: 140, y: 140 };

fs.readFile("./4/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const formattedData = data.toString().split("\n");

    const x_masInData = timesX_MASFound(formattedData);
    console.log(`X-MAS found ${x_masInData} times`);
});

function timesX_MASFound(grid: string[]): number {
    let hits = 0;
    //Funktion mit Guards, die die Grenzen des Gatters respektieren
    const _charRelativeToPosIs = (
        position: Vec2n,
        direction: Vec2n,
        searchChar: string,
    ) => {
        const destination = add_vec2n(position, direction);
        if (destination.x >= DIMS.x || destination.x < 0) return false;
        if (destination.y >= DIMS.y || destination.y < 0) return false;

        return grid[destination.y].charAt(destination.x) === searchChar;
    };

    const _spellsOut = (position: Vec2n, direction: Vec2n, search: string) => {
        for (let i = 0; i < search.length; i++) {
            if (
                !_charRelativeToPosIs(
                    position,
                    mul_vec2n(direction, i + 1),
                    search.charAt(i),
                )
            ) return false;
        }
        return true;
    };

    for (let y = 0; y < grid.length; y++) {
        const line = grid[y];
        for (let x = 0; x < line.length; x++) {
            //Find X-MAS
            if (line.charAt(x) === "A") {
                const a_pos: Vec2n = { x: x, y: y };

                const diag1: Vec2n = { x: 1, y: 1 };
                const diag2: Vec2n = { x: 1, y: -1 };

                const diag1_start = sub_vec2n(a_pos, mul_vec2n(diag1, 2));
                const diag2_start = sub_vec2n(a_pos, mul_vec2n(diag2, 2));

                const diag_1_condition =
                    _spellsOut(diag1_start, diag1, "SAM") ||
                    _spellsOut(diag1_start, diag1, "MAS");
                const diag_2_condition =
                    _spellsOut(diag2_start, diag2, "SAM") ||
                    _spellsOut(diag2_start, diag2, "MAS");
                //Within the X, each MAS can be written forwards or backwards.
                if (
                    diag_1_condition && diag_2_condition
                ) hits++;
            }
        }
    }
    return hits;
}
