/* eslint-disable */
export default class AbstractLoader {

    constructor({ name, type, url, requestInit }) {
        this.name = name;
        this.type = type;
        this.url = url;
        this.requestInit = requestInit;
    }

    load() {
        throw new Error("The load() method has not been implemented.");
    }
    
}