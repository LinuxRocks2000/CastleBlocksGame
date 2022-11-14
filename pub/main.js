var tileset = [];
var arts = [
    document.getElementById("basic_dirt"),
    document.getElementById("basic_sand")
];
var RENDER_BLOCKSIZE = 50;

var cX = 0;
var cY = 0;
var w = 0;
var h = 0;

var worldWidth = 0;
var worldHeight = 0;

var canvas = document.getElementById("game");
function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    w = Math.round(window.innerWidth/RENDER_BLOCKSIZE);
    h = Math.round(window.innerHeight/RENDER_BLOCKSIZE);
}
window.onresize = resize;
resize();
var ctx = canvas.getContext("2d");

function loadViewport(){ // Preload the game. I'm not going to bother renaming this as the entire program will be deleted soon.
    client.loadMetadata();
    client.preloadBricks(cX - w, cY - h, w * 3, h * 3);//Math.round(cX - window.innerWidth/RENDER_BLOCKSIZE), Math.round(cY - window.innerHeight/RENDER_BLOCKSIZE), w, h);
}

function drawBrick(x, y, type){
    if (type == -1 || type >= arts.length){
        return;
    }
    rX = x * RENDER_BLOCKSIZE;
    rY = y * RENDER_BLOCKSIZE;
    ctx.drawImage(arts[type], rX, rY);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(rX, rY, RENDER_BLOCKSIZE, RENDER_BLOCKSIZE);
}

var xv = 0;
var yv = 0;

function loop(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    for (var x = cX - 1; x < cX + w + 2; x ++){
        for (var y = cY - 1; y < cY + h + 2; y ++){
            x = Math.round(x);
            y = Math.round(y);
            if (x < 0 || y < 0 || x >= worldWidth || y >= worldHeight){
                continue;
            }
            var item = tileset[x][y];
            if (item.type == -1){
                client.preloadOne(x, y);
            }
            drawBrick(item.x - cX, item.y - cY, item.type);
        }
    }
    requestAnimationFrame(loop);
    if (keysDown["ArrowUp"]){
        yv -= 7;
    }
    if (keysDown["ArrowDown"]){
        yv += 7;
    }
    if (keysDown["ArrowLeft"]){
        xv -= 7;
    }
    if (keysDown["ArrowRight"]){
        xv += 7;
    }
    cX += xv/RENDER_BLOCKSIZE;
    cY += yv/RENDER_BLOCKSIZE;
    if (worldWidth < w){
        cX = -window.innerWidth/(2 * RENDER_BLOCKSIZE) + worldWidth/2;
    }
    else{
        if (cX < -5){
            cX = -5;
        }
        if (cX > worldWidth + 5 - w){
            cX = worldWidth + 5 - w;
        }
    }
    if (worldHeight < h){
        cY = -window.innerHeight/(2 * RENDER_BLOCKSIZE) + worldHeight/2;
    }
    else{
        if (cY < -5){
            cY = -5;
        }
        if (cY > worldHeight + 5 - h){
            cY = worldHeight + 5 - h;
        }
    }
    xv *= 0.8;
    yv *= 0.8;
}

var client = new APIClient("ws://localhost:9002");
client.onReady = () => {
    client.onBrick = (x, y, type) => {
        var doPush = true;
        tileset.forEach((item, i) => {
            if (item.x == x && item.y == y && item.type == type){
                doPush = false;
            }
        });
        if (doPush){
            tileset[x][y] = {x: x, y: y, type: type};
        }
    };

    loadViewport();
};

client.onPreloadFinished = () => {
    console.log("Preloading finished");
    requestAnimationFrame(loop);
};

client.onMetadataLoaded = (data) => {
    worldWidth = data.worldWidth;
    worldHeight = data.worldHeight;
    for (var x = 0; x < worldWidth; x ++){
        var row = [];
        for (var y = 0; y < worldHeight; y ++){
            row.push({x: -1, y: -1, type: -1});
        }
        tileset.push(row);
    }
};

var keysDown = {};

window.addEventListener("keydown", (event) => {
    keysDown[event.key] = true;
});

window.addEventListener("keyup", (event) => {
    keysDown[event.key] = false;
});

canvas.addEventListener("wheel", (event) => {
    xv += event.deltaX * 0.2;
    yv += event.deltaY * 0.2;
    event.preventDefault();
});
