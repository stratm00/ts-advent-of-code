import fs from 'node:fs';

interface Vec2n{
    x: number, 
    y: number
}
function vec2n_add(a:Vec2n, b:Vec2n) { return {x:a.x+b.x, y:a.y+b.y}}
function vec2n_sub(a:Vec2n, b:Vec2n) { return {x:a.x-b.x, y:a.y-b.y}}

interface Hit{
    idx: number
    identifier: string
    point: Vec2n
}

type Map = string[];

const STATION_CAPTURE_REGEX = /([a-zA-Z0-9])/gm;

fs.readFile("./8/input.txt", (err, data)=> {

    if(err){
        console.error(err);
        return;
    }

    const mapString = data.toString().trim()
    //Setze Bounds
    const readMap: Map = mapString.split("\r\n").map(s=>s.trim());
    const [mapHeight, mapWidth] = [readMap.length, readMap[0].length];
    // console.log([mapHeight, mapWidth])
    
    const _isInBounds = (point: Vec2n): boolean => {
        let res = (point.x>=0 && point.x<mapWidth) && (point.y>=0 && point.y<mapHeight);
        // console.log(`CHECKING ${JSON.stringify(point)} - ${res}`)
        return res;
    }

    const _isOccupied = (stations: Hit[], point: Vec2n):boolean => {
        return stations.filter((st)=> (st.point.x==point.x) && (st.point.y==point.y)).length>0;
    }

    const _matchToHit = (arr: RegExpExecArray): Hit => {
        return {idx: arr["index"], identifier: arr[1], point: _indexToPoint(arr["index"])}
    }
    
    const _indexToPoint = (idx: number): Vec2n => {
        let xOff = idx % mapWidth;
        return {x: xOff, y: (idx - xOff)/mapWidth};
    }
    
    const _getAntinodes = (s1: Hit, s2: Hit): Hit[]=>{
        if(s1.idx==-1||s2.idx==-1)return [];

        const vectorDiff = vec2n_sub(s2.point, s1.point)
        return [
            {idx: -1, identifier: '#'+s1.identifier, point: vec2n_add(s2.point, vectorDiff)},
            {idx: -1, identifier: '#'+s2.identifier, point: vec2n_sub(s1.point, vectorDiff)}
        ];
    }

    let totalAntinodes: Hit[] = [];
    //We get off axis if we don't tear away all the whitespace 
    let mapStringWithoutLinebreaks = mapString.replaceAll("\r\n","");
    let stationHits = [...mapStringWithoutLinebreaks.matchAll(STATION_CAPTURE_REGEX)].map(_matchToHit);
    
    //  Detect Signal
    //  Find sibling signals ahead
    //  Add p2+(p2-p1) and p1-(p2-p1) to the total antinodes
    for(const hit of stationHits){
        
        const siblingStationsAhead = stationHits.filter((hit2)=>{

            return (hit2.idx != hit.idx) && hit.identifier === hit2.identifier; 

        }); 
       
        
        for(const stationAhead of siblingStationsAhead){
            const antinodes = _getAntinodes(hit, stationAhead)
            // console.log(JSON.stringify(antinodes))
            if(totalAntinodes.filter((an)=> JSON.stringify(an)==JSON.stringify(antinodes[0])).length==0 ) totalAntinodes.push(antinodes[0]);
            if(totalAntinodes.filter((an)=> JSON.stringify(an)==JSON.stringify(antinodes[1])).length==0 ) totalAntinodes.push(antinodes[1]);
        }
    }

    console.log(`\n=== Antinodes (${totalAntinodes.length}) ===`); 
    let uniqueLocations: Vec2n[] = [];
    
    const antinodesInBounds = totalAntinodes.map(an=>an.point).filter(_isInBounds);
    console.log(`=== Antinodes in Bounds (${antinodesInBounds.length}) ===`);
    
    antinodesInBounds.forEach((pt)=>{
        if(uniqueLocations.filter(loc=>loc.x == pt.x && loc.y == pt.y).length<1)uniqueLocations.push(pt);
    });
    
    console.log(`There are ${uniqueLocations.length} total unique locations of antinodes on map`);
});
