import fs from "node:fs";


type Vec2n = {x:number, y:number};
function mul_vec2n(x: Vec2n, scalar:number){ return {x:x.x*scalar, y:x.y*scalar};} 
const DIMS: Vec2n = {x:140, y:140};

fs.readFile("./4/input.txt", (err, data)=> {
    if(err){
        console.error(err);
        return;
    }
    const formattedData = data.toString().split("\n")

    const xmasInData = timesXMASFound(formattedData);
    console.log(`XMAS found ${xmasInData} times`)
})


function timesXMASFound(grid:string[]): number{
    //Gehe durch das Gatter
    //Falls X:
        //Prüfe vorwärts & rückwärts    
        //Prüfe vertikal
        //Prüfe diagonal
    
    let hits=0;
    //Funktion mit Guards, die die Grenzen des Gatters respektieren
    const _charRelativeToPosIs = (position: Vec2n, direction: Vec2n, searchChar:string) => {
        const destination = {x:position.x+direction.x, y:position.y+direction.y};
        if(destination.x>=DIMS.x||destination.x<0)return false;
        if(destination.y>=DIMS.y||destination.y<0)return false;
        
        return grid[destination.y].charAt(destination.x) === searchChar;
        
    }

    const _spellsOut = (position: Vec2n, direction: Vec2n, search:string) => {
        for(let i = 0; i<search.length;i++){
            if(!_charRelativeToPosIs(position, mul_vec2n(direction, i+1), search.charAt(i)))return false
        }
        return true
    }
    for(let y = 0; y<grid.length; y++){
        const line = grid[y];
        for(let x = 0;x<line.length;x++){
            if(line.charAt(x)==="X"){
                const currentPos = {x:x, y:y};
                //Prüfe horizontal
                if(_spellsOut(currentPos, {x:-1, y:0}, "MAS"))hits++;
                if(_spellsOut(currentPos, {x:1, y:0}, "MAS"))hits++;
                //Prüfe vertikal
                if(_spellsOut(currentPos, {x:0, y:-1}, "MAS"))hits++;
                if(_spellsOut(currentPos, {x:0, y:1}, "MAS"))hits++;
                //Prüfe diagonal
                if(_spellsOut(currentPos, {x:1, y:1}, "MAS"))hits++;
                if(_spellsOut(currentPos, {x:-1, y:1}, "MAS"))hits++;
                if(_spellsOut(currentPos, {x:1, y:-1}, "MAS"))hits++;
                if(_spellsOut(currentPos, {x:-1, y:-1}, "MAS"))hits++;
            }
        
        }
    }
    return hits;
}
