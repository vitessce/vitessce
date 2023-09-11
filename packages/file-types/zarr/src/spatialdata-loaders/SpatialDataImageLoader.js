import { OmeZarrLoader } from "../ome-loaders/index.js";

export default class SpatialDataImageLoader extends OmeZarrLoader {
  constructor(dataSource, params) {
    // Re-use the OmeZarrLoader, but change the url to point
    // to the specified OME-NGFF image within the SpatialData store.
    const newParams = {
      ...params,
      url: `${params.url}/${params.options.path}`,
    };
    super(dataSource, newParams);
    this.dataSource = dataSource;
  }
}
