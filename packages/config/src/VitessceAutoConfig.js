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

function getOmeTiffOptions(fileUrl, fileName) {
    return {
        "images": [
            {
                "metadata": {
                    "isBitmask": false,
                },
                "name": fileName,
                "type": "ome-tiff",
                "url": fileUrl
            }
        ],
        "schemaVersion": "0.0.2",
        "usePhysicalSizeScaling": false
    }
}

export class VitessceAutoConfig {
    
    getFileName(fileUrl) {
        return fileUrl.split("/").at(-1);
    }

    supportedFileTypes = {
        "OME-TIFF": {
            "possibleExtensions": ["ome.tif"],
            "optionsConfigName": getOmeTiffOptions,
            "type": "ome-tiff",
            "fileType": "raster.json"
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

    getFileType(fileUrl) {
        let fileType = null;
        Object.keys(this.supportedFileTypes).forEach(key => {
          const matchingExtensions = this.supportedFileTypes[key].possibleExtensions.filter(ext => fileUrl.endsWith(ext));
          if (matchingExtensions.length === 1) {
            fileType = key;
            return key;
          }
        });
        return fileType;
    }

    generateConfig(fileUrl) {
        const fileType = this.getFileType(fileUrl);
        const fileName = this.getFileName(fileUrl);

        const vc = new VitessceConfig({
            schemaVersion: "1.0.15",
            name: "My example config",
            description: "This demonstrates the JavaScript API"
        });

        // Add a dataset and its files.
        const dataset = vc
        .addDataset("Auto generated config for a dataset")
        .addFile({
            fileType: this.supportedFileTypes[fileType].fileType,
            options: this.supportedFileTypes[fileType].optionsConfigName(fileUrl, fileName)
        });

        vc.addView(dataset, 'description', {"h": 4, "w": 3, "x": 0, "y": 8});
        vc.addView(dataset, 'spatial', {"h": 12, "w": 9, "x": 3, "y": 0});
        vc.addView(dataset, 'layerController', {"h": 8, "w": 3, "x": 0, "y": 0});
        return vc.toJSON();
    }
    
};
