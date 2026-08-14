const ORION_LANDING_DESCRIPTION = 'Demonstrates Minerva-story compatibility: Orion multimodal imaging (18-plex immunofluorescence + H&E) of a colorectal cancer specimen, presented as a guided annotation tour matching the original Minerva narrative.';

const ORION_DESCRIPTION = "Orion is an innovative multimodal imaging method that allows the rapid acquisition of 18-plex immunofluorescence and H&E images from the same sample.\n\nIt combines clinical-standard H&E images with multiplexed immunofluorescence, to leverage the advantages of both techniques. While H&E images provide robust morphological details, multiplexed immunofluorescence offers deep phenotyping capabilities.\n\nIn this Minerva story, we showcase how multimodal data obtained through Orion provides greater clarity than multiplexed immunofluorescence or H&E imaging data alone.\n\nWe used 40 samples, including the one presented here, to train machine learning models to identify potential biomarkers that can predict progression-free survival outcomes. To delve deeper into the details of this particular specimen, you can refer to the “Metadata about this sample” (page 15).\n\n Visit tissue-atlas.org/atlas-datasets/lin-chen-campton-2023 (https://www.tissue-atlas.org/atlas-datasets/lin-chen-campton-2023/) to learn more.\n\nAttribution:\nPlease cite with the following conventions:\nPublication and underlying data\nLin, J.R., Chen, Y.A., Campton, D., et al., High-plex immunofluorescence imaging and traditional histology of the same tissue section for discovering image-based biomarkers. Nature Cancer, 2023, DOI: 10.1038/s43018-023-00576-1 (https://doi.org/10.1038/s43018-023-00576-1).\n\nThis Minerva Story\nJuliann Tefft, Yu-An Chen, Shannon Coy, Jia-Ren Lin, and Sarah Arena. Multimodal spatial profiling of colorectal cancer using Orion. Harvard Dataverse. V1, 2023, DOI: 10.7910/DVN/76DTDF (https://doi.org/10.7910/DVN/76DTDF).\n\nHow to use Minerva\nTo navigate through Minerva, simply click the right arrow at the top of this panel to progress through the narration. You can pan and zoom within the image at any time and return to the narration by toggling the arrows. Additionally, you can adjust the visible channels and access plain language descriptions of each channel by clicking the gear icon near the legend. Some channels include a lens that allows you to see the overlap between channels. On these pages, you can pick up and put down the lens, make it larger or smaller by dragging the lower right arrow, and fade the lens by pulling the semi-circle dial to the left. In the right column, we have pre-selected several channel groups for your convenience. Feel free to click on a different channel group at any time to explore a new set of markers.";

export const annotationsMinervaOrionCrc04 = {
  "name": "Annotation Frames — Orion Multimodal CRC (Minerva compatibility)",
  "description": ORION_LANDING_DESCRIPTION,
  "version": "1.0.0",
  "initStrategy": "auto",
  "datasets": [
    {
      "uid": "minerva",
      "name": "Minerva story",
      "files": [
        {
          "type": "raster",
          "fileType": "raster.json",
          "url": "https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/annotationsMinervaOrion.raster.json"
        }
      ]
    }
  ],
  "coordinationSpace": {
    "spatialZoom": {
      "A": -6.7656
    },
    "spatialTargetX": {
      "A": 33156
    },
    "spatialTargetY": {
      "A": 19073
    },
    "spatialImageLayer": {
      "A": [
        {
          "type": "raster",
          "index": 0,
          "visible": true,
          "colormap": null,
          "opacity": 1,
          "domainType": "Min/Max",
          "transparentColor": null,
          "renderingMode": "Additive",
          "use3d": false,
          "channels": [
            {
              "selection": {
                "z": 0,
                "t": 0,
                "c": 0
              },
              "color": [
                255,
                255,
                255
              ],
              "visible": true,
              "slider": [
                1965,
                12658
              ]
            },
            {
              "selection": {
                "z": 0,
                "t": 0,
                "c": 2
              },
              "color": [
                255,
                255,
                0
              ],
              "visible": true,
              "slider": [
                645,
                975
              ]
            },
            {
              "selection": {
                "z": 0,
                "t": 0,
                "c": 3
              },
              "color": [
                255,
                0,
                255
              ],
              "visible": true,
              "slider": [
                414,
                4355
              ]
            },
            {
              "selection": {
                "z": 0,
                "t": 0,
                "c": 17
              },
              "color": [
                0,
                255,
                255
              ],
              "visible": true,
              "slider": [
                218,
                4055
              ]
            },
            {
              "selection": {
                "z": 0,
                "t": 0,
                "c": 18
              },
              "color": [
                255,
                0,
                0
              ],
              "visible": true,
              "slider": [
                271,
                1835
              ]
            }
          ]
        },
        {
          "type": "raster",
          "index": 1,
          "visible": false,
          "colormap": null,
          "opacity": 1,
          "domainType": "Min/Max",
          "transparentColor": [
            0,
            0,
            0
          ],
          "renderingMode": "Additive",
          "use3d": false,
          "channels": [
            {
              "selection": {
                "z": 0,
                "t": 0,
                "c": 0
              },
              "color": [
                255,
                0,
                0
              ],
              "visible": true,
              "slider": [
                0,
                255
              ]
            }
          ]
        }
      ]
    },
    "annotationFrameIndex": {
      "A": null
    },
    "annotationOverlayVisible": {
      "A": true
    },
    "annotationDescription": {
      "A": ORION_DESCRIPTION
    },
    "annotationDataType": {
      "A": "data"
    },
    "annotationDataUrl": {
      "A": 'https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/annotationsMinervaOrion.frames.json'
    }
  },
  "layout": [
    {
      "component": "spatial",
      "props": {
        "coordinatesVisible": true,
        "logClickCoords": true
      },
      "coordinationScopes": {
        "spatialZoom": "A",
        "spatialTargetX": "A",
        "spatialTargetY": "A",
        "spatialImageLayer": "A",
        "annotationFrames": "A",
        "annotationFrameIndex": "A",
        "annotationOverlayVisible": "A"
      },
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 12
    },
    {
      "component": "layerController",
      "coordinationScopes": {
        "spatialZoom": "A",
        "spatialTargetX": "A",
        "spatialTargetY": "A",
        "spatialImageLayer": "A"
      },
      "x": 6,
      "y": 0,
      "w": 3,
      "h": 12
    },
    {
      "component": "annotationController",
      "coordinationScopes": {
        "annotationFrames": "A",
        "annotationFrameIndex": "A",
        "annotationOverlayVisible": "A",
        "annotationDescription": "A",
        "spatialZoom": "A",
        "spatialTargetX": "A",
        "spatialTargetY": "A",
        "annotationDataType": "A",
        "annotationDataUrl": "A"
      },
      "x": 9,
      "y": 0,
      "w": 3,
      "h": 12
    }
  ]
};
