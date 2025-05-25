/*export const spatialQueryConfig = {
    "coordinationSpace": {
      "dataset": {
        "A": "A"
      },
      "embeddingType": {
        "A": "UMAP"
      },
      "obsLabelsType": {
        "A": "Predicted CL ID",
        "B": "Marker Gene 0",
        "C": "Marker Gene 1",
        "D": "Marker Gene 2",
        "E": "Marker Gene 3",
        "F": "Marker Gene 4"
      },
      "spatialSegmentationLayer": {
        "A": {
          "opacity": 1,
          "radius": 20,
          "stroked": false,
          "visible": true
        }
      }
    },
    "datasets": [
      {
        "files": [
          {
            "fileType": "anndata.zarr",
            "options": {
              "featureLabels": {
                "path": "var/hugo_symbol"
              },
              "obsEmbedding": [
                {
                  "dims": [
                    0,
                    1
                  ],
                  "embeddingType": "UMAP",
                  "path": "obsm/X_umap"
                }
              ],
              "obsFeatureMatrix": {
                "initialFeatureFilterPath": "var/marker_genes_for_heatmap",
                "path": "X"
              },
              "obsLabels": [
                {
                  "obsLabelsType": "Predicted CL ID",
                  "path": "obs/predicted_CLID"
                },
                {
                  "obsLabelsType": "Marker Gene 0",
                  "path": "obs/marker_gene_0"
                },
                {
                  "obsLabelsType": "Marker Gene 1",
                  "path": "obs/marker_gene_1"
                },
                {
                  "obsLabelsType": "Marker Gene 2",
                  "path": "obs/marker_gene_2"
                },
                {
                  "obsLabelsType": "Marker Gene 3",
                  "path": "obs/marker_gene_3"
                },
                {
                  "obsLabelsType": "Marker Gene 4",
                  "path": "obs/marker_gene_4"
                }
              ],
              "obsSpots": {
                "path": "obsm/X_spatial"
              },
              "obsSets": [
                {
                  "name": "Cell Ontology Annotation",
                  "path": "obs/predicted_label"
                },
                {
                  "name": "Leiden",
                  "path": "obs/leiden"
                }
              ]
            },
            "url": "https://assets.hubmapconsortium.org/aeaaa0536b87935ad50cf69f1a0c3b1a/hubmap_ui/anndata-zarr/secondary_analysis.zarr"
          }
        ],
        "name": "aeaaa0536b87935ad50cf69f1a0c3b1a",
        "uid": "A"
      }
    ],
    "description": "",
    "initStrategy": "auto",
    "layout": [
      {
        "component": "scatterplot",
        "coordinationScopes": {
          "dataset": "A",
          "embeddingType": "A",
          "obsLabelsType": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "h": 6,
        "w": 4,
        "x": 0,
        "y": 0
      },
      {
        "component": "obsSets",
        "coordinationScopes": {
          "dataset": "A",
          "obsLabelsType": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "h": 3,
        "w": 3,
        "x": 9,
        "y": 0
      },
      {
        "component": "featureList",
        "coordinationScopes": {
          "dataset": "A",
          "obsLabelsType": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "h": 3,
        "w": 3,
        "x": 9,
        "y": 4
      },
      {
        "component": "spatialQueryManager",
        "coordinationScopes": {
          "dataset": "A",
          "obsLabelsType": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "h": 4,
        "w": 5,
        "x": 7,
        "y": 6
      },
      {
        "component": "heatmap",
        "coordinationScopes": {
          "dataset": "A",
          "obsLabelsType": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "h": 4,
        "w": 7,
        "x": 0,
        "y": 6
      },
      {
        "component": "spatialBeta",
        "coordinationScopes": {
          "dataset": "A",
          "obsLabelsType": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ],
          "spatialSegmentationLayer": "A"
        },
        "h": 6,
        "w": 5,
        "x": 4,
        "y": 0
      }
    ],
    "name": "aeaaa0536b87935ad50cf69f1a0c3b1a",
    "version": "1.0.15"
  };*/

  /* eslint-disable max-len */
  import {
    VitessceConfig,
    // eslint-disable-next-line no-unused-vars
    CoordinationLevel as CL,
    hconcat,
    vconcat,
    getInitialCoordinationScopeName,
  } from '@vitessce/config';
  
  // Reference: https://portal.hubmapconsortium.org/browse/dataset/cf31f5390569737fc1a85a57752eff67
  
  function generateSpatialQueryConfig() {
    const config = new VitessceConfig({
      schemaVersion: '1.0.17',
      name: 'SpatialQuery',
    });
    const dataset = config.addDataset('My dataset').addFile({
      fileType: 'anndata.zarr',
      url: 'https://assets.hubmapconsortium.org/aeaaa0536b87935ad50cf69f1a0c3b1a/hubmap_ui/anndata-zarr/secondary_analysis.zarr',
      options: {
        obsFeatureMatrix: {
          path: 'obsm/X',
          initialFeatureFilterPath: "var/marker_genes_for_heatmap",
        },
        obsSpots: {
          path: 'obsm/X_spatial',
        },
        obsEmbedding: [
          {
            path: 'obsm/X_umap',
            embeddingType: 'UMAP',
          },
        ],
        obsSets: [
            {
                "name": "Cell Ontology Annotation",
                "path": "obs/predicted_label"
            },
            {
                "name": "Leiden",
                "path": "obs/leiden"
            }
        ],
      },
      coordinationValues: {
        obsType: 'spot',
      },
    });
  
    const spatialViewSimple = config.addView(dataset, 'spatialBeta');
    const lcViewSimple = config.addView(dataset, 'layerControllerBeta');
    const obsSets = config.addView(dataset, 'obsSets');
    const featureList = config.addView(dataset, 'featureList');
    const sqManager = config.addView(dataset, 'spatialQueryManager');
  
    config.linkViews([obsSets, featureList, spatialViewSimple, lcViewSimple, sqManager], ['obsType'], ['spot']);
    
    config.layout(hconcat(spatialViewSimple, vconcat(vconcat(lcViewSimple, hconcat(obsSets, featureList)), sqManager)));
  
    const configJSON = config.toJSON();
    return configJSON;
  }
  
  export const spatialQueryConfig = generateSpatialQueryConfig();
  