/* By Tyler Clarke.
Client verbs:
 * g: get data.
 * a: Authenticate.
Server words:
 * r: set global data.
 * c: create an object.
 * R: set data on an object.
*/

function TODO(reason){
    console.error("TODO: " + reason);
}


class APIObject {
    constructor (client) {
        this.client = client;
        this.values = {};
        this.diff = {};
    }

    setVal (key, value) {
        this.values[key] = value;
        this.diff[key] = value;
    }

    getDiff (){
        var d = this.diff;
        this.diff = {};
        return d;
    }

    getVal (key, def) {
        return this.values[key] || def;
    }

    update (key, value) {

    }
}


class StringStream {
    constructor(initial){
        this.buffer = "";
        this.position = 0;
        if (initial){
            this.push(initial);
        }
    }

    push(data){
        this.buffer += data;
    }

    _read(){
        if (!this.isEmpty()){
            this.position ++;
            return this.buffer[this.position - 1];
        }
        return "";
    }

    read (amount = 1){
        var ret = "";
        for (var i = 0; i < amount; i ++){
            ret += this._read();
        }
        return ret;
    }

    readUntil(character){
        var ret = "";
        var chr = this._read();
        while (chr != character && chr != ""){ // It returns "" when it's out of data, gotta catch 'em all!.
            ret += chr;
            chr = this._read();
        }
        return ret;
    }

    peek(){
        if (!this.isEmpty()){
            return this.buffer[this.position];
        }
        return "";
    }

    isEmpty(){
        return this.position >= this.buffer.length;
    }

    readNumber(){
        var ret = "";
        var chr = this._read();
        var reggie = (/[0-9]/gm);
        while (chr.match(reggie)){
            ret += chr;
            chr = this._read();
        }
        this.position --; // It went one character too far, so rewind one.
        return ret - 0; // It's stupid, yes, but very concise
    }

    readWord(){
        return this.readUntil(" ");
    }

    readWords(amount){
        var ret = [];
        for (var i = 0; i < amount; i ++){
            ret.push(this.readWord());
        }
        return ret;
    }
}


class APIClient {
    constructor(url) {
        this.socket = new WebSocket(url);
        this.socket.onmessage = (event) => {
            this.onMessage(event);
        };
        this.socket.onopen = (event) => {
            if (this.onReady){
                this.onReady(event);
            }
        };
        this.requests = {};
        this.values = {};
        this.objects = {};

        this.types = {
            "b": Block
        };

        this.metadata = {
            worldWidth: -1,
            worldHeight: -1
        };

        this.isPlaceCastleblock = undefined; // No response from server
    }

    authenticate(username, password){
        this.socket.send("a" + username + " " + password); // NOT SECURE! We'll use roil keygen for it later.
    }

    getEventually(value, callback){
        if (this.requests[value]){
            this.requests[value].push(callback);
        }
        else{
            this.requests[value] = [callback];
            this.socket.send("g" + req + "e");
        }
    }

    get(value){
        return this.values[value];
    }

    update(data){
        while (!data.isEmpty()){
            var verb = data.read();
            if (verb == "r"){
                var length = data.readNumber();
                var name = data.readWord();
                var responseData = data.read(length);
                this.values[name] = responseData;
                if (this.requests[name]){
                    this.requests[name].forEach((item, i) => {
                        item(responseData);
                    });
                    delete this.requests[name];
                }
            }
            else if (verb == "c"){
                var id = data.readNumber();
                var type = data.readWord();
                var obj = new this.types[type]();
                this.objects[id] = obj;
                if (this.onCreate){
                    this.onCreate(obj);
                }
            }
            else if (verb == "b"){
                var x = data.readNumber();
                data.read(); // Purge the space character
                var y = data.readNumber();
                data.read(); // Purge another space character
                var type = data.readNumber();
                if (this.onBrick){
                    this.onBrick(x, y, type);
                }
            }
            else if (verb == "D"){
                if (this.onPreloadFinished){
                    this.onPreloadFinished();
                }
            }
            else if (verb == "m"){
                this.metadata.worldWidth = data.readNumber();
                data.read();
                this.metadata.worldHeight = data.readNumber();
                data.read();
                if (this.onMetadataLoaded){
                    this.onMetadataLoaded(this.metadata);
                }
            }
            else if (verb == "s"){
                var state = data.read().charCodeAt(0);
                this.isPlaceCastleblock = !(state & 1);
                if (this.onStateLoaded){
                    this.onStateLoaded();
                }
            }
        }
    }

    onMessage(event){
        var process = (data) => {
            if (this.ready){
                this.update(data);
            }
            else{
                this.ready = true;
                this.id = data.readNumber();
            }
        };
        if (typeof(event.data) == "string"){
            process(new StringStream(event.data));
        }
        else{
            var reader = new FileReader();
            reader.addEventListener("load", (d) => {
                process(new StringStream(d.srcElement.result));
            });
            reader.readAsBinaryString(event.data);
        }
    }

    preloadBricks(x, y, width, height){
        this.socket.send("b" + x + " " + y + " " + width + " " + height);
    }

    preloadOne(x, y){
        this.socket.send("B" + x + " " + y);
    }

    loadMetadata(){
        this.socket.send("m");
    }

    loadState(){
        this.socket.send("s");
    }

    placeBlock(b, x, y){
        this.socket.send("p" + b + " " + x + " " + y); // Bitbang later
    }

    placeCastleblock(x, y){
        this.placeBlock(2, x, y);
    }
}
