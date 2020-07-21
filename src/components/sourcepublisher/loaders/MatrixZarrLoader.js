/* eslint-disable */
import { openArray } from 'zarr';
import AbstractLoader from './AbstractLoader';

function basename(path) {
    return path.split('/').pop();
}

function dirname(path) {
    return path.substr(0, path.lastIndexOf("/") + 1)
}

export default class MatrixZarrLoader extends AbstractLoader {

    constructor(params) {
        super(params);

        const { url } = this;
        this.zUrl = url.endsWith('/') ? url : `${url}/`;
        this.zAttrsUrl = this.zUrl + '.zattrs';

        this.zStore = dirname(url);
        this.zPath = basename(url);
    }

    loadAttrs() {
        const { zAttrsUrl, requestInit } = this;
        if(this.attrs) {
            return this.attrs;
        }
        this.attrs = fetch(zAttrsUrl, requestInit)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response.headers);
                }
            });
        return this.attrs;
    }

    loadArr() {
        const { zStore, zPath, requestInit } = this;
        if(this.arr) {
            return this.arr;
        }
        this.arr = openArray({
            store: zStore,
            path: zPath,
            mode: "r"
        });
        return this.arr;
    }
    
    load() {
        return Promise.all([this.loadAttrs(), this.loadArr()]);
    }
}