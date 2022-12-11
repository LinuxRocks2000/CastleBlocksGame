var tileset = [];
var arts = [
    document.getElementById("basic_dirt"),
    document.getElementById("basic_sand"),
    document.getElementById("castleblock"),
    undefined,
    undefined,
    document.getElementById("basic_shrub")
];

var cursor = 2;

var RENDER_BLOCKSIZE = 50;

var cX = 0;
var cY = 0;
var mousePos = {
    rawX: 0,
    rawY: 0,
    gameX: 0,
    gameY: 0,
    gridX: 0,
    gridY: 0
};
var w = 0;
var h = 0;

var worldWidth = 0;
var worldHeight = 0;

var canvas = document.getElementById("game");
canvas.addEventListener("mousemove", (data) => {
    mousePos.rawX = data.clientX;
    mousePos.rawY = data.clientY;
});
canvas.addEventListener("click", (data) => {
    if (client.isPlaceCastleblock){
        client.placeCastleblock(mousePos.gridX, mousePos.gridY);
    }
    else {
        client.placeBlock(cursor, mousePos.gridX, mousePos.gridY);
    }
});
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

function drawBrick(x, y, type, blockSize = RENDER_BLOCKSIZE, context = ctx, lines = true){
    rX = x * blockSize;
    rY = y * blockSize;
    if (type >= 0 && type < arts.length){
        if (arts[type]){
            context.drawImage(arts[type], rX, rY);
        }
    }
    if (lines){
        context.strokeStyle = "white";
        context.lineWidth = 0.5;
        context.strokeRect(rX, rY, RENDER_BLOCKSIZE, RENDER_BLOCKSIZE);
    }
}

var xv = 0;
var yv = 0;

function placeCastleblockInterface(){

}

function mainInterface(){

}

function loop(){
    mousePos.gameX = mousePos.rawX + cX * RENDER_BLOCKSIZE;
    mousePos.gameY = mousePos.rawY + cY * RENDER_BLOCKSIZE;
    mousePos.gridX = Math.floor(mousePos.gameX / RENDER_BLOCKSIZE);
    mousePos.gridY = Math.floor(mousePos.gameY / RENDER_BLOCKSIZE);
    if (client.isPlaceCastleblock){
        cursor = 2;
    }
    else if (cursor == 2){
        cursor = 0;
    }
    if (mousePos.gridX >= worldWidth){
        mousePos.gridX = worldWidth - 1;
    }
    else if (mousePos.gridX < 0){
        mousePos.gridX = 0;
    }
    if (mousePos.gridY >= worldHeight){
        mousePos.gridY = worldHeight - 1;
    }
    else if (mousePos.gridY < 0){
        mousePos.gridY = 0;
    }
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    for (var x = cX - w/2; x < cX + w + w/2; x ++){
        for (var y = cY - h/2; y < cY + h + h/2; y ++){
            x = Math.round(x);
            y = Math.round(y);
            if (x < 0 || y < 0 || x >= worldWidth || y >= worldHeight){
                continue;
            }
            var item = tileset[x][y];
            drawBrick(item.x - cX, item.y - cY, item.type);
            if (item.type == -1){
                item.type = -2; // -2 = requested, waiting
                client.preloadOne(x, y);
            }
        }
    }
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect((mousePos.gridX - cX) * RENDER_BLOCKSIZE, (mousePos.gridY - cY) * RENDER_BLOCKSIZE, RENDER_BLOCKSIZE, RENDER_BLOCKSIZE);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "black";
    ctx.fillRect((mousePos.gridX - cX) * RENDER_BLOCKSIZE, (mousePos.gridY - cY) * RENDER_BLOCKSIZE, RENDER_BLOCKSIZE, RENDER_BLOCKSIZE);
    drawBrick(mousePos.gridX - cX, mousePos.gridY - cY, cursor);
    ctx.globalAlpha = 1;
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

    if (client.isPlaceCastleblock == true){
        // Add more complex rules later
        ctx.fillStyle = "green";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.strokeText("Place your castle block:", window.innerWidth/2, 40);
        ctx.fillText("Place your castle block:", window.innerWidth/2, 40);
        placeCastleblockInterface(); // We'll decide on a final structure for the client later; for now, keep it to FOP
    }
    else if (client.isPlaceCastleblock == false){ // Catch undefined, I think
        mainInterface();
    }
}

var client;
var keysDown = {};

fetch("api/get/prefix").then(response => response.text()).then(prefix => {
	client = new APIClient("ws" + (location.protocol == "https:" ? "s" : "") + "://" + location.host.split(":")[0] + "/" + prefix + "/game");
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
	    client.loadState();
	};

	client.onStateLoaded = (data) => {

	};

	window.addEventListener("keydown", (event) => {
	    keysDown[event.key] = true;
	    if (event.key == "q"){
	        cursor --;
	        if (cursor == 2){
	            cursor --;
	        }
	    }
	    if (event.key == "e"){
	        cursor ++;
	        if (cursor == 2){
	            cursor ++;
	        }
	    }
	    if (cursor < 0){
	        cursor = arts.length - 1;
	    }
	    if (cursor >= arts.length){
	        cursor = 0;
	    }
	});

	window.addEventListener("keyup", (event) => {
	    keysDown[event.key] = false;
	});

	canvas.addEventListener("wheel", (event) => {
	    xv += event.deltaX * 0.2;
	    yv += event.deltaY * 0.2;
	    event.preventDefault();
	});
});
