import {
    VitessceConfig
  } from '@vitessce/config';

const baseConfig = {
    "version": "1.0.15",
    "name": "My config",
    "description": "Test",
    "datasets": [],
    "coordinationSpace": {},
    "layout": [],
    "initStrategy": "auto"
}

const defaultConfigOME_TIFF = {
    "name": "Auto config for ome-tiff file formats",
    "description": "bla blbaalbla blbalblabal",
    "datasets": [
        {
            "files": [
                {
                    "fileType": "raster.json",
                    "options": {
                        "images": [
                            {
                                "metadata": {
                                    "isBitmask": false,
                                },
                                "name": "TODO",
                                "type": "ome-tiff",
                                "url": "TODO"
                            }
                        ],
                        "schemaVersion": "0.0.2",
                        "usePhysicalSizeScaling": false
                    },
                    "type": "raster"
                },
            ],
            "name": "Visualization Files",
            "uid": "A"
        }
    ],
    "coordinationSpace": {
        "dataset": {
            "A": "A"
        }
    },
    "layout": [
        {
            "component": "spatial",
            "coordinationScopes": {
                "dataset": "A"
            },
            "h": 12,
            "w": 9,
            "x": 3,
            "y": 0
        },
        {
            "component": "description",
            "coordinationScopes": {
                "dataset": "A"
            },
            "h": 4,
            "w": 3,
            "x": 0,
            "y": 8
        },
        {
            "component": "layerController",
            "coordinationScopes": {
                "dataset": "A"
            },
            "h": 8,
            "props": {
                "disable3d": [],
                "disableChannelsIfRgbDetected": true
            },
            "w": 3,
            "x": 0,
            "y": 0
        }
    ],
    "initStrategy": "auto"
}

const supportedFileTypes = {
    "OME-TIFF": {
        "possibleExtensions": ["ome.tif"],
        "defaultConfig": defaultConfigOME_TIFF,
        "type": "ome-tiff",
    },
    "OME-ZARR": {
        "possibleExtensions": ["ome.zarr"],
        "defaultConfig": {},
        "type": "NOT DEFINED",
    },
    "Anndata-ZARR": {
        "possibleExtensions": ["h5ad.zarr", ".adata.zarr", ".anndata.zarr"],
        "defaultConfig": {},
        "type": "NOT DEFINED",
    }
};

export class VitessceAutoConfig {
    
    findFileType(fileUrl) {
        let fileType = null;
        Object.keys(supportedFileTypes).forEach(key => {
          const matchingExtensions = supportedFileTypes[key].possibleExtensions.filter(ext => fileUrl.endsWith(ext));
          if (matchingExtensions.length === 1) {
            fileType = key;
            return key;
          }
        });
        return fileType;
    }

    generateConfig(fileUrl) {
        const vc = new VitessceConfig({
            schemaVersion: "1.0.15",
            name: "My example config",
            description: "This demonstrates the JavaScript API"
        });

        // Add a dataset and its files.
        const dataset = vc
        .addDataset("Auto generated config for a dataset")
        .addFile({
            url: fileUrl,
            fileType: supportedFileTypes[this.findFileType(fileUrl)].type,
            coordinationValues: { obsType: "cell", embeddingType: "t-SNE" },
            options: { obsIndex: "cell_id", obsEmbedding: ["TSNE_1", "TSNE_2"] }
        });

        return vc.toJSON();
    }
    
};
