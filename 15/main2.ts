import fs from "node:fs";

const MAP_CAPTURE_REGEX =
    /(?<wall>#)|(?<box>O)|(?<bot>@)|(?<instruction>[\^v<>]+)/gm;
const NEWLINE = "\r\n";

type Vec2n = { x: number; y: number };
function vec2n_add(a: Vec2n, b: Vec2n): Vec2n {
    return { x: a.x + b.x, y: a.y + b.y };
}
function vec2n_add_inplace(a: Vec2n, b: Vec2n): void {
    a.x += b.x;
    a.y += b.y;
}
function dir2vec(d: string): Vec2n {
    if (d == "^") return { x: 0, y: -1 };
    else if (d == "v") return { x: 0, y: 1 };
    else if (d == "<") return { x: -1, y: 0 };
    else if (d == ">") return { x: 1, y: 0 };
    else return { x: -1, y: -1 };
}

fs.readFile("./15/input_test.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    
    //Differences in Pt2: All elements are double-wide. so x-offsets of everythign is doubled. robot size and speed has thoughever not changed. 
    const dataString = data.toString().trim();
    const dataLines = dataString.split(NEWLINE).map((s) => s.trim());
    const [gridWidth, gridHeight] = [
        dataLines[0].length,
        dataLines.findIndex((s) => s == ""),
    ];

    const _indexToPos = (index: number): Vec2n => {
        return {
            x: index % gridWidth,
            y: (index - (index % gridWidth)) / gridWidth,
        };
    };

    
    const dataStringNoNewlines = dataString.replaceAll(NEWLINE, "");

    let botPosition: Vec2n = { x: -1, y: -1 };
    let walls: Vec2n[] = [];
    let boxes: Vec2n[] = [];
    const instructionsArr: string[] = [];

    const _isBox = (pos: Vec2n): boolean => {
        if (boxes.find((box) => (box.x == pos.x || box.x == pos.x-1) && box.y == pos.y)) return true;
        return false;
    };
    const _isWall = (pos: Vec2n): boolean => {
        if (walls.find((box) => (box.x == pos.x || box.x == pos.x-1) && box.y == pos.y)) return true;
        return false;
    };

    [...dataStringNoNewlines.matchAll(MAP_CAPTURE_REGEX)].forEach(
        (regexArr) => {
            const position = _indexToPos(regexArr.index);
            if (regexArr.groups?.bot != undefined) {
                botPosition = position;
            } else if (regexArr.groups?.wall != undefined) {
                walls.push(position);
            } else if (regexArr.groups?.box != undefined) {
                boxes.push(position);
            } else if (regexArr.groups?.instruction != "") {
                //the ?? is to satisfy the code analysis
                (regexArr.groups?.instruction.split("") ?? []).forEach((el) =>
                    instructionsArr.push(el)
                );
            }
        },
    );

    
    walls = walls.map(doubleWide);
    boxes = boxes.map(doubleWide);
    // botPosition = doubleWide(botPosition);
    botPosition.x = 2*botPosition.x;
    printField(walls, boxes, botPosition)


    //Move through the instructions, shift boxes accordingly
    while (instructionsArr.length > 0) {
        const newInst = instructionsArr.shift() ?? "";
        const direction = dir2vec(newInst);
        const directionDbl = doubleWide(direction);

        console.log("BOT: ", botPosition);
        console.log("Moving ",newInst)
        
        const targetPos = vec2n_add(direction, botPosition);
        //PT2 Problem: boxes can be shifted by 1 position

        if (!_isWall(targetPos)) {
            if (_isBox(targetPos)) {
                //identify the boxes
                const affectedBoxes: Vec2n[] = [];
                
                const firstBox = boxes.find((b) =>
                    b.x == targetPos.x && b.y == targetPos.y
                );
                if (firstBox) affectedBoxes.push(firstBox);
                
                let next_pos = vec2n_add(targetPos, directionDbl);
                while (_isBox(next_pos)) {
                    //We need the object ref to add inplace
                    const nextbox = boxes.find((b) =>
                        (b.x == next_pos.x) || (b.x+1 == next_pos.x) && b.y == next_pos.y
                    );
                    if (nextbox) affectedBoxes.push(nextbox);
                    
                    next_pos = vec2n_add(next_pos, directionDbl);
                }
                console.log(affectedBoxes)
                //check if the next space after the line of boxes is free
                const checkNextFree = !_isWall(next_pos);
                //if yes, move each into direction
                if (checkNextFree) {
                    affectedBoxes.forEach((b) => vec2n_add_inplace(b, direction));
                    botPosition = vec2n_add(botPosition, direction);
                }
            } else {
                //Free to move
                botPosition = targetPos;
            }
        }
        printField(walls, boxes, botPosition);
    }

    const _getGPSCoord = (pos: Vec2n): number => {
        return 100 * pos.y + pos.x;
    };

    const totalBoxGPS = boxes.map(_getGPSCoord).reduce((a, b) => a + b, 0);

    console.log("TOTAL BOX GPS: ", totalBoxGPS);
});
function doubleWide({x, y}:Vec2n):Vec2n  {return {x: x+x, y:y}}; 
function printField(walls: Vec2n[], boxes: Vec2n[], botPosition: Vec2n): void {
    const width = Math.max(...walls.map((pos) => pos.x)) + 2;
    const height = Math.max(...walls.map((pos) => pos.y)) + 1;

    for (let y = 0; y < height; y++) {
        let lineBuf = "";
        for (let x = 0; x < width; x++) {

            if (walls.find((w) => (w.x == x || w.x == x-1) && w.y == y) ) {
                lineBuf += "#";
            } else if (boxes.find((w) => w.x == x && w.y == y)) {
                lineBuf += "["; 
            }else if (boxes.find((w) => w.x == x-1 && w.y == y)) {
                    lineBuf += "]";
            } else if (botPosition.x == x && botPosition.y == y) {
                lineBuf += "@";
            } else lineBuf += ".";
        }
        console.log(lineBuf);
    }
}
