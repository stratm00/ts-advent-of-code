import fs from "node:fs";

const STEP_SAVINGS_THRESHOLD = 100;
const MAP_CAPTURE_REGEX = /(?<wall>#)|(?<start>S)|(?<end>E)/gm;

type Vec2n = { x: number; y: number };
function vec2n_eq(a: Vec2n, b: Vec2n) {
    return a.x == b.x && a.y == b.y;
}
function vec2n_midpoint(a: Vec2n, b: Vec2n) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
type Edge = { start: Vec2n; end: Vec2n };

type Skip = { from: Vec2n; to: Vec2n };
function vec2n_dist(from: Vec2n, to: Vec2n) {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}
fs.readFile("./20/input_test.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const dataString = data.toString().trim();
    const dataLines = dataString.split("\n").map((s) => s.trim());
    const [gridHeight, gridWidth] = [dataLines.length, dataLines[0].length];
    console.log([gridHeight, gridWidth]);
    //Read maze
    const _indexToPos = (index: number): Vec2n => {
        return {
            x: index % gridWidth,
            y: (index - (index % gridWidth)) / gridWidth,
        };
    };
    const dataStringNoNewlines = dataString.replaceAll("\r\n", "");

    let startPosition: Vec2n = { x: -1, y: -1 };
    let endPosition: Vec2n = { x: -1, y: -1 };
    const walls: Vec2n[] = [];

    [...dataStringNoNewlines.matchAll(MAP_CAPTURE_REGEX)].forEach(
        (regexArr) => {
            const position = _indexToPos(regexArr.index);
            if (regexArr.groups?.start != undefined) {
                startPosition = position;
            } else if (regexArr.groups?.wall != undefined) {
                walls.push(position);
            } else if (regexArr.groups?.end != undefined) {
                endPosition = position;
            }
        },
    );

    const edges = getEdges(walls, [gridWidth, gridHeight], startPosition);
    //get edge graph
    //get baseline dijkstra steps
    const cheats: Skip[] = [];
    const steps: Vec2n[] = dijkstraWay(edges, endPosition, startPosition);
    //steps.length includes the start, we need to clip that off
    const baselineStepCount = steps.length - 1;

    const CHEAT_THRESHOLD = 10;
    //see if theres a way to cut in
    //there must be a less convoluted way to do this.
    steps.forEach((from, idx) => {
        const cheatableSteps = steps.filter((st) => vec2n_dist(st, from) == 2);
        // console.log(cheatableSteps);
        //We need to use the index of the element within steps.
        cheatableSteps.filter((
            pos,
        ) => (steps.findIndex((p) => vec2n_eq(p, pos)) - idx > CHEAT_THRESHOLD))
            .forEach((to) => cheats.push({ from, to }));
    });
    console.log(
        cheats.filter((ch) => ch.from.x != ch.to.x && ch.from.y != ch.to.y),
    );

    const routeSavings: number[] = [];

    cheats.forEach((ch) => {
        console.log(ch);
        const newEdges = edges.slice();
        //Add two edges in a route along the way
        const midpoint = vec2n_midpoint(ch.from, ch.to);
        //Add from-to-midpoint (if it does not exist)
        if (
            newEdges.find((ed) =>
                (vec2n_eq(ed.end, ch.from) && vec2n_eq(ed.start, midpoint)) ||
                (vec2n_eq(ed.start, ch.from) && vec2n_dist(ed.end, midpoint))
            ) == undefined
        ) newEdges.push({ start: ch.from, end: midpoint });
        //Add midpoint-to-to (if it does not exist)
        if (
            newEdges.find((ed) =>
                (vec2n_eq(ed.end, midpoint) && vec2n_eq(ed.start, ch.to)) ||
                (vec2n_eq(ed.start, midpoint) && vec2n_dist(ed.end, ch.to))
            ) == undefined
        ) newEdges.push({ start: midpoint, end: ch.to });

        routeSavings.push(
            baselineStepCount -
                (dijkstraWay(newEdges, endPosition, startPosition).length - 1),
        );
        //Figure out the savings
    });
    console.log(routeSavings);
    const routeSavingsOverThreshold = routeSavings.filter((x) =>
        x > STEP_SAVINGS_THRESHOLD
    );

    //Profit?
    console.log(
        "Amount of cheats that save over",
        STEP_SAVINGS_THRESHOLD,
        "steps:",
        routeSavingsOverThreshold.length,
    );
});

