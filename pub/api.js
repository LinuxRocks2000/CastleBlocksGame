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
        this.requests = {};
        this.values = {};
        this.objects = {};

        this.types = {
            "b": Block
        };
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
            }
        }
    }

    onMessage(event){
        var data = new StringStream(event.data);
        if (this.ready){
            this.update(data);
        }
        else{
            this.ready = true;
            this.id = data.readNumber();
        }
    }

    makeRequests(){
        Object.keys(this.requests).forEach((req, i) => {
            this.socket.send("g" + req + "e");
        });
    }
}
