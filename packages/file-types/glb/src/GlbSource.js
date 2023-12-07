export default class GlbSource {
    constructor({url, requestInit}) {
        console.log("Here with " + url)
        this.url = url;
        this.requestInit = requestInit;
    }
}
