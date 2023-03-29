import {
    VitessceConfig,
  } from './VitessceConfig';

import { CoordinationType, FileType } from '@vitessce/constants-internal';

class AbstractAutoConfig {

    async composeViewsConfig () {
        throw new Error('The composeViewsConfig() method has not been implemented.');
    }

    async composeFileConfig () {
        throw new Error('The composeFileConfig() method has not been implemented.');
    }

}
class OmeTiffAutoConfig extends AbstractAutoConfig{

    constructor(fileUrl) {
        super();
        this.fileUrl = fileUrl;
        this.fileType = FileType.RASTER_JSON;
        this.fileName = fileUrl.split("/").at(-1);
    }

    async composeViewsConfig() {
        return [
            ['description'],
            ['spatial'],
            ['layerController']
        ]
    }

    async composeFileConfig() {
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

}

class OmeZarrAutoConfig extends AbstractAutoConfig{
    
    constructor(fileUrl) {
        super();
        this.fileUrl = fileUrl;
        this.fileType = FileType.RASTER_OME_ZARR;
        this.fileName = fileUrl.split("/").at(-1);
    }

    async composeViewsConfig() {
        return [
            ['description'],
            ['spatial'],
            ['layerController'],
            ['status']
        ]
    }

    async composeFileConfig() {
        return {
            fileType: this.fileType,
            type: "raster",
            url: this.fileUrl
        }
    }

}

class AnndataZarrAutoConfig extends AbstractAutoConfig{

    constructor(fileUrl) {
        super();
        this.fileUrl = fileUrl;
        this.fileType = FileType.ANNDATA_ZARR;
        this.fileName = fileUrl.split("/").at(-1);
        this.metadataSummary = {};
    }

    async composeFileConfig() {

        this.metadataSummary = await this.downloadMetadata();

        let options = {
            "obsEmbedding": [],
            "obsFeatureMatrix": {
                "path": "X"
             }
        };

        this.metadataSummary["obsm"].forEach(key => {
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
    
        this.metadataSummary["obs"].forEach(key => {
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

    async composeViewsConfig() {

        this.metadataSummary = await this.downloadMetadata();
        
        let views = [];

        const hasCellSetData = this.metadataSummary["obs"]
            .find(key => key.toLowerCase().includes("cluster") || key.toLowerCase().includes("cell_type"));

        if (hasCellSetData.length > 0) {
            views.push(['obsSets']);
        }
    
        this.metadataSummary["obsm"].forEach(key => {
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

        if (this.metadataSummary["X"]) {
            views.push(["heatmap"]);
            views.push(["featureList"]);
        }

        return views;
    }

    async downloadMetadata() {

        if (Object.keys(this.metadataSummary).length > 0) {
            return this.metadataSummary;
        }

        const parseMetadataFile = (metadataFile) => {
            const obsmKeys = Object.keys(metadataFile.metadata)
            .filter(key => key.startsWith("obsm/X_"))
            .map(key => key.split("/.zarray")[0]);
        
            const obsKeysArr = Object.keys(metadataFile.metadata)
            .filter(key => key.startsWith("obs/") && !key.includes("obs/.") && !key.includes("obs/__"))
            .map(key => key.split("/.za")[0]);
        
            function uniq(a) {
            return a.sort().filter(function(item, pos, ary) {
                return !pos || item != ary[pos - 1];
            });
            }   
            const obsKeys = uniq(obsKeysArr);
            
            const X = Object.keys(metadataFile.metadata).filter(key => key.startsWith("X"));
    
            const out = {
                "obsm": obsmKeys,
                "obs": obsKeys,
                "X": X.length > 0? true: false
            }
            
            return out;
        }

        const metadataExtension = ".zmetadata";
        const url = [this.fileUrl, metadataExtension].join("/");
        return fetch(url).then((response) => {
            if (response.ok) {
              return response.json();
            }
            return Promise.reject(response);
        })
        .then((responseJson) => {
            return parseMetadataFile(responseJson);
        })
        .catch((error) => {
            if (error.status === 404) {
                const errorMssg = ["Could not generate config. File ", metadataExtension, " not found in supplied file URL. Check docs for more explanation."].join("");
                return Promise.reject(new Error(errorMssg));
            } 
        });        
    }
};

const configClasses = [
    {
        "extensions": ["ome.tif", ".ome.tiff", ".ome.tf2", ".ome.tf8"], // todo: test that ".ome.tf2", ".ome.tf8" work
        "class": OmeTiffAutoConfig
    },
    {
        "extensions": ["h5ad.zarr", ".adata.zarr", ".anndata.zarr"],
        "class": AnndataZarrAutoConfig
    },
    {
        "extensions": ["ome.zarr"],
        "class": OmeZarrAutoConfig
    }
]

function getFileType(url) {
    const match = configClasses.find(obj => obj.extensions.filter(
        ext => url.endsWith(ext)
    ).length === 1);
    if(!match) {
        // todo: adjust this code after speaking to Mark
        // connected with namings of OME-ZARR files. temporary change for testing puproses
        if (url.endsWith(".zarr")) {
            return OmeZarrAutoConfig;
        }
        throw new Error(`Could not generate config for URL: ${url}. This file type is not supported.`);
    }
    return match.class;
};

function calculateCoordinates(viewsNumb) {
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
};

async function generateConfig(url, vc) {
    let configClass;
    try {
        configClass = getFileType(url);
    } catch(err) {
        return Promise.reject(err);
    }

    const configInstance = new configClass(url);
    let fileConfig;
    let viewsConfig;
    try{
        fileConfig = await configInstance.composeFileConfig();
        viewsConfig = await configInstance.composeViewsConfig();
    }
    catch(error) {
        console.error(error);
        return Promise.reject(`Failed to generate config for URL: ${url}.`);
    };

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
        if (v[0] === "layerController" && configInstance instanceof OmeTiffAutoConfig) {
            view.setProps({
                "disable3d": [],
                "disableChannelsIfRgbDetected": true
            });
        }
        // transpose the heatmap by default
        if (v[0] === "heatmap" && configInstance instanceof AnndataZarrAutoConfig) {
            view.setProps({"transpose": true});
        }

        views.push(view);
    });

    if (layerControllerView && spatialView && configInstance instanceof AnndataZarrAutoConfig) {
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
}

export async function generateConfigs(fileUrls) {

    const vc = new VitessceConfig({
        schemaVersion: "1.0.15",
        name: "An automatically generated config. Adjust values and add layout components if needed.",
        description: "Populate with text relevant to this visualisation."
    });

    let allViews = [];

    fileUrls.forEach((url) => {
        allViews.push(generateConfig(url, vc));
    });
    
    return Promise.all(allViews).then((views) => {
        views = views.flat();

        const coord = calculateCoordinates(views.length);
        
        for (let i = 0; i <views.length; i++) {
            views[i].setXYWH(...coord[i]);
        }

        return vc.toJSON();
    });
};
