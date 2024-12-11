import fs from 'node:fs';

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
    
    const map: Map = data.toString().split("\r\n")
    completeWalkaround(map);

    const visitedPlaces = map.map((row)=>[...row.matchAll(MARKED_REGEX)].length).reduce((a,b)=>a+b,0);
    console.log(`The guard visits ${visitedPlaces} spots.`)
})

function completeWalkaround(map: Map): void {
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
        //our map borders are not solid as far as the guard is concerned
        if(!((pos.x+orientation.x<mapWidth&&pos.x+orientation.x>=0)
             && (pos.y+orientation.y<mapHeight&&pos.y+orientation.y>=0))) return false;
        return map[pos.y+orientation.y].charAt(pos.x+orientation.x)===ROADBLOCK;
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

    while(guardHasNotLeftMap){
        //mark current Position
        map[guard.y] = map[guard.y].substring(0, guard.x)+MARKED_CHAR+map[guard.y].substring(guard.x+1);
        //walk guard
        while(_checkSolidAhead(guard,orientation)){
            orientation = _turnRight(orientation); 
        }
        guard = add_vec2n(guard, orientation); 
        //mark guard position
        
        guardHasNotLeftMap = (guard.x<mapWidth&&guard.x>=0) && (guard.y<mapHeight&&guard.y>=0);
        if(guardHasNotLeftMap){
            map[guard.y] = map[guard.y].substring(0, guard.x)
                        +_orientationToChar(orientation)
                        +map[guard.y].substring(guard.x+1);
        }
        
    }
    
}