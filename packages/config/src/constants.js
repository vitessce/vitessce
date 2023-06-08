export const HINTS_CONFIG = {
  "E": {
    "hintType": ['AnnData-Zarr'],
    "hints": {
      "6": {
        "title": "Transcriptomics / scRNA-seq (with heatmap)",
        "views": ["scatterplot", "obsSets", "obsSetSizes", "heatmap", "featureList"]
      },
      "5": {
        "title": "Transcriptomics / scRNA-seq (without heatmap)",
        "views": ["scatterplot", "obsSets", "obsSetSizes", "featureList"]
      },
      "4": {
        "title": "Spatial transcriptomics (with polygon cell segmentations)",
        "views": ["scatterplot", "spatial", "obsSets", "obsSetSizes", "featureList", "heatmap"]
      },
      "3": {
        "title": "Chromatin accessibility / scATAC-seq (with heatmap)",
        "views": ["scatterplot", "obsSets", "obsSetSizes", "heatmap", "featureList", 
          {
            "coordinationValues": {
              "featureType": "peak",
            }
          }
        ]
      },
      "2": {
        "title": "Chromatin accessibility / scATAC-seq (without heatmap)",
        "views": ["scatterplot", "obsSets", "obsSetSizes", "featureList", 
          {
            "coordinationValues": {
              "featureType": "peak",
            }
          }
        ]
        },
      "1": {
        "title": "Don't use any hints",
        "views": [],
      },
    }
  },
  "B": {
    "hintType": ['OME-Zarr', 'AnnData-Zarr'],
    "hints": {
      "2": {
        "title": "Spatial transcriptomics (with histology image and polygon cell segmentations)"
      },
      "1": {
        "title": "Don't use any hints",
      }
    }
  },
  "C": {
    "hintType": ['OME-Zarr'],
    "hints": {
      "2": {
        "title": "Image"
      },
      "1": {
        "title": "Don't use any hints",
      }
    }
  },
  "D": {
    "hintType": ['OME-TIFF'],
    "hints": {
      "2": {
        "title": "Image"
      },
      "1": {
        "title": "Don't use any hints",
      }
    }
  },
  "A": {
    "hintType": [],
    "hints": {
      "2": {
        "title": "Image"
      },
      "1": {
        "title": "No hints available for this dataset type",
      }
    }
  }
};