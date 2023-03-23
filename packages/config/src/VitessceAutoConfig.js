import {
    VitessceConfig
  } from '@vitessce/config';

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

function addOmeTiffViews(dataset, vc) {
    vc.addView(dataset, 'description', {"h": 4, "w": 3, "x": 0, "y": 8});
    vc.addView(dataset, 'spatial', {"h": 12, "w": 9, "x": 3, "y": 0});
    vc.addView(dataset, 'layerController', {"h": 8, "w": 3, "x": 0, "y": 0});
}

export class VitessceAutoConfig {
    
    getFileName(fileUrl) {
        return fileUrl.split("/").at(-1);
    }

    supportedFileTypes = {
        "OME-TIFF": {
            "possibleExtensions": ["ome.tif"],
            "optionsConfigFn": getOmeTiffOptions,
            "addViewsFn": addOmeTiffViews,
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
            options: this.supportedFileTypes[fileType].optionsConfigFn(fileUrl, fileName)
        });
        this.supportedFileTypes[fileType].addViewsFn(dataset, vc);
        return vc.toJSON();
    }
    
};
