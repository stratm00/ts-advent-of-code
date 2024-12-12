import fs from "node:fs";

type Vec2n = { x: number; y: number };

type Shape = Vec2n[];
type Grid = string[];
fs.readFile("./12/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const dataString = data.toString();
    const readGrid = dataString.trim().split("\r\n").map((s) => s.trim());
    console.log(readGrid);

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
        // console.log(oncomingSquares);
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

    //for each cardinal direction: if a square has a border with a square that doesnt share its character, it gains another edge of circumference
    const area = sh.length;
    if (area > 0) {
        let perimeter = 0;
        const shapeCharacter = _accessGrid(sh[0]);
        perimeter = sh.map((point) => {
            return getSquareNeighbours(point).filter(
                (point2) => _accessGrid(point2) != shapeCharacter,
            ).length;
        }).reduce((a, b) => a + b, 0);
        return perimeter * area;
    } else return 0;
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
