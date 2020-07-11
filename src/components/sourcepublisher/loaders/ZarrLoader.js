/* eslint-disable */
import { openArray } from 'zarr';
import AbstractLoader from './AbstractLoader';



export default class ZarrLoader extends AbstractLoader {

    constructor(params) {
        super(params);

        const { url } = this;
        this.zUrl = url.endsWith('/') ? url : `${url}/`;
        this.zAttrsUrl = this.zUrl + '.zattrs';

        this.zStore = "https://s3.amazonaws.com/vitessce-data/0.0.30/master_release/satija/";
        this.zPath = "2dca1bf5832a4102ba780e9e54f6c350.clusters.zarr";
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