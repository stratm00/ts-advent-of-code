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

    const _listUnion = (l1: Vec2n[], l2: Vec2n[]): void => {
        l2.forEach((v) => l1.push(v));
    };
    const _getSummitsFrom = (pos: Vec2n): Vec2n[] => {
        if (!_isInBounds(pos)) return [];

        // console.log(JSON.stringify(pos));
        const posValue = _getNumOnGrid(pos);

        if (posValue == TRAILTOP) {
            return [pos];
        }

        const ourSummits: Vec2n[] = [];
        const posRight = vec2n_add(pos, { x: 1, y: 0 });
        const posLeft = vec2n_add(pos, { x: -1, y: 0 });
        const posUp = vec2n_add(pos, { x: 0, y: -1 });
        const posDown = vec2n_add(pos, { x: 0, y: 1 });
        //we are counting the number of viable ways towards a summit (topolgical level 9), not the number of summits that can be reached
        if (_getNumOnGrid(posRight) == posValue + STEPLENGTH) {
            _listUnion(ourSummits, _getSummitsFrom(posRight));
        }
        if (_getNumOnGrid(posLeft) == posValue + STEPLENGTH) {
            _listUnion(ourSummits, _getSummitsFrom(posLeft));
        }
        if (_getNumOnGrid(posUp) == posValue + STEPLENGTH) {
            _listUnion(ourSummits, _getSummitsFrom(posUp));
        }
        if (_getNumOnGrid(posDown) == posValue + STEPLENGTH) {
            _listUnion(ourSummits, _getSummitsFrom(posDown));
        }

        return ourSummits;
    };

    const _getUniqueList = (setOfObjs: Vec2n[]): Vec2n[] => {
        const list: Vec2n[] = [];

        setOfObjs.forEach((pos) => {
            if (!list.find((p) => p.x == pos.x && p.y == pos.y)) list.push(pos);
        });

        return list;
    };
    if (err) {
        console.error(err);
        return;
    }

    const trimmedFullData = data.toString().trim();

    const lines = trimmedFullData.split("\r\n").map((s) => s.trim());

    const [gridWidth, gridHeight] = [lines[0].length, lines.length];

    const bareData = data.toString().replaceAll("\r\n", "");

    const trailheads: Vec2n[] = [...bareData.matchAll(ZERO_REGEX)].map(
        (regexarr) => {
            const xOffset = regexarr.index % gridWidth;
            return { x: xOffset, y: (regexarr.index - xOffset) / gridWidth };
        },
    );

    const successfulTrailsforTrailheads = trailheads.map(_getSummitsFrom).map(
        _getUniqueList,
    );

    const trailScores = successfulTrailsforTrailheads.map((arr) => arr.length);

    const sumOfTrailScores = trailScores.reduce((a, b) => a + b, 0);

    console.log(`Sum of Trailhead Scores: ${sumOfTrailScores}`);
});
