import {
    VitessceConfig,
  } from '@vitessce/config';

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
            ['description',     {"h": 4, "w": 3, "x": 0, "y": 8}],
            ['spatial',         {"h": 12, "w": 9, "x": 3, "y": 0}],
            ['layerController', {"h": 8, "w": 3, "x": 0, "y": 0}]
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
}
class AnndataZarrAutoConfig {

    parseMeta() {
        // fileUrl = 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018-via-zarr/codeluppi_2018_nature_methods.cells.h5ad.zarr'
        // metaExt = ".zmetadata"
    
        // var request = new XMLHttpRequest();
        // request.open('GET', fileUrl, true);
        // request.responseType = 'blob';
        // request.onload = function() {
        //     var reader = new FileReader();
        //     reader.readAsDataURL(request.response);
        //     reader.onload =  function(e){
        //         console.log('DataURL:', e.target.result);
        //     };
        // };
        // request.send();
    
        // TODO: write out this func, which should look at fileUrl/.zmetadata file.
        const fileMeta = {
            "metadata": {
                ".zgroup": {
                    "zarr_format": 2
                },
                "X/.zarray": {
                    "chunks": [
                        2420,
                        33
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "<f4",
                    "fill_value": 0.0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839,
                        33
                    ],
                    "zarr_format": 2
                },
                "layers/.zgroup": {
                    "zarr_format": 2
                },
                "layers/X_uint8/.zarray": {
                    "chunks": [
                        4839,
                        33
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|u1",
                    "fill_value": 0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839,
                        33
                    ],
                    "zarr_format": 2
                },
                "obs/.zattrs": {
                    "_index": "CellID",
                    "column-order": [
                        "Cluster",
                        "Subcluster",
                        "Region"
                    ],
                    "encoding-type": "dataframe",
                    "encoding-version": "0.1.0"
                },
                "obs/.zgroup": {
                    "zarr_format": 2
                },
                "obs/CellID/.zarray": {
                    "chunks": [
                        4839
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|O",
                    "fill_value": 0,
                    "filters": [
                        {
                            "id": "vlen-utf8"
                        }
                    ],
                    "order": "C",
                    "shape": [
                        4839
                    ],
                    "zarr_format": 2
                },
                "obs/Cluster/.zarray": {
                    "chunks": [
                        4839
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|i1",
                    "fill_value": 0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839
                    ],
                    "zarr_format": 2
                },
                "obs/Cluster/.zattrs": {
                    "categories": "__categories/Cluster"
                },
                "obs/Region/.zarray": {
                    "chunks": [
                        4839
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|i1",
                    "fill_value": 0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839
                    ],
                    "zarr_format": 2
                },
                "obs/Region/.zattrs": {
                    "categories": "__categories/Region"
                },
                "obs/Subcluster/.zarray": {
                    "chunks": [
                        4839
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|i1",
                    "fill_value": 0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839
                    ],
                    "zarr_format": 2
                },
                "obs/Subcluster/.zattrs": {
                    "categories": "__categories/Subcluster"
                },
                "obs/__categories/.zgroup": {
                    "zarr_format": 2
                },
                "obs/__categories/Cluster/.zarray": {
                    "chunks": [
                        7
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|O",
                    "fill_value": 0,
                    "filters": [
                        {
                            "id": "vlen-utf8"
                        }
                    ],
                    "order": "C",
                    "shape": [
                        7
                    ],
                    "zarr_format": 2
                },
                "obs/__categories/Cluster/.zattrs": {
                    "ordered": false
                },
                "obs/__categories/Region/.zarray": {
                    "chunks": [
                        11
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|O",
                    "fill_value": 0,
                    "filters": [
                        {
                            "id": "vlen-utf8"
                        }
                    ],
                    "order": "C",
                    "shape": [
                        11
                    ],
                    "zarr_format": 2
                },
                "obs/__categories/Region/.zattrs": {
                    "ordered": false
                },
                "obs/__categories/Subcluster/.zarray": {
                    "chunks": [
                        31
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|O",
                    "fill_value": 0,
                    "filters": [
                        {
                            "id": "vlen-utf8"
                        }
                    ],
                    "order": "C",
                    "shape": [
                        31
                    ],
                    "zarr_format": 2
                },
                "obs/__categories/Subcluster/.zattrs": {
                    "ordered": false
                },
                "obsm/.zgroup": {
                    "zarr_format": 2
                },
                "obsm/X_centroid/.zarray": {
                    "chunks": [
                        4839,
                        2
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "<f4",
                    "fill_value": 0.0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839,
                        2
                    ],
                    "zarr_format": 2
                },
                "obsm/X_pca/.zarray": {
                    "chunks": [
                        2420,
                        32
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "<f4",
                    "fill_value": 0.0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839,
                        32
                    ],
                    "zarr_format": 2
                },
                "obsm/X_segmentations/.zarray": {
                    "chunks": [
                        4839,
                        8,
                        2
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "<u2",
                    "fill_value": 0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839,
                        8,
                        2
                    ],
                    "zarr_format": 2
                },
                "obsm/X_spatial/.zarray": {
                    "chunks": [
                        4839,
                        2
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "<f4",
                    "fill_value": 0.0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839,
                        2
                    ],
                    "zarr_format": 2
                },
                "obsm/X_tsne/.zarray": {
                    "chunks": [
                        4839,
                        2
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "<f4",
                    "fill_value": 0.0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839,
                        2
                    ],
                    "zarr_format": 2
                },
                "obsm/X_umap/.zarray": {
                    "chunks": [
                        4839,
                        2
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "<f4",
                    "fill_value": 0.0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        4839,
                        2
                    ],
                    "zarr_format": 2
                },
                "var/.zattrs": {
                    "_index": "Gene",
                    "column-order": [
                        "Fluorophore",
                        "Hybridization"
                    ],
                    "encoding-type": "dataframe",
                    "encoding-version": "0.1.0"
                },
                "var/.zgroup": {
                    "zarr_format": 2
                },
                "var/Fluorophore/.zarray": {
                    "chunks": [
                        33
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|i1",
                    "fill_value": 0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        33
                    ],
                    "zarr_format": 2
                },
                "var/Fluorophore/.zattrs": {
                    "categories": "__categories/Fluorophore"
                },
                "var/Gene/.zarray": {
                    "chunks": [
                        33
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|O",
                    "fill_value": 0,
                    "filters": [
                        {
                            "id": "vlen-utf8"
                        }
                    ],
                    "order": "C",
                    "shape": [
                        33
                    ],
                    "zarr_format": 2
                },
                "var/Hybridization/.zarray": {
                    "chunks": [
                        33
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "<i8",
                    "fill_value": 0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        33
                    ],
                    "zarr_format": 2
                },
                "var/__categories/.zgroup": {
                    "zarr_format": 2
                },
                "var/__categories/Fluorophore/.zarray": {
                    "chunks": [
                        3
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "|O",
                    "fill_value": 0,
                    "filters": [
                        {
                            "id": "vlen-utf8"
                        }
                    ],
                    "order": "C",
                    "shape": [
                        3
                    ],
                    "zarr_format": 2
                },
                "var/__categories/Fluorophore/.zattrs": {
                    "ordered": false
                },
                "varm/.zgroup": {
                    "zarr_format": 2
                },
                "varm/PCs/.zarray": {
                    "chunks": [
                        33,
                        32
                    ],
                    "compressor": {
                        "blocksize": 0,
                        "clevel": 5,
                        "cname": "lz4",
                        "id": "blosc",
                        "shuffle": 1
                    },
                    "dtype": "<f4",
                    "fill_value": 0.0,
                    "filters": null,
                    "order": "C",
                    "shape": [
                        33,
                        32
                    ],
                    "zarr_format": 2
                }
            },
            "zarr_consolidated_format": 1
        };
    
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

        return {
            "obsm": obsmKeys,
            "obs": obsKeys,
            "X": X.length > 0? true: false
        }
    
    }

    constructor(fileUrl) {
        this.fileUrl = fileUrl;
        this.fileType = "anndata.zarr";
        this.meta = this.parseMeta(fileUrl);
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
        "OME_ZARR": {
            "extensions": ["ome.zarr"],
            "class": "NOT IMPLEMENTED"
        }
    }

    constructor(fileUrl) {
        this.fileUrl = fileUrl;
    }

    getFileType() {
        let fileType = null;
        Object.keys(this.configClasses).forEach(key => {
            const matchingExtensions = this.configClasses[key]["extensions"].filter(ext => this.fileUrl.endsWith(ext));
            if (matchingExtensions.length === 1) {
                fileType = key;
                return key;
            }
        });
        return fileType;
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

    generateConfig() {
        const configType = this.getFileType();
        const configTypeClassName = this.configClasses[configType].class;
        const confInst = new configTypeClassName(this.fileUrl);

        const vc = new VitessceConfig({
            schemaVersion: "1.0.15",
            name: "My example config",
            description: "This demonstrates the JavaScript API"
        });

        const fileConfig = confInst.composeFileConfig()
        const viewsConfig = confInst.composeViewsConfig()

        const dataset = vc
        .addDataset("Auto generated config for a dataset")
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
            if (v[0] === "layerController" && configType === "OME-TIFF") {
                view.setProps({
                    "disable3d": [],
                    "disableChannelsIfRgbDetected": true
                });
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

        const coord = this.calculateCoordinates(views.length);

        for (let i = 0; i <views.length; i++) {
            views[i].setXYWH(...coord[i]);
        }

        return vc.toJSON();
    }
};
