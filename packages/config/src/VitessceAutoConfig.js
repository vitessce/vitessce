import {
    VitessceConfig,
  } from './VitessceConfig';

import { CoordinationType } from '@vitessce/constants-internal';

class OmeTiffAutoConfig {

    constructor(fileUrl) {
        this.fileUrl = fileUrl;
        this.fileType = "raster.json";
        this.type = "ome-tiff";
        this.fileName = fileUrl.split("/").at(-1);
    }

    composeViewsConfig() {
        return [
            ['description'],
            ['spatial'],
            ['layerController']
        ]
    }

    composeFileConfig() {
        return {
            fileType: this.fileType,
            options: {
                "images": [
                    {
                        "metadata": {
                            "isBitmask": false,
                        },
                        "name": this.fileName,
                        "type": "ome-tiff",
                        "url": this.fileUrl
                    }
                ],
                "schemaVersion": "0.0.2",
                "usePhysicalSizeScaling": false
            }
        }
    }

    async init() {
        return this;
    }
}

class OmeZarrAutoConfig {
    
    constructor(fileUrl) {
        this.fileUrl = fileUrl;
        this.fileType = "raster.ome-zarr";
        this.type = "raster";
        this.fileName = fileUrl.split("/").at(-1);
    }

    composeViewsConfig() {
        return [
            ['description'],
            ['spatial'],
            ['layerController'],
            ['status']
        ]
    }

    composeFileConfig() {
        return {
            fileType: this.fileType,
            type: this.type,
            url: this.fileUrl
        }
    }

    async init() {
        return this;
    }

}

class AnndataZarrAutoConfig {

    async downloadMetadata(callbackFunc) {
        const metadataExtension = ".zmetadata";
        const url = [this.fileUrl, metadataExtension].join("/");
        return fetch(url).then((response) => {
            if (response.ok) {
              return response.json();
            }
            return Promise.reject(response);
        })
        .then((responseJson) => {
            return callbackFunc(responseJson);
        })
        .catch((error) => {
            if (error.status === 404) {
                const errorMssg = ["Could not generate config. File ", metadataExtension, " not found in supplied file URL. Check docs for more explanation."].join("");
                return Promise.reject(new Error(errorMssg));
            } 
        });        
    }

    postDownloadFunc(fileMeta) {
        const obsmKeys = Object.keys(fileMeta.metadata)
        .filter(key => key.startsWith("obsm/X_"))
        .map(key => key.split("/.zarray")[0]);
    
        const obsKeysArr = Object.keys(fileMeta.metadata)
        .filter(key => key.startsWith("obs/") && !key.includes("obs/.") && !key.includes("obs/__"))
        .map(key => key.split("/.za")[0]);
    
        function uniq(a) {
        return a.sort().filter(function(item, pos, ary) {
            return !pos || item != ary[pos - 1];
        });
        }   
        const obsKeys = uniq(obsKeysArr);
        
        const X = Object.keys(fileMeta.metadata).filter(key => key.startsWith("X"));

        const out = {
            "obsm": obsmKeys,
            "obs": obsKeys,
            "X": X.length > 0? true: false
        }
        
        return out;
    }

    async init() {
        this.meta = await this.downloadMetadata(this.postDownloadFunc);
        return this;
    }

    constructor(fileUrl) {
        this.fileUrl = fileUrl;
        this.fileType = "anndata.zarr";
        this.fileName = fileUrl.split("/").at(-1);
    }

    composeFileConfig() {    

        let options = {
            "obsEmbedding": [],
            "obsFeatureMatrix": {
                "path": "X"
             }
        };

        this.meta["obsm"].forEach(key => {
            if (key.toLowerCase().includes(("obsm/x_segmentations"))) {
                options["obsSegmentations"] = {"path": key};
            }
            if (key.toLowerCase().includes(("obsm/x_spatial"))) {
                options["obsLocations"] = {"path": key};
            }
            if (key.toLowerCase().includes("obsm/x_umap")) {
                options["obsEmbedding"].push({"path": key,"embeddingType": "UMAP"})
            }
            if (key.toLowerCase().includes("obsm/x_tsne")) {
                options["obsEmbedding"].push({"path": key,"embeddingType": "t-SNE"})
            }
            if (key.toLowerCase().includes("obsm/x_pca")) {
                options["obsEmbedding"].push({"path": key,"embeddingType": "PCA"})
            }
        })
    
        this.meta["obs"].forEach(key => {
            if (key.toLowerCase().includes("cluster") || key.toLowerCase().includes("cell_type")) {
                if (!("obsSets" in options)) {
                    options["obsSets"] = [
                        {
                        "name": "Cell Type",
                        "path": [key]
                        }
                    ]
                }
                else {
                    options.obsSets[0].path.push(key)
                }
            }
        });
    
        return {
            options: options,
            fileType: this.fileType,
            url: this.fileUrl,
            coordinationValues: {
                "obsType": "cell",
                "featureType": "gene",
                "featureValueType": "expression"
            }
        };
    }