function dijkstraWay(edges: Edge[], goal: Vec2n, start: Vec2n): Vec2n[] {
    //leaning on wiki pseudocode here
    //our start is always (0,0), goal is always (69,69) or (6,6)
    console.log("edges", edges);
    console.log("start", start);
    console.log("goal", goal);

    const _distMap: Map<Vec2n, number> = new Map<Vec2n, number>();
    const _prevMap: Map<Vec2n, Vec2n> = new Map<Vec2n, Vec2n>();
    let queue: Vec2n[] = [];

    const _dist = (pos: Vec2n): number => {
        return _distMap.get(pos) ?? Number.POSITIVE_INFINITY;
    };

    for (const { start, end } of edges) {
        if (queue.find((p) => vec2n_eq(start, p)) == undefined) {
            queue.push(start);
        }
        if (queue.find((p) => vec2n_eq(end, p)) == undefined) {
            queue.push(end);
        }
    }

    const canonicalStart = queue.find((v) => vec2n_eq(start, v));
    if (canonicalStart == undefined) {
        console.error("canonical start not found.");
        return [];
    }

    _distMap.set(canonicalStart, 0);

    //While Q is not empty
    while (queue.length > 0) {
        //get node with least distance
        let leastDistanceNode: Vec2n = { y: -1, x: -1 };
        let leastDistanceValue = Number.MAX_VALUE;
        queue.forEach((pt) => {
            const distanceVal = _dist(pt);
            if (distanceVal < leastDistanceValue) {
                leastDistanceNode = pt;
                leastDistanceValue = _dist(pt);
            }
        });
        queue = queue.filter((v) => !vec2n_eq(leastDistanceNode, v));

        //Find neighbours of the least distance node that are within the queue
        const neighbours: Vec2n[] = [];
        edges.filter((e) =>
            vec2n_eq(e.start, leastDistanceNode) ||
            vec2n_eq(e.end, leastDistanceNode)
        ).forEach((e) => {
            if (!vec2n_eq(e.start, leastDistanceNode)) neighbours.push(e.start);
            if (!vec2n_eq(e.end, leastDistanceNode)) neighbours.push(e.end);
        });
        const neighboursInQueue = neighbours.filter((v) => {
            return queue.find((v2) => vec2n_eq(v, v2)) != undefined;
        });

        for (const niq of neighboursInQueue) {
            //this is the length calculation magic, luckily we just have to count steps
            const alt = 1 + _dist(leastDistanceNode);
            if (alt < _dist(niq)) {
                _distMap.set(niq, alt);
                _prevMap.set(niq, leastDistanceNode);
            }
        }
    }

    //find key
    const distKeyFinal = [..._distMap.keys()].find((key) =>
        vec2n_eq(key, goal)
    );

    if (distKeyFinal) {
        console.log(
            "THE DISTANCE (REQUIRED MIN AMT OF STEPS) IS ",
            _dist(distKeyFinal),
        );
    }
    console.log(distKeyFinal);
    //reconstruct the path
    const path: Vec2n[] = [];
    //find the target

    //TODO: we do not find u for some reason

    let u = [..._prevMap.keys()].find((key) => vec2n_eq(key, goal));

    if (u == undefined) {
        console.error("this shouldn't happen.");
        return path;
    }

    let prev = _prevMap.get(u);

    while (prev != undefined) {
        path.unshift(u);
        u = prev;
        prev = _prevMap.get(u);
    }
    path.unshift(canonicalStart);
    return path;
}

function getEdges(bytes: Vec2n[], [boundX, boundY]: number[], start: Vec2n) {
    const edges: Edge[] = [];

    const _inBounds = (v: Vec2n): boolean => {
        return v.x >= 0 && v.x < boundX && v.y >= 0 && v.y < boundY;
    };
    const _inEdges = (v: Edge): boolean => {
        return edges.find(
            (v2) => (vec2n_eq(v2.start, v.start) && vec2n_eq(v2.end, v.end)),
        ) != undefined;
    };
    const _inBytes = (pos: Vec2n): boolean => {
        return bytes.find((b) => vec2n_eq(b, pos)) != undefined;
    };

    const edgeFindQueue: Vec2n[] = [start];
    const visited: Vec2n[] = [];
    while (edgeFindQueue.length > 0) {
        const current_pos = edgeFindQueue.shift();

        if (current_pos != undefined) {
            const top_pos: Vec2n = { x: current_pos.x, y: current_pos.y - 1 };
            const bottom_pos: Vec2n = {
                x: current_pos.x,
                y: current_pos.y + 1,
            };
            const left_pos: Vec2n = { x: current_pos.x - 1, y: current_pos.y };
            const right_pos: Vec2n = { x: current_pos.x + 1, y: current_pos.y };

            //check top,bottom,left,right
            [top_pos, bottom_pos, left_pos, right_pos].forEach((pos1) => {
                if (
                    visited.find((pos) => vec2n_eq(pos1, pos)) == undefined &&
                    _inBounds(pos1) && !_inBytes(pos1)
                ) {
                    if (!_inEdges({ start: current_pos, end: pos1 })) {
                        edges.push({ start: current_pos, end: pos1 });
                    }

                    if (!edgeFindQueue.find((pos2) => vec2n_eq(pos1, pos2))) {
                        edgeFindQueue.push(pos1);
                    }
                }
            });

            visited.push(current_pos);
        }
    }

    console.log("EDGES FOUND: ", edges.length);
    return edges;
}
