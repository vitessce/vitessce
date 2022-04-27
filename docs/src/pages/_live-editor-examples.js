
export const baseJson = `{
  "version": "2.0.0",
  "name": "My config",
  "description": "Test",
  "datasets": [],
  "coordinationSpace": {},
  "layout": [],
  "initStrategy": "auto"
}`;

export const baseJs = `const vc = new VitessceConfig("My config");

// Return the view config as JSON.
return vc.toJSON();`;

export const exampleJs = `// Instantiate a view config object.
const vc = new VitessceConfig("My example config", "This demonstrates the JavaScript API");
// Add a dataset and its files.
const baseUrl = "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries";
const dataset = vc
  .addDataset("Dries")
  .addFile(baseUrl + '/dries.cells.json', dt.OBS, ft.CELLS_JSON)
  .addFile(baseUrl + '/dries.cell-sets.json', dt.OBS_SETS, ft.CELL_SETS_JSON);
// Add components.
// Use mapping: "UMAP" so that cells are mapped to the UMAP positions from the JSON file.
const umap = vc.addView(dataset, vt.OBS_SCATTERPLOT, { mapping: "UMAP" });
// Use mapping: "t-SNE" so that cells are mapped to the t-SNE positions from the JSON file.
const tsne = vc.addView(dataset, vt.OBS_SCATTERPLOT, { mapping: "t-SNE" });
// Add the cell sets controller component.
const cellSetsManager = vc.addView(dataset, vt.OBS_SETS);
// Add the cell set sizes bar plot component.
const cellSetSizesPlot = vc.addView(dataset, vt.OBS_SET_SIZES);
// Link the zoom levels of the two scatterplots.
vc.linkViews([umap, tsne], [ct.EMBEDDING_ZOOM], [2.5]);
// Try un-commenting the line below to link center points of the two scatterplots!
//vc.linkViews([umap, tsne], [ct.EMBEDDING_TARGET_X, ct.EMBEDDING_TARGET_Y], [0, 0]);
vc.layout(
  vconcat(
    hconcat(tsne, umap),
    hconcat(cellSetsManager, cellSetSizesPlot)
  )
);

// Return the view config as JSON.
return vc.toJSON();`;

export const exampleJson = `{
  "version": "2.0.0",
  "name": "My example config",
  "description": "This demonstrates the JSON schema",
  "datasets": [
    {
      "uid": "d1",
      "name": "Dries",
      "files": [
        {
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries/dries.cells.json",
          "dataType": "obs",
          "fileType": "cells.json"
        },
        {
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries/dries.cell-sets.json",
          "dataType": "obsSets",
          "fileType": "cellSets.json"
        }
      ]
    }
  ],
  "coordinationSpace": {
    "dataset": {
      "A": "D1"
    },
    "embeddingType": {
      "A": "UMAP",
      "B": "t-SNE"
    },
    "embeddingZoom": {
      "A": 2.5
    }
  },
  "layout": [
    {
      "viewType": "obsScatterplot",
      "uid": "v1",
      "coordinationScopes": {
        "dataset": "A",
        "embeddingType": "A",
        "embeddingZoom": "A"
      },
      "x": 6,
      "y": 0,
      "w": 6,
      "h": 6
    },
    {
      "viewType": "obsScatterplot",
      "uid": "v2",
      "coordinationScopes": {
        "dataset": "A",
        "embeddingType": "B",
        "embeddingZoom": "A"
      },
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 6
    },
    {
      "viewType": "obsSets",
      "uid": "v3",
      "coordinationScopes": {
        "dataset": "A"
      },
      "x": 0,
      "y": 6,
      "w": 6,
      "h": 6
    },
    {
      "viewType": "obsSetSizes",
      "uid": "v4",
      "coordinationScopes": {
        "dataset": "A"
      },
      "x": 6,
      "y": 6,
      "w": 6,
      "h": 6
    }
  ],
  "initStrategy": "auto"
}`;
