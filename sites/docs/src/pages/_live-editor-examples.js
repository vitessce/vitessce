
export const baseJson = `{
  "version": "1.0.15",
  "name": "My config",
  "description": "Test",
  "datasets": [],
  "coordinationSpace": {},
  "layout": [],
  "initStrategy": "auto"
}`;


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
