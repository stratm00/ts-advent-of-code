import fs from 'node:fs';

const GUARD_START_REGEX = /\^/gm;

function add_vec2n(a:Vec2n, b:Vec2n):Vec2n {return {x:a.x+b.x, y:a.y+b.y};}
type Vec2n = {x:number, y:number};
type Map = string[];
const ROADBLOCK = '#';
const MARKED_CHAR = "X"
const MARKED_REGEX = /X/gm;

fs.readFile("./6/input.txt", (err, data)=> {
    if(err){
        console.error(err);
        return;
    }

    //keep a list of results
    const results: boolean[] = [];

    const _isFree = (map: Map,pos:Vec2n): boolean => {
        return map[pos.y].charAt(pos.x)===".";
    }
    const baseMap: Map = data.toString().split("\r\n")
    const [mapHeight, mapWidth] = [baseMap.length, baseMap[0].length];
    

    
    for(let i = 0; i<mapHeight*mapWidth;i++){
        let localMap = data.toString().split("\r\n");
        //Find our point of change iteratively
        const pointCoords:Vec2n = {x:i%mapWidth, y:Math.floor(i/mapWidth)};
        
        //Repeat for every free space
        if(_isFree(localMap, pointCoords)){
            //Place Obstacle
            localMap[pointCoords.y] = localMap[pointCoords.y].substring(0,pointCoords.x) + "#" + localMap[pointCoords.y].substring(pointCoords.x+1)
            
            results.push(completeWalkaround(localMap));
        }
    }
    
    const discoveredLoops = results.filter(x=>x).length;
    console.log(`The guard can get stuck in a loop ${discoveredLoops} ways.`)
})

function completeWalkaround(map: Map): boolean {
    const [mapHeight, mapWidth] = [map.length, map[0].length];
    const _turnRight = (orientation: Vec2n): Vec2n => {
        if(orientation.x==0&&orientation.y==-1){
            return {x:1,y:0};
        }else if (orientation.x==1&&orientation.y==0){
            return {x:0, y:1};
        }else if (orientation.x==0&&orientation.y==1){
            return {x:-1, y:0};
        }else if(orientation.x==-1&&orientation.y==0){
            return {x:0,y:-1};
        }
        return {x:0, y:0};
    };

    const _orientationToChar = (orientation:Vec2n): string =>{
        if(orientation.x==0&&orientation.y==-1){
            return "^";
        }else if (orientation.x==1&&orientation.y==0){
            return ">"
        }else if (orientation.x==0&&orientation.y==1){
            return "v";
        }else if(orientation.x==-1&&orientation.y==0){
            return "<";
        }
        return "";
    }

    const _checkSolidAhead = (pos: Vec2n, orientation: Vec2n): boolean => {
        const new_pos = add_vec2n(pos, orientation);
        //our map borders are not solid as far as the guard is concerned
        if(!((new_pos.x<mapWidth&&new_pos.x>=0)
             && (new_pos.y<mapHeight&&new_pos.y>=0))) return false;
        return map[new_pos.y].charAt(new_pos.x)===ROADBLOCK;
    }


    //Find the guard
    //Let us assume that we find the guard looking upward (signified by ^);
    let guard = {x:0,y:0};
    let orientation = {x:0,y:-1};

    for(let i = 0;i<map.length;i++){
        const match = map[i].indexOf("^")
        if(match !== -1){
            [guard.x, guard.y] = [match, i];
            break;
        }
    }

    let guardHasNotLeftMap = (guard.x<mapWidth&&guard.x>=0) && (guard.y<mapHeight&&guard.y>=0);
    let guardIsCaughtInLoop = false;
    // let guardTurningPoints: Vec2n[] = [];
    let guard_steps = 0;
    while(guardHasNotLeftMap && !guardIsCaughtInLoop){
        //mark current Position
        map[guard.y] = map[guard.y].substring(0, guard.x)+MARKED_CHAR+map[guard.y].substring(guard.x+1);
        //Turn if confronted by obstacle
        while(_checkSolidAhead(guard,orientation)&&!guardIsCaughtInLoop){
            //Mark  recursions
            // This gives us a higher answer than would be correct.
            // const alreadyTurnedHere = guardTurningPoints.filter((pos)=>pos.x==guard.x&&pos.y==guard.y).length>0;
            // if(alreadyTurnedHere)guardIsCaughtInLoop=true;

            if(guard_steps>(mapWidth*mapHeight))guardIsCaughtInLoop=true;
            orientation = _turnRight(orientation);
            // guardTurningPoints.push(guard); 
        }
        if(!guardIsCaughtInLoop){
            //walk guard
            guard = add_vec2n(guard, orientation);
            guard_steps++;
            
            guardHasNotLeftMap = (guard.x<mapWidth&&guard.x>=0) && (guard.y<mapHeight&&guard.y>=0);
            
            // mark guard position
            if(guardHasNotLeftMap){
                map[guard.y] = map[guard.y].substring(0, guard.x)
                            +_orientationToChar(orientation)
                            +map[guard.y].substring(guard.x+1);
            }
            
        }
    }
    
    return guardIsCaughtInLoop;
    
}