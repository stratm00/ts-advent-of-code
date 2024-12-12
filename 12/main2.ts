import fs from "node:fs";

type Vec2n = { x: number; y: number };
function vec2n_add(a: Vec2n, b: Vec2n) {
    return { x: a.x + b.x, y: a.y + b.y };
}
type Walk = { pos: Vec2n; ori: Vec2n };
type Shape = Vec2n[];
type Grid = string[];
fs.readFile("./12/input_test.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const dataString = data.toString();
    const readGrid = dataString.trim().split("\r\n").map((s) => s.trim());
    console.log(readGrid);

    //Read grid
    //DO DFS to acquire the shapes of the grid

    //result per shape: content size * perimeter size

    const shapeResults = getShapes(readGrid);

    const totalResult = shapeResults.map((sh) => shapeScore(sh, readGrid))
        .reduce((a, b) => a + b, 0);

    console.log(`Sum of all shape scores: ${totalResult}`);
});

function getShapes(grid: Grid): Shape[] {
    const [gridHeight, gridWidth] = [grid.length, grid[0].length];
    const _isInBounds = (pos: Vec2n): boolean => {
        return (pos.x >= 0 && pos.x < gridWidth) &&
            (pos.y >= 0 && pos.y < gridHeight);
    };

    const _accessGrid = (pos: Vec2n): string | undefined => {
        if (_isInBounds(pos)) return grid[pos.y].charAt(pos.x);
        else return undefined;
    };

    const shapes: Shape[] = [];
    let currentShape: Shape = [];
    const checkedSquares: Vec2n[] = [];
    //Start at 0,0
    let currentSquare = { x: 0, y: 0 };
    //While not all grid squares are part of some shape:
    // currentShape.push(currentSquare);
    // checkedSquares.push(currentSquare)
    const oncomingSquares: Vec2n[] = [];
    const otherValueSquares: Vec2n[] = [currentSquare];
    while (
        checkedSquares.length <=
            gridHeight * gridWidth
    ) {
        const nextValue = otherValueSquares.pop();
        if (!nextValue) {
            break;
        }

        oncomingSquares.push(nextValue);

        while (oncomingSquares.length > 0) {
            const nextCurrent = oncomingSquares.pop();
            if (nextCurrent === undefined) break;
            if (
                checkedSquares.find((pos) =>
                    pos.x == nextCurrent.x && pos.y == nextCurrent.y
                )
            ) break;
            currentSquare = nextCurrent;
            currentShape.push(currentSquare);

            // console.log(`currentSquare: ${JSON.stringify(currentSquare)}`)
            const inBoundsNeighbours = getSquareNeighbours(currentSquare)
                .filter(_isInBounds);
            for (const inBoundsNPos of inBoundsNeighbours) {
                if (
                    !checkedSquares.find((checked) =>
                        checked.x == inBoundsNPos.x &&
                        checked.y == inBoundsNPos.y
                    )
                ) {
                    if (
                        _accessGrid(inBoundsNPos) == _accessGrid(currentSquare)
                    ) {
                        pushUnique(oncomingSquares, inBoundsNPos);
                    } else {
                        pushUnique(otherValueSquares, inBoundsNPos);
                    }
                }
            }
            // console.log("SSSSSSS")
            // console.log(shapes)

            pushUnique(checkedSquares, currentSquare);
        }
        if (currentShape.length > 0) pushUnique(shapes, currentShape);

        console.log(shapes.length);
        currentShape = [];
    }

    return shapes;
}

function shapeScore(sh: Shape, grid: Grid): number {
    const _isInBounds = (pos: Vec2n): boolean => {
        const [gridHeight, gridWidth] = [grid.length, grid[0].length];
        return (pos.x >= 0 && pos.x < gridWidth) &&
            (pos.y >= 0 && pos.y < gridHeight);
    };

    const _accessGrid = (pos: Vec2n): string | undefined => {
        if (_isInBounds(pos)) return grid[pos.y].charAt(pos.x);
        else return undefined;
    };
    const _matchWalk = (walk1: Walk, walk2: Walk): boolean => {
        return (walk1.pos.x == walk2.pos.x && walk1.pos.y == walk2.pos.y) &&
            (walk1.ori.x == walk2.ori.x && walk1.ori.y == walk2.ori.y);
    };

    const plants = sh.length;
    let sides = 0;
    //Start somewhere
    let currentWalkPos: Vec2n = sh[0];
    const stepsTaken: Walk[] = [];
    let most_recent_dir: Vec2n = { x: 0, y: 0 };
    let new_dir = { x: 0, y: -1 };
    const shapeVal = _accessGrid(currentWalkPos);

    while (
        !stepsTaken.find((walk) =>
            _matchWalk({ pos: currentWalkPos, ori: most_recent_dir }, walk)
        )
    ) {
        stepsTaken.push({ pos: currentWalkPos, ori: most_recent_dir });

        const [neighbourTop, neighbourBottom, neighbourLeft, neighbourRight] =
            getSquareNeighbours(currentWalkPos).map((pos) =>
                _accessGrid(pos) == shapeVal
            );
        if (
            neighbourTop && neighbourBottom && neighbourLeft && neighbourRight
        ) {
            //We move upwards toward an edge
            //We are not at risk of walking off the grid this way since _accessGrid returns undefined and our shapeVal will be not undefined
            new_dir = { x: 0, y: -1 };
            currentWalkPos = vec2n_add(currentWalkPos, new_dir);
            console.log("MOVING UP TO BORDER");
        } else {
            //If on the outskirts, move CW along the edge until you come back: right -> bottom -> left -> top
            //TODO: Find a way to do this
            if (neighbourRight) {
                new_dir = { x: 1, y: 0 };
            } else if (neighbourBottom) {
                new_dir = { x: 0, y: 1 };
            } else if (neighbourLeft) {
                new_dir = { x: -1, y: 0 };
            } else if (neighbourTop) {
                new_dir = { x: 0, y: -1 };
            } else break;

            if (
                !(most_recent_dir.x == new_dir.x &&
                    most_recent_dir.y == new_dir.y)
            ) {
                console.log("DIRECTION CHANGED", most_recent_dir, new_dir);
                sides++;
            }
            most_recent_dir = new_dir;
            currentWalkPos = vec2n_add(currentWalkPos, new_dir);
            console.log("NEW WALK DIR:", currentWalkPos, new_dir);
        }
    }
    console.log("Walk completed: ", stepsTaken);

    console.log(`${plants}, ${sides}`);
    return plants * sides;
}

function getSquareNeighbours(pos: Vec2n): Vec2n[] {
    return [{ x: pos.x, y: pos.y - 1 }, { x: pos.x, y: pos.y + 1 }, {
        x: pos.x - 1,
        y: pos.y,
    }, { x: pos.x + 1, y: pos.y }];
}

function pushUnique<T>(list: T[], item: T): void {
    if (!list.find((it2) => JSON.stringify(it2) == JSON.stringify(item))) {
        list.push(item);
    }
}
