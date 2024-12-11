import fs from "node:fs";

interface Vec2n {
    x: number;
    y: number;
}
function vec2n_add(a: Vec2n, b: Vec2n) {
    return { x: a.x + b.x, y: a.y + b.y };
}
function vec2n_sub(a: Vec2n, b: Vec2n) {
    return { x: a.x - b.x, y: a.y - b.y };
}

interface Hit {
    idx: number;
    identifier: string;
    point: Vec2n;
}

type Map = string[];

const STATION_CAPTURE_REGEX = /([a-zA-Z0-9])/gm;

fs.readFile("./8/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const mapString = data.toString().trim();
    //Setze Bounds
    const readMap: Map = mapString.split("\r\n").map((s) => s.trim());
    const [mapHeight, mapWidth] = [readMap.length, readMap[0].length];
    // console.log([mapHeight, mapWidth])

    const _isInBounds = (point: Vec2n): boolean => {
        // console.log(`CHECKING ${JSON.stringify(point)} - ${res}`)
        return (point.x >= 0 && point.x < mapWidth) &&
            (point.y >= 0 && point.y < mapHeight);
    };

    const _matchToHit = (arr: RegExpExecArray): Hit => {
        return {
            idx: arr["index"],
            identifier: arr[1],
            point: _indexToPoint(arr["index"]),
        };
    };

    const _indexToPoint = (idx: number): Vec2n => {
        const xOff = idx % mapWidth;
        return { x: xOff, y: (idx - xOff) / mapWidth };
    };

    const _getAntinodes = (s1: Hit, s2: Hit): Hit[] => {
        if (s1.idx == -1 || s2.idx == -1) return [];
        const antinodeArray: Hit[] = [];
        const vectorDiff = vec2n_sub(s2.point, s1.point);

        //find starting point
        let point_along_line = s1.point;
        //step back until we're out of bounds at one end
        while (_isInBounds(point_along_line)) {
            point_along_line = vec2n_sub(point_along_line, vectorDiff);
        }
        //recover and then go forth until we leave the bounds again
        point_along_line = vec2n_add(point_along_line, vectorDiff);
        while (_isInBounds(point_along_line)) {
            antinodeArray.push({
                idx: -1,
                identifier: "#" + s1.identifier,
                point: point_along_line,
            });
            point_along_line = vec2n_add(point_along_line, vectorDiff);
        }

        return antinodeArray;
    };

    const totalAntinodes: Hit[] = [];
    //We get off axis if we don't tear away all the whitespace
    const mapStringWithoutLinebreaks = mapString.replaceAll("\r\n", "");
    const stationHits = [
        ...mapStringWithoutLinebreaks.matchAll(STATION_CAPTURE_REGEX),
    ].map(_matchToHit);

    //  Detect Signal
    //  Find sibling signals ahead
    for (const hit of stationHits) {
        const siblingStationsAhead = stationHits.filter((hit2) => {
            return (hit2.idx != hit.idx) && hit.identifier === hit2.identifier;
        });

        for (const stationAhead of siblingStationsAhead) {
            const antinodes = _getAntinodes(hit, stationAhead);

            antinodes.forEach((an) => {
                totalAntinodes.push(an);
            });
        }
    }

    console.log(`\n=== Antinodes (${totalAntinodes.length}) ===\n`);
    const uniqueLocations: Vec2n[] = [];

    totalAntinodes.map((an) => an.point).forEach((pt) => {
        if (!uniqueLocations.find((loc) => loc.x == pt.x && loc.y == pt.y)) {
            uniqueLocations.push(pt);
        }
    });

    console.log(
        `Respecting resonant harmonics, there are ${uniqueLocations.length} total unique locations of antinodes on map`,
    );
});
