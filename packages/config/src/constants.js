const TRANSCRIPTOMICS_WITH_HEATMAP_VIEWS = {
  "obsSets": [4, 0, 4, 4],
  "obsSetSizes": [8, 0, 4, 4],
  "scatterplot": [0, 0, 4, 4],
  "heatmap": [0, 4, 8, 4],
  "featureList": [8, 4, 4, 4]
}

export const HINTS_CONFIG = {
  "E": {
    "hintType": ['AnnData-Zarr'],
    "hints": {
      "6": {
        "title": "Transcriptomics / scRNA-seq (with heatmap)",
        "views": TRANSCRIPTOMICS_WITH_HEATMAP_VIEWS,
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
        "title": "Spatial transcriptomics (with histology image and polygon cell segmentations)",
        "views": ["spatial", "spatial", "layerController", "obsSets", "featureList", "heatmap"]
      },
      "1": {
        "title": "Don't use any hints",
        "views": [],
      }
    }
  },
  "C": {
    "hintType": ['OME-Zarr'],
    "hints": {
      "2": {
        "title": "Image",
        "views": [],
      },
      "1": {
        "title": "Don't use any hints",
        "views": [],
      }
    }
  },
  "D": {
    "hintType": ['OME-TIFF'],
    "hints": {
      "2": {
        "title": "Image",
        "views": [],
      },
      "1": {
        "title": "Don't use any hints",
        "views": [],
      }
    }
  },
  "A": {
    "hintType": [],
    "hints": {
      "2": {
        "title": "Image",
        "views": [],

      },
      "1": {
        "title": "No hints available for this dataset type",
        "views": [],
      }
    }
  }
};