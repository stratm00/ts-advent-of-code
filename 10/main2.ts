import fs from "node:fs";

const ZERO_REGEX = /0/gm;
const STEPLENGTH = 1;
const TRAILTOP = 9;
type Vec2n = { x: number; y: number };
function vec2n_add(a: Vec2n, b: Vec2n) {
    return { x: a.x + b.x, y: a.y + b.y };
}

fs.readFile("./10/input.txt", (err, data) => {
    const _getNumOnGrid = (pos: Vec2n): number => {
        if (!_isInBounds(pos)) return -1;
        return Number(lines[pos.y].charAt(pos.x));
    };

    const _isInBounds = (pos: Vec2n): boolean => {
        return (pos.x >= 0 && pos.x < gridWidth) &&
            (pos.y >= 0 && pos.y < gridHeight);
    };

    const _getTrailheadScore = (pos: Vec2n): number => {
        if (!_isInBounds(pos)) return 0;

        const posValue = _getNumOnGrid(pos);

        if (posValue == TRAILTOP) {
            return 1;
        }

        let sumOfDirs = 0;
        const posRight = vec2n_add(pos, { x: 1, y: 0 });
        const posLeft = vec2n_add(pos, { x: -1, y: 0 });
        const posUp = vec2n_add(pos, { x: 0, y: -1 });
        const posDown = vec2n_add(pos, { x: 0, y: 1 });
        //we are counting the number of viable ways towards a summit (topolgical level 9)
        if (_getNumOnGrid(posRight) == posValue + STEPLENGTH) {
            sumOfDirs += _getTrailheadScore(posRight);
        }
        if (_getNumOnGrid(posLeft) == posValue + STEPLENGTH) {
            sumOfDirs += _getTrailheadScore(posLeft);
        }
        if (_getNumOnGrid(posUp) == posValue + STEPLENGTH) {
            sumOfDirs += _getTrailheadScore(posUp);
        }
        if (_getNumOnGrid(posDown) == posValue + STEPLENGTH) {
            sumOfDirs += _getTrailheadScore(posDown);
        }

        return sumOfDirs;
    };

    if (err) {
        console.error(err);
        return;
    }

    const trimmedFullData = data.toString().trim();

    const lines = trimmedFullData.split("\r\n").map((s) => s.trim());

    const [gridHeight, gridWidth] = [lines.length, lines[0].length];

    const bareData = data.toString().replaceAll("\r\n", "");

    const trailheads: Vec2n[] = [...bareData.matchAll(ZERO_REGEX)].map(
        (regexarr) => {
            const xOffset = regexarr.index % gridWidth;
            return { x: xOffset, y: (regexarr.index - xOffset) / gridWidth };
        },
    );

    const trailScores = trailheads.map(_getTrailheadScore);

    const sumOfTrailScores = trailScores.reduce((a, b) => a + b, 0);

    console.log(`Sum of Trailhead Ratings: ${sumOfTrailScores}`);
});
