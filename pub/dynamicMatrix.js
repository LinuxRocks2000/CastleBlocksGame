class DynamicMatrix{ /* This sacrifices RAM for CPU time. We might go the other route, like in the cpp, later on. */
    // UNUSED FOR NOW
    constructor(){
        this.array = {};
    }

    set(x, y, thing){
        if (this.array[x]){
            this.array[x][y] = thing;
        }
        else{
            this.array[x] = {};
            this.array[x][y] = thing;
        }
    }

    get(x, y){
        if (this.array[x]){
            return this.array[x][y];
        }
    }
}
