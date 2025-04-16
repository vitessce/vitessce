import { OmeZarrLoader } from '../ome-loaders/index.js';
export default class SpatialDataImageLoader extends OmeZarrLoader {
    constructor(dataSource, params) {
        super(dataSource, params);
        // Re-use the OmeZarrLoader, but change the store root to point
        // to the specified OME-NGFF image within the SpatialData store.
        this.storeRoot = this.dataSource.getStoreRoot(params.options.path);
    }
}
