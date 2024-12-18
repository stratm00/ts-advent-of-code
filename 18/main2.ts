import fs from "node:fs";

const POSITION_REGEX = /(\d+,\d+)/gm;
const SIDE_LENGTH = 71;

type Vec2n = { x; y: number };
function vec2n_eq(a, b: Vec2n) {
    return a.x == b.x && a.y == b.y;
}
type Edge = { start; end: Vec2n };

fs.readFile("./18/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const bytes: Vec2n[] = [];
    [...data.toString().matchAll(POSITION_REGEX)].forEach((regexparr) => {
        const [x, y] = regexparr[1].split(",").map(Number);
        bytes.push({ x, y });
    });
    let [lowerBound, upperBound] = [0, bytes.length];
    let obstructionFound = false;
    let max_steps = -1;
    let middle = (lowerBound + upperBound) / 2;
    while (!obstructionFound) {
        // console.log("Testing at middle of ", middle)
        const bytesSnapshot = bytes.filter((_, idx) => idx < middle);
        const edges = getEdges(bytesSnapshot);
        const steps = dijkstraSteps(edges);

        console.log(
            "testing, new byte, steps: ",
            middle,
            bytesSnapshot[bytesSnapshot.length - 1],
            steps,
        );

        if (steps != Number.POSITIVE_INFINITY) {
            max_steps = steps;
            lowerBound = middle;
        } else {
            obstructionFound = true;
            upperBound = lowerBound;
        }

        middle = (upperBound + lowerBound) / 2;
    }

    //Test incrementally between middle and lowerBound
    obstructionFound = false;
    while (!obstructionFound) {
        // console.log("Testing at middle of ", middle)
        const bytesSnapshot = bytes.filter((_, idx) => idx < middle);
        const edges = getEdges(bytesSnapshot);
        const steps = dijkstraSteps(edges);

        console.log(
            "testing, new byte, steps: ",
            middle,
            bytesSnapshot[bytesSnapshot.length - 1],
            steps,
        );

        if (steps != Number.POSITIVE_INFINITY) {
            max_steps = steps;
        } else {
            obstructionFound = true;
        }
        middle++;
    }

    console.log(
        "Maximal amount of steps before the goal is unreachable:",
        max_steps,
    );
});

function inBounds(pos: Vec2n) {
    return (0 <= pos.x && pos.x < SIDE_LENGTH) &&
        (0 <= pos.y && pos.y < SIDE_LENGTH);
}

function dijkstraSteps(edges: Edge[]): number {
    //leaning on wiki pseudocode here
    
    const start: Vec2n = { x: 0, y: 0 };

    const _distMap: Map<Vec2n, number> = new Map<Vec2n, number>();
    
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
        console.error("[0,0] not found.");
        return -1;
    }

    _distMap.set(canonicalStart, 0);

    //While Q is not empty
    while (queue.length > 0) {
        // console.log("QUEUE ITERATION")
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

        //Find neighbours of the least distance node within the queue
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
            }
        }
    }

    //find distance to goal
    const distKeyFinal = [..._distMap.keys()].find((key) =>
        vec2n_eq(key, { x: 70, y: 70 })
    );
    if (distKeyFinal) {
        return _dist(distKeyFinal);
    } else return Number.POSITIVE_INFINITY;
}

function getEdges(bytes: Vec2n[]) {
    const edges: Edge[] = [];
    const _inEdges = (v: Edge): boolean => {
        return edges.find(
            (v2) => (vec2n_eq(v2.start, v.start) && vec2n_eq(v2.end, v.end))
        ) != undefined;
    };
    const _inBytes = (pos: Vec2n): boolean => {
        return bytes.find((b) => vec2n_eq(b, pos)) != undefined;
    };

    const edgeFindQueue: Vec2n[] = [{ x: 0, y: 0 }];
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
                    inBounds(pos1) && !_inBytes(pos1)
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
    return edges;
}
