// Art.

class Prerender{ /* Pre-rendering is a canvas trick that makes performance way, way better. Basically you draw sprites on small, hidden canvases then draw those canvases on the game canvas whenever you need that sprite type. I did it in platformer and performance went through the roof. */
    constructor(width, height, style, ident, inval = -1){
        this.ident = ident;
        this.canvas = document.createElement("canvas");\
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.style.display = "none";
        document.body.appendChild(this.canvas); // BUG ALERT: This adds new canvases directly to the body. Might need a new element for holding them.
        this.canvas.classList.add("prerender-canvas");
        this.canvas.id = type;

        this.tick = 0;
        this.invalTimer = inval;
        this.hasDrawn = false;
    }

    getDoRedraw(){
        /*if (this.invalTimer != -1){             // Use this later
            if (this.tick > this.invalTimer){
                this.tick = 0;
                return true;
            }
        }*/
        this.hasDrawn = true; // Trust that, if this returns true, it will be drawn.
        return !this.hasDrawn;
    }

    invalidate(){
        this.hasDrawn = false;
    }

    getContext(){
        return this.ctx;
    }
}


class ArtController {
    constructor(game){
        this.game = game;
        this.preCanvases = {};
        this.canvas = document.getElementById("gameCanvas"); // This element does not exist, yet! Must be a canvas.
        this.ctx = this.canvas.getContext("2d");
        this.cmds = [];
    }

    getContext(obj){

    }

    draw(x, y, width, height, style, onrefresh){
        var render = width + " " + height + " " + style; // Generate a unique string for that block's render type.
        if (!this.preCanvases[render]){
            this.preCanvases[render] = new Prerender(width, height, style, render, onrefresh);
        }
        this.cmds.push([x, y, render]);
    }

    drawPrerender(prerender){ // This is where actual art stuff should go.
        var ctx = prerender.getContext();
        switch(prerender.style){ // I don't often use switch/case but in this case it's useful
            case "castle-block":
                // Draw a castle block to `ctx`
                break;
        }
    }

    render(){ // Actually draw stuff
        Object.values(this.preCanvases).forEach((precanvas, i) => {
            if (precanvas.getDoRedraw()){
                this.drawPrerender(precanvas);
            }
        });

        this.cmds.forEach((item, i) => {
            this.ctx.drawImage(this.preCanvases[item[2]].canvas, item[0], item[1]); // Untested but should work
        });
    }
}