    composeViewsConfig() {
        
        let views = [];

        const hasCellSetData = this.meta["obs"]
            .find(key => key.toLowerCase().includes("cluster") || key.toLowerCase().includes("cell_type"));

        if (hasCellSetData.length > 0) {
            views.push(['obsSets']);
        }
    
        this.meta["obsm"].forEach(key => {
            if (key.toLowerCase().includes("obsm/x_umap")) {
                views.push(['scatterplot', { mapping: 'UMAP' }])
            }
            if (key.toLowerCase().includes("obsm/x_tsne")) {
                views.push(['scatterplot', { mapping: 't-SNE' }])
            }
            if (key.toLowerCase().includes("obsm/x_pca")) {
                views.push(['scatterplot', { mapping: 'PCA' }])
            }
            if (key.toLowerCase().includes(("obsm/x_segmentations"))) {
                views.push(['layerController'])
            }
            if (key.toLowerCase().includes(("obsm/x_spatial"))) {
                views.push(['spatial'])
            }
        })

        if (this.meta["X"]) {
            views.push(["heatmap"]);
            views.push(["featureList"]);
        }

        return views;
    }
}

export class VitessceAutoConfig {
    
    configClasses = {
        "OME-TIFF": {
            "extensions": ["ome.tif"],
            "class": OmeTiffAutoConfig
        },
        "Anndata-ZARR": {
            "extensions": ["h5ad.zarr", ".adata.zarr", ".anndata.zarr"],
            "class": AnndataZarrAutoConfig
        },
        "OME-ZARR": {
            "extensions": ["ome.zarr"],
            "class": OmeZarrAutoConfig
        }
    }

    constructor(fileUrls) {
        this.fileUrls = fileUrls;
    }

    getFileType(url) {

        const isOfThisFileType = (fileTypeName) => {
            return this.configClasses[fileTypeName]["extensions"].filter(
                ext => url.endsWith(ext)
            ).length === 1? true : false;
        }

        let fileType = "NOT_DEFINED";
        Object.keys(this.configClasses).forEach(key => {
            if (isOfThisFileType(key)) {
               fileType = key;
            }
        });

        if (fileType !== "NOT_DEFINED") {
            return fileType;
        }

        // todo: adjust this code after speaking to Mark
        // connected with namings of OME-ZARR files. temporary change for testing puproses
        if (url.endsWith(".zarr")) {
            return "OME-ZARR";
        }

        // todo: test this
        throw new Error(`Could not generate config for URL: ${url} This file type is not supported.`);
    }

    calculateCoordinates(viewsNumb) {
        const rows = Math.ceil(Math.sqrt(viewsNumb));
        const cols = Math.ceil(viewsNumb / rows);
        const width = 12 / cols;
        const height = 12 / rows;
        const coords = [];
      
        for (let i = 0; i < viewsNumb; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = col * width;
            const y = row * height;
            coords.push([x, y, width, height]);
        }
      
        return coords;
    }

    async get_asyncObject(configTypeClassName, url) {
        return await new configTypeClassName(url).init();
    }

    async generateConfigs() {

        const vc = new VitessceConfig({
            schemaVersion: "1.0.15",
            name: "An automatically generated config. Adjust values and add layout components if needed.",
            description: "Populate with text relevant to this visualisation."
        });

        let allViews = [];

        this.fileUrls.forEach((url) => {
            allViews.push(this.generateConfig(url, vc));
        });
        
        return Promise.all(allViews).then((views) => {
            views = views.flat();

            const coord = this.calculateCoordinates(views.length);
            
            for (let i = 0; i <views.length; i++) {
                views[i].setXYWH(...coord[i]);
            }

            return vc.toJSON();
        });
    }

    async generateConfig(url, vc) {
        let configType;
        try {
            configType = this.getFileType(url);
        } catch(err) {
            return Promise.reject(err);
        }
        
        const configTypeClassName = this.configClasses[configType].class;

        return this.get_asyncObject(configTypeClassName, url)
        .then((configInstance) => {

            const fileConfig = configInstance.composeFileConfig();
            const viewsConfig = configInstance.composeViewsConfig();

            const dataset = vc
            .addDataset(configInstance.fileName)
            .addFile(fileConfig);

            let layerControllerView = false;
            let spatialView = false;

            let views = [];

            viewsConfig.forEach(v => {
                const view = vc.addView(dataset, ...v);
                if (v[0] === "layerController") {
                    layerControllerView = view;
                }
                if (v[0] === "spatial") {
                    spatialView = view;
                }
                // this piece of code can be removed once these props are added by default to layerController
                // see this issue: https://github.com/vitessce/vitessce/issues/1454
                if (v[0] === "layerController" && configType === "OME-TIFF") {
                    view.setProps({
                        "disable3d": [],
                        "disableChannelsIfRgbDetected": true
                    });
                }
                // transpose the heatmap by default
                if (v[0] === "heatmap" && configType === "Anndata-ZARR") {
                    view.setProps({"transpose": true});
                }

                views.push(view);
            });

            if (layerControllerView && spatialView && configType === "Anndata-ZARR") {
                const spatialSegmentationLayerValue = {
                    "opacity": 1,
                    "radius": 0,
                    "visible": true,
                    "stroked": false
                }

                vc.linkViews(
                    [spatialView, layerControllerView], 
                    [CoordinationType.SPATIAL_ZOOM, CoordinationType.SPATIAL_TARGET_X, CoordinationType.SPATIAL_TARGET_Y, CoordinationType.SPATIAL_SEGMENTATION_LAYER],
                    [-5.5, 16000, 20000, spatialSegmentationLayerValue]
                )
            }

            return views;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
    }
};
