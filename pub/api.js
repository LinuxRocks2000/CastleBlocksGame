/* By Tyler Clarke.
Client verbs:
 * g: get data.
Server verbs:
 * r: return data.
 * e: end the return.
Server adjectives:
 * n: number.
*/

function TODO(reason){
    console.error("TODO: " + reason);
}

class APIEventually {
    constructor (requestValue) {
        this.requestValue = requestValue;
        this.isUpdating = false;
        this.values = [];
    }

    mark () {
        this.isUpdating = true;
    }

    done () {
        if (this.onResolve){
            this.onResolve(this.values);
        }
        this.isUpdating = false;
    }

    data (verb, data) { /* Verb is for posterity. */
        this.values.push (data);
        if (this.onData) {
            this.onData (data);
        }
    }
}


class APIController {
    constructor (id) {
        this.resolvers = [];
        this.currentNoun = undefined;
    }

    update (verb, noun) { /* Called whenever data is sent to this id */
        switch (verb) { /* I hate switch case but it works here, sadly. */
            case "r": // Respond
                this.resolve (verb, noun);
                break;
            case "n":
                if (this.currentNoun) {
                    this.currentNoun.data(verb, noun - 0);
                }
                break;
            case "e":
                this.currentNoun.done();
                this.resolvers.splice(this.resolvers.indexOf(this.currentNoun), 1);
                delete this.currentNoun;
                break;
        }
    }

    resolve (verb, noun) { /* Update the resolvers, this is only called on proper responses but keep the verb argument for posterity */
        if (verb == "r") {
            this.resolvers.forEach((resolver, i) => {
                if (resolver.requestValue == noun) {
                    resolver.mark();
                    this.currentNoun = resolver;
                }
            });
        }
    }

    makeRequests () { /* Called by the api client object */
        var ret = [];
        this.requests.forEach((item, i) => {

        });
    }

    getEventually (value) { /* Get a piece of data, returns an APIEventually object that resolves itself "eventually" */
        var eventual = new APIEventually(value);
        this.resolvers.push(eventual);
        return eventual;
    }
}


class APIObject {
    constructor (controller) {
        this.controller = controller;
        this.values = {};
    }

    setVal (key, value) {
        this.values[key] = value;
    }

    getVal (key, def) {
        return this.values[key] || def;
    }

    update (key, value) {

    }
}


class APIClient {
    constructor(url) {
        this.socket = new WebSocket(url);
        TODO("Implement controllers and get ids and stuff");
    }

    authenticate(username, password){
        TODO("Implement authentication");
    }
}
