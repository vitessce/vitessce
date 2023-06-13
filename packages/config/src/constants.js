const SINGLE_CELL_WITH_HEATMAP_VIEWS = {
  "obsSets": [4, 0, 4, 4],
  "obsSetSizes": [8, 0, 4, 4],
  "scatterplot": [0, 0, 4, 4],
  "heatmap": [0, 4, 8, 4],
  "featureList": [8, 4, 4, 4]
}

const SINGLE_CELL_WITHOUT_HEATMAP_VIEWS = {
  "obsSets": [10, 6, 2, 6],
  "obsSetSizes": [8, 1, 4, 6],
  "scatterplot": [0, 0, 8, 12],
  "featureList": [8, 6, 2, 6]
}

const SPATIAL_TRANSCRIPTOMICS_VIEWS = {
  "scatterplot": [0, 0, 3, 4],
  "spatial": [3, 0, 5, 4],
  "obsSets": [8, 0, 4, 2],
  "featureList": [8, 0, 4, 2],
  "heatmap": [0, 4, 6, 4],
  "obsSetFeatureValueDistribution": [6, 4, 6, 4]
}

const SPATIAL_TRANSCRIPTOMICS_WITH_HSITOLOGY_VIEWS = {
  "spatial": [0, 0, 6, 6],
  "heatmap": [0, 6, 8, 6],
  "layerController": [8, 6, 4, 6],
  "obsSets": [9, 0, 3, 6],
  "featureList": [6, 0, 3, 6],
}

const IMAGE_VIEWS = {
  "spatial": [0, 0, 8, 12],
  "layerController": [8, 0, 4, 7],
  "description": [8, 9, 4, 5],
}

const DEFAULT_CONFIG = {
  "title": "Don't use any hints",
  "views": {},
  "coordinationValues": {}
}

export const HINTS_CONFIG = {
  "E": {
    "hintType": ['AnnData-Zarr'],
    "hints": {
      "6": {
        ...DEFAULT_CONFIG,
        "title": "Transcriptomics / scRNA-seq (with heatmap)",
        "views": SINGLE_CELL_WITH_HEATMAP_VIEWS,
      },
      "5": {
        ...DEFAULT_CONFIG,
        "title": "Transcriptomics / scRNA-seq (without heatmap)",
        "views": SINGLE_CELL_WITHOUT_HEATMAP_VIEWS,
      },
      "4": {
        ...DEFAULT_CONFIG,
        "title": "Spatial transcriptomics (with polygon cell segmentations)",
        "views": SPATIAL_TRANSCRIPTOMICS_VIEWS,
      },
      "3": {
        ...DEFAULT_CONFIG,
        "title": "Chromatin accessibility / scATAC-seq (with heatmap)",
        "views": SINGLE_CELL_WITH_HEATMAP_VIEWS, 
        "coordinationValues": {
          "featureType": "peak",
        }
      },
      "2": {
        ...DEFAULT_CONFIG,
        "title": "Chromatin accessibility / scATAC-seq (without heatmap)",
        "views": SINGLE_CELL_WITHOUT_HEATMAP_VIEWS, 
        "coordinationValues": {
          "featureType": "peak",
        }
        },
      "1": DEFAULT_CONFIG,
    }
  },
  "B": {
    "hintType": ['OME-TIFF', 'AnnData-Zarr'],
    "hints": {
      "2": {
        ...DEFAULT_CONFIG,
        "title": "Spatial transcriptomics (with histology image and polygon cell segmentations)",
        "views": SPATIAL_TRANSCRIPTOMICS_WITH_HSITOLOGY_VIEWS,
        "options": { // todo: this should be deleted, but leaving them for this specifig config for now
          "obsFeatureMatrix": {
            "path": "obsm/X_hvg",
            "featureFilterPath": "var/highly_variable"
          },
          "obsLocations": {
            "path": "obsm/spatial"
          },
          "obsSegmentations": {
            "path": "obsm/segmentations"
          }
        }
      },
      "1": DEFAULT_CONFIG,
    }
  },
  "C": {
    "hintType": ['OME-TIFF'],
    "hints": {
      "2": {
        ...DEFAULT_CONFIG,
        "title": "Image",
        "views": IMAGE_VIEWS,
      },
      "1": DEFAULT_CONFIG,
    }
  },
  "D": {
    "hintType": [],
    "hints": {
      "1": {
        ...DEFAULT_CONFIG,
        "title": "No hints available for this dataset type",
      }
    }
  }
};