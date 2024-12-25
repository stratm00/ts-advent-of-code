import fs from "node:fs";

fs.readFile("./25/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const dataStr = data.toString();
    let imageLines = dataStr.trim().split("\r\n").map(
        (s) => s.trim(),
    );

    const images: string[][] = [];
    let emptyIndex = imageLines.indexOf("");
    while (emptyIndex != -1) {
        images.push(imageLines.slice(
            0,
            imageLines.indexOf(""),
        ));
        imageLines = imageLines.slice(
            emptyIndex +
                1,
        );
        emptyIndex = imageLines.indexOf(
            "",
        );
    }
    images.push(imageLines.slice());

    const lockHeights = images.filter(isLockScheme).map(
        getLockHeights,
    );
    const keyPins = images.filter(isKeyScheme).map(
        getKeyPins,
    );

    //Find unique key-lock combinations
    let uniqueKeyLockFits = 0;
    for (const key of keyPins) {
        for (
            const lock of lockHeights
        ) {
            if (
                testKeyLockPair(
                    key,
                    lock,
                )
            ) {
                uniqueKeyLockFits++;
            }
        }
    }
    console.log("unique key-lock fits", uniqueKeyLockFits);
});

function isLockScheme(inp: string[]) {
    return inp[0].indexOf(".") == -1;
}

function isKeyScheme(inp: string[]) {
    return inp[0].indexOf("#") == -1;
}

function getKeyPins(key: string[]): number[] {
    const pinHeights: number[] = [];
    //we return an int array where every n is:
    //line of first occurence in column x
    for (let col = 0; col < key[0].length; col++) {
        let curHeight = 7;
        let ln = 0;
        while (
            key[ln].charAt(col) ==
                "."
        ) {
            ln++;
            curHeight--;
        }
        pinHeights.push(curHeight);
    }
    return pinHeights.map((n) => n - 1);
}

function getLockHeights(lock: string[]): number[] {
    //we return an int array where every n is:
    //line of last occurence in column x
    //this is nicely reversible!
    const tmp = lock.slice();
    tmp.reverse();
    return getKeyPins(tmp);
}

function testKeyLockPair(key: number[], lock: number[]) {
    //index wise: sum of key[n] and lock[n] <6
    for (let i = 0; i < key.length; i++) {
        if (key[i] + lock[i] > 5) {
            console.log(
                "mismatch in column",
                i +
                    1,
                "for lock and key",
                lock,
                key,
            );
            return false;
        }
    }
    console.log("lock and key", lock, key, "are a fit!");
    return true;
}
