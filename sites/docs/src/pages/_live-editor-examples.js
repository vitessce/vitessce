
export const baseJson = `{
  "version": "1.0.15",
  "name": "My config",
  "description": "Test",
  "datasets": [],
  "coordinationSpace": {},
  "layout": [],
  "initStrategy": "auto"
}`;

export const baseJs = `const vc = new VitessceConfig({ schemaVersion: "1.0.15", name: "My config" });

// Return the view config as JSON.
return vc.toJSON();`;

export const exampleJs = `// Instantiate a view config object.
const vc = new VitessceConfig({
  schemaVersion: "1.0.15",
  name: "My example config",
  description: "This demonstrates the JavaScript API"
});
// Add a dataset and its files.
const baseUrl = "https://data-1.vitessce.io/0.0.33/main/eng-2019";
const dataset = vc
  .addDataset("Eng et al., Nature 2019")
  .addFile({
    url: baseUrl + '/eng_2019_nature.cells.csv',
    fileType: ft.OBS_EMBEDDING_CSV,
    coordinationValues: { obsType: "cell", embeddingType: "t-SNE" },
    options: { obsIndex: "cell_id", obsEmbedding: ["TSNE_1", "TSNE_2"] }
  })
  .addFile({
    url: baseUrl + '/eng_2019_nature.cells.csv',
    fileType: ft.OBS_EMBEDDING_CSV,
    coordinationValues: { obsType: "cell", embeddingType: "UMAP" },
    options: { obsIndex: "cell_id", obsEmbedding: ["UMAP_1", "UMAP_2"] }
  })
  .addFile({
    url: baseUrl + '/eng_2019_nature.cells.csv',
    fileType: ft.OBS_SETS_CSV,
    coordinationValues: { obsType: "cell" },
    options: { obsIndex: "cell_id", obsSets: [
      { name: "Leiden Clustering", column: "Leiden" },
      { name: "k-means Clustering", column: "Kmeans" }
    ] }
  });
// Add components.
// Use mapping: "UMAP" so that cells are mapped to the UMAP positions from the JSON file.
const umap = vc.addView(dataset, vt.SCATTERPLOT, { mapping: "UMAP" });
// Use mapping: "t-SNE" so that cells are mapped to the t-SNE positions from the JSON file.
const tsne = vc.addView(dataset, vt.SCATTERPLOT, { mapping: "t-SNE" });
// Add the cell sets controller component.
const cellSetsManager = vc.addView(dataset, vt.OBS_SETS);
// Add the cell set sizes bar plot component.
const cellSetSizesPlot = vc.addView(dataset, vt.OBS_SET_SIZES);
// Try un-commenting the line below to link the zoom levels of the two scatterplots!
//vc.linkViews([umap, tsne], [ct.EMBEDDING_ZOOM], [2.5]);
vc.layout(
  vconcat(
    hconcat(tsne, umap),
    hconcat(cellSetsManager, cellSetSizesPlot)
  )
);

// Return the view config as JSON.
return vc.toJSON();`;

export const exampleJson = `{
  "version": "1.0.15",
  "name": "My example config",
  "description": "This demonstrates the JSON schema",
  "datasets": [
    {
      "uid": "D1",
      "name": "Eng et al., Nature 2019",
      "files": [
        {
          "fileType": "obsEmbedding.csv",
          "url": "https://data-1.vitessce.io/0.0.33/main/eng-2019/eng_2019_nature.cells.csv",
          "coordinationValues": {
            "obsType": "cell",
            "embeddingType": "t-SNE"
          },
          "options": {
            "obsIndex": "cell_id",
            "obsEmbedding": ["TSNE_1", "TSNE_2"]
          }
        },
        {
          "fileType": "obsEmbedding.csv",
          "url": "https://data-1.vitessce.io/0.0.33/main/eng-2019/eng_2019_nature.cells.csv",
          "coordinationValues": {
            "obsType": "cell",
            "embeddingType": "UMAP"
          },
          "options": {
            "obsIndex": "cell_id",
            "obsEmbedding": ["UMAP_1", "UMAP_2"]
          }
        },
        {
          "fileType": "obsSets.csv",
          "url": "https://data-1.vitessce.io/0.0.33/main/eng-2019/eng_2019_nature.cells.csv",
          "coordinationValues": {
            "obsType": "cell"
          },
          "options": {
            "obsIndex": "cell_id",
            "obsSets": [
              {
                "name": "Leiden Clustering",
                "column": "Leiden"
              },
              {
                "name": "k-means Clustering",
                "column": "Kmeans"
              }
            ]
          }
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
    }
  },
  "layout": [
    {
      "component": "scatterplot",
      "coordinationScopes": {
        "dataset": "A",
        "embeddingType": "A"
      },
      "x": 6,
      "y": 0,
      "w": 6,
      "h": 6
    },
    {
      "component": "scatterplot",
      "coordinationScopes": {
        "dataset": "A",
        "embeddingType": "B"
      },
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 6
    },
    {
      "component": "obsSets",
      "coordinationScopes": {
        "dataset": "A"
      },
      "x": 0,
      "y": 6,
      "w": 6,
      "h": 6
    },
    {
      "component": "obsSetSizes",
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
