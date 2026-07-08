const S3_BASE = 'https://lin-2023-orion-crc.s3.amazonaws.com/data/CRC04';

export const annotationsMinervaOrionCrc04 = {
    "name": "Minerva import",
    "description": "Orion is an innovative multimodal imaging method that allows the rapid acquisition of 18-plex immunofluorescence and H&E images from the same sample. ",
    "version": "1.0.0",
    "initStrategy": "auto",
    "datasets": [
      {
        "uid": "minerva",
        "name": "Minerva story",
        "files": [
          {
            "fileType": "image.ome-tiff",
            "url": `${S3_BASE}/P37_S32_A24_C59kX_E15_20220106_014630_553652-zlib.ome.tiff`
          },
          {
            "fileType": "image.ome-tiff",
            "url": `${S3_BASE}/18459_LSP10388_US_SCAN_OR_001__091155-registered.ome.tif`
          }
        ]
      }
    ],
    "coordinationSpace": {
      "spatialZoom": {
        "A": -6.3988
      },
      "spatialTargetX": {
        "A": 33156
      },
      "spatialTargetY": {
        "A": 19073
      },
      "annotationFrameIndex": {
        "A": null
      },
      "annotationOverlayVisible": {
        "A": true
      },
      "annotationDescription": {
        "A": "Orion is an innovative multimodal imaging method that allows the rapid acquisition of 18-plex immunofluorescence and H&E images from the same sample. \n\nIt combines clinical-standard H&E images with multiplexed immunofluorescence, to leverage the advantages of both techniques. While H&E images provide robust morphological details, multiplexed immunofluorescence offers deep phenotyping capabilities. \n\nIn this Minerva story, we showcase how multimodal data obtained through Orion provides greater clarity than multiplexed immunofluorescence or H&E imaging data alone. \n\nWe used 40 samples, including the one presented here, to train machine learning models to identify potential biomarkers that can predict progression-free survival outcomes. _To delve deeper into the details of this particular specimen, you can refer to the **“Metadata about this sample” (page 15)**._ \n\n **Visit [tissue-atlas.org/atlas-datasets/lin-chen-campton-2023](https://www.tissue-atlas.org/atlas-datasets/lin-chen-campton-2023/) to learn more.** \n\n### Attribution:  \n*Please cite with the following conventions:*  \n**Publication and underlying data**  \nLin, J.R., Chen, Y.A., Campton, D., et al., High-plex immunofluorescence imaging and traditional histology of the same tissue section for discovering image-based biomarkers. *Nature Cancer*, 2023, [DOI: 10.1038/s43018-023-00576-1](https://doi.org/10.1038/s43018-023-00576-1).  \n\n**This Minerva Story**  \nJuliann Tefft, Yu-An Chen, Shannon Coy, Jia-Ren Lin, and Sarah Arena. Multimodal spatial profiling of colorectal cancer using Orion. Harvard Dataverse. V1, 2023, [DOI: 10.7910/DVN/76DTDF](https://doi.org/10.7910/DVN/76DTDF). \n\n### How to use Minerva\nTo navigate through Minerva, simply click the right arrow at the top of this panel to progress through the narration. You can pan and zoom within the image at any time and return to the narration by toggling the arrows. Additionally, you can adjust the visible channels and access plain language descriptions of each channel by clicking the gear icon near the legend. Some channels include a lens that allows you to see the overlap between channels. On these pages, you can pick up and put down the lens, make it larger or smaller by dragging the lower right arrow, and fade the lens by pulling the semi-circle dial to the left. In the right column, we have pre-selected several channel groups for your convenience. Feel free to click on a different channel group at any time to explore a new set of markers."
      },
      "annotationFrames": {
        "A": [
          {
            "uid": "frame-0",
            "title": "Overview of this tissue sample",
            "text": "This section of tissue is derived from a patient with colorectal cancer. \n\nOn the left side, we have normal colorectal tissue. Several anatomical layers are identified and labeled. Starting from the top of the image, we have the mucosa, which borders the lumen. Moving toward the bottom of the image, we encounter the subserosa, which comprises a layer of fat and connective tissue. \n\nOn the right, we can observe a PanCK-positive tumor, specifically an invasive adenocarcinoma. This tumor is classified as pathological stage pT3, as it is located in the submucosa of the colorectum and has infiltrated the muscularis propria and subserosa (bottom right).\n\nWithin the tumor region, we can observe four holes, which indicate the areas where circular tissue cores were removed and transferred to another slide to build a tissue microarray (TMA) along with cores removed from other specimens.\n\nThroughout the tissue, we can observe multiple distinct, bright areas that contain many immune cells (CD45+). These are Peyer’s patches and tertiary lymphoid structures (TLS). We will discuss these structures in more detail later in the narration.",
            "shapes": [
              {
                "uid": "frame-0-box-0",
                "type": "rectangle",
                "targetView": "spatial",
                "x": 61870,
                "y": 3120,
                "width": 4158,
                "height": 3299,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4
              },
              {
                "uid": "frame-0-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 47638,
                "y1": 16405,
                "x2": 44263,
                "y2": 10559,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "TMA core (1 of 4)",
                "textPosition": "start"
              },
              {
                "uid": "frame-0-arrow-1",
                "type": "line",
                "targetView": "spatial",
                "x1": 23084,
                "y1": 23565,
                "x2": 22966,
                "y2": 16816,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Peyer's patch",
                "textPosition": "start"
              },
              {
                "uid": "frame-0-arrow-2",
                "type": "line",
                "targetView": "spatial",
                "x1": 14322,
                "y1": 31826,
                "x2": 10947,
                "y2": 25980,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "text": "Muscularis propria",
                "textPosition": "start"
              },
              {
                "uid": "frame-0-arrow-3",
                "type": "line",
                "targetView": "spatial",
                "x1": 10160,
                "y1": 23858,
                "x2": 6784,
                "y2": 18012,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "text": "Submucosa",
                "textPosition": "start"
              },
              {
                "uid": "frame-0-arrow-4",
                "type": "line",
                "targetView": "spatial",
                "x1": 63000,
                "y1": -2441,
                "x2": 63588,
                "y2": 4283,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Entrapped normal mucosa",
                "textPosition": "start"
              },
              {
                "uid": "frame-0-arrow-5",
                "type": "line",
                "targetView": "spatial",
                "x1": 49420,
                "y1": 2717,
                "x2": 50243,
                "y2": 9417,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Invasive adenocarcinoma (submucosal = pT1)",
                "textPosition": "start"
              },
              {
                "uid": "frame-0-arrow-6",
                "type": "line",
                "targetView": "spatial",
                "x1": 64443,
                "y1": 29808,
                "x2": 61068,
                "y2": 23962,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Invasive adenocarcinoma (Invading muscularis, pT2)",
                "textPosition": "start"
              },
              {
                "uid": "frame-0-arrow-7",
                "type": "line",
                "targetView": "spatial",
                "x1": 77887,
                "y1": 21633,
                "x2": 78710,
                "y2": 28333,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Invasive adenocarcinoma (subserosal, pT3)",
                "textPosition": "start"
              },
              {
                "uid": "frame-0-arrow-8",
                "type": "line",
                "targetView": "spatial",
                "x1": 26271,
                "y1": 13762,
                "x2": 22896,
                "y2": 7917,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "text": "Colorectal lumen",
                "textPosition": "start"
              },
              {
                "uid": "frame-0-arrow-9",
                "type": "line",
                "targetView": "spatial",
                "x1": 27434,
                "y1": 7441,
                "x2": 25125,
                "y2": 13784,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Normal mucosa",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -6.3988,
              "spatialTargetX": 33156,
              "spatialTargetY": 19073,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-1",
            "title": "Immune populations in normal colorectal tissue (1 of 4)",
            "text": "In this image, we can observe the normal mucosa, which consists of many intestinal crypts. The crypts were sliced in different directions when preparing the slide – those sliced cross-sectionally appear circular, while those sliced lengthwise resemble elongated tubes. Each crypt is lined by epithelial cells, which stain positive for PanCK, and surrounded by stroma and immune cells.\n\nThe normal mucosa harbors a substantial number of immune cells. Since the mucosa is in direct contact with the intestinal microbiome, the mucosa possesses resident populations of diverse immune cells such as lymphocytes, macrophages, neutrophils, eosinophils, and mast cells that help protect the body against unwanted infections.\n\nHere, we can also observe a collection of immune cells known as a Peyer’s patch or secondary lymphoid organs, which are intermittently found in normal intestines, typically positioned at the interface between the mucosa and submucosa. They serve as specialized areas involved in immune surveillance and response.",
            "shapes": [
              {
                "uid": "frame-1-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 27123,
                "y1": 19707,
                "x2": 27520,
                "y2": 20424,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Mucosal crypts (longitudinal)",
                "textPosition": "start"
              },
              {
                "uid": "frame-1-arrow-1",
                "type": "line",
                "targetView": "spatial",
                "x1": 28668,
                "y1": 18333,
                "x2": 29370,
                "y2": 18755,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Mucosal crypts (cross-section)",
                "textPosition": "start"
              },
              {
                "uid": "frame-1-arrow-2",
                "type": "line",
                "targetView": "spatial",
                "x1": 29082,
                "y1": 20966,
                "x2": 29125,
                "y2": 20147,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Muscularis mucosa",
                "textPosition": "start"
              },
              {
                "uid": "frame-1-arrow-3",
                "type": "line",
                "targetView": "spatial",
                "x1": 29834,
                "y1": 21634,
                "x2": 29424,
                "y2": 20924,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "text": "Submucosa",
                "textPosition": "start"
              },
              {
                "uid": "frame-1-arrow-4",
                "type": "line",
                "targetView": "spatial",
                "x1": 30905,
                "y1": 21216,
                "x2": 30495,
                "y2": 20506,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Peyer's patch; Secondary lymphoid structure",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -3.3567,
              "spatialTargetX": 26658,
              "spatialTargetY": 19493,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-2",
            "title": "Immune populations in normal colon tissue (2 of 4)",
            "text": "Upon close examination, pathologists can discern various anatomic structures and cell types in H&E samples such as this one. \n\nFor instance, immune cells, including lymphocytes and myeloid cells, are densely aggregated within this Peyer’s patch. Within the patch, there is also a germinal center rich in B cells, which can be identified as a region of cells with a greater amount of light pink cytoplasm at the center of the patch.\n\nGerminal centers are sites where B cells mature via interactions with antigen-presenting immune cells such as macrophages and dendritic cells. While we expect these cell types to be present, we cannot ascertain the precise identities and functional states of individual cells solely from this H&E image. ",
            "shapes": [
              {
                "uid": "frame-2-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 30746,
                "y1": 20422,
                "x2": 30635,
                "y2": 20231,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Germinal center",
                "textPosition": "start"
              },
              {
                "uid": "frame-2-arrow-1",
                "type": "line",
                "targetView": "spatial",
                "x1": 30443,
                "y1": 20823,
                "x2": 30333,
                "y2": 20632,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Peyer's patch",
                "textPosition": "start"
              },
              {
                "uid": "frame-2-arrow-2",
                "type": "line",
                "targetView": "spatial",
                "x1": 31704,
                "y1": 20058,
                "x2": 31594,
                "y2": 19867,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Stroma with mixed immune cells",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -1.4633,
              "spatialTargetX": 30778,
              "spatialTargetY": 20322,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "visible": false
                },
                {
                  "index": 1,
                  "visible": true
                }
              ]
            }
          },
          {
            "uid": "frame-3",
            "title": "Immune populations in normal colon tissue (3 of 4)",
            "text": "Multiplexed immunofluorescence also makes it possible to identify specific cell types and their functional states. In this image, we can observe the presence of a CD20+ B-cell-rich germinal center, accompanied by numerous surrounding CD3+ T cells. Additionally, we can detect functional cell states, such as the abundant presence of PD-1-positive T cells.\n\nThe Orion method also makes it possible to directly compare IF-based molecular states and the corresponding morphologic features observed in H&E images. By examining identical cells on both IF and H&E, we can gain insights into whether different cell subtypes exhibit distinct morphologic appearances. For example, lymphocytes infiltrating the stroma may adopt an elongated morphology rather than the typical small round shape. These observations could potentially help uncover correlations between morphology and underlying molecular states.\n\n_To explore different immune channel groups, toggle the options listed in the right column. Additionally, you can turn off specific channels by clicking the gear icon in the upper right corner of the legend._",
            "shapes": [
              {
                "uid": "frame-3-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 30751,
                "y1": 20382,
                "x2": 30641,
                "y2": 20191,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Germinal center",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -1.4633,
              "spatialTargetX": 30778,
              "spatialTargetY": 20322,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-4",
            "title": "Immune populations in normal colon tissue (4 of 4)",
            "text": "Beyond the Peyer's patch, we can observe a significant presence of immune and stromal cells within the normal mucosa. \n\nHowever, with H&E staining alone, it is challenging to identify precise cell types. Gaining insights into the populations of resident immune cells can greatly enhance our understanding of various pathologic conditions, including inflammatory diseases, cancer, and infectious diseases. \n\n_Toggle between the different channels and observe the distinct markers associated with these cells._\n",
            "shapes": [],
            "viewState": {
              "spatialZoom": -1.4633,
              "spatialTargetX": 32430,
              "spatialTargetY": 19926,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-5",
            "title": "Immune interactions near the tumor edge",
            "text": "Now that we know what normal tissue looks like, let’s investigate the top edge of the tissue where the tumor surrounds some normal mucosa. \n\nThis region presents an opportunity to explore the interactions between the immune system and the tumor microenvironment.",
            "shapes": [
              {
                "uid": "frame-5-box-0",
                "type": "rectangle",
                "targetView": "spatial",
                "x": 62325,
                "y": 3253,
                "width": 3250,
                "height": 2758,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4
              },
              {
                "uid": "frame-5-box-1",
                "type": "rectangle",
                "targetView": "spatial",
                "x": 63347,
                "y": 6805,
                "width": 1084,
                "height": 430,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4
              },
              {
                "uid": "frame-5-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 64316,
                "y1": 3433,
                "x2": 63781,
                "y2": 4258,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Entrapped normal mucosa",
                "textPosition": "start"
              },
              {
                "uid": "frame-5-arrow-1",
                "type": "line",
                "targetView": "spatial",
                "x1": 62360,
                "y1": 7464,
                "x2": 61500,
                "y2": 6987,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Invasive adenocarcinoma",
                "textPosition": "start"
              },
              {
                "uid": "frame-5-arrow-2",
                "type": "line",
                "targetView": "spatial",
                "x1": 64025,
                "y1": 7565,
                "x2": 64983,
                "y2": 7344,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow"
              },
              {
                "uid": "frame-5-arrow-3",
                "type": "line",
                "targetView": "spatial",
                "x1": 64616,
                "y1": 6386,
                "x2": 63841,
                "y2": 6992,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Budding region",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -3.6197,
              "spatialTargetX": 62574,
              "spatialTargetY": 5296,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-6",
            "title": "A closer look at tumor budding",
            "text": "Zooming into the interface between the mucosa and the tumor, we can observe the presence of small clusters of panCK+ tumor cells infiltrating the submucosal stroma. These structures, known as “budding cells,” are commonly found at the edges of an invasive tumor.  \n\nWhile these ‘buds’ may appear as individual cells or small clusters of 2-4 cells when viewed in 2D sections of the tissue, our recently published research (referenced below) has unveiled that they are actually cross-sections of larger, fibril-like structures that extend from the primary tumor mass into the surrounding normal tissues. ([DOI: 10.1016/j.cell.2022.12.028](https://doi.org/10.1016/j.cell.2022.12.028))\n",
            "shapes": [
              {
                "uid": "frame-6-box-0",
                "type": "rectangle",
                "targetView": "spatial",
                "x": 63519,
                "y": 6752,
                "width": 439,
                "height": 461,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4
              },
              {
                "uid": "frame-6-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 62860,
                "y1": 7381,
                "x2": 62718,
                "y2": 7453,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Tumor mass",
                "textPosition": "start"
              },
              {
                "uid": "frame-6-arrow-1",
                "type": "line",
                "targetView": "spatial",
                "x1": 63689,
                "y1": 7468,
                "x2": 63847,
                "y2": 7484,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Tumor mass",
                "textPosition": "start"
              },
              {
                "uid": "frame-6-arrow-2",
                "type": "line",
                "targetView": "spatial",
                "x1": 63951,
                "y1": 6971,
                "x2": 63818,
                "y2": 7058,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Budding cell",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -0.9894,
              "spatialTargetX": 63661,
              "spatialTargetY": 6854,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-7",
            "title": "A closer look at tumor budding",
            "text": "Consistent with our previous research, the budding cells within this region exhibit lower levels of E-Cadherin than the surrounding tumor mass. In fact, the budding cells indicated by the arrow express almost no E-Cadherin.\n\nWhile it can be challenging to discern the distinct features of budding cells solely through H&E staining, using multiplexed immunofluorescence imaging allows us to visualize the specific expression patterns of these cells.\n",
            "shapes": [
              {
                "uid": "frame-7-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 64004,
                "y1": 6991,
                "x2": 63828,
                "y2": 7045,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Budding cell",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -1.2002,
              "spatialTargetX": 63641,
              "spatialTargetY": 6875,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-8",
            "title": "Tumor-immune interactions with budding cells",
            "text": "While it is well-known that invasive tumors are surrounded by a complex immune microenvironment, the precise interactions between tumor and immune cells are not readily discernible through H&E staining alone.\n\nIn this image, we observe a group of budding cells surrounded by immune cells. While their relationship may not be evident on H&E-stained sections, using multiplexed immunofluorescence (IF) imaging provides further insights. Through IF, we can see that the lymphocytes interact with the tumor via cytoplasmic processes which are not visible on H&E. Notably, we can see direct interactions between the PD-L1+ tumor cells and CD8+ T cells. \n\n*(You may need to turn off all channels except PD-1 and PD-L1 to observe the PD1/PDL1 handshake in detail!)*\n\nBy leveraging multimodal imaging, we can also correlate these functional states and spatial interactions between tumor and immune cells to the underlying tissue morphology. This integrated approach has the potential to unveil previously concealed associations and provide a deeper understanding of the intricate interplay and tumultuous competition between the tumor and immune components in cancer tissues. \n",
            "shapes": [
              {
                "uid": "frame-8-box-0",
                "type": "rectangle",
                "targetView": "spatial",
                "x": 63693,
                "y": 6773,
                "width": 217,
                "height": 191,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4
              }
            ],
            "viewState": {
              "spatialZoom": -0.1481,
              "spatialTargetX": 63748,
              "spatialTargetY": 6867,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-9",
            "title": "Multimodal identification of immune cells",
            "text": "As we zoom back out, we come across a nearby cluster of CD45+ immune cells that do not exhibit staining for other immune markers. \n\nThis observation highlights an important aspect of antibody panels used for immune profiling – they often focus on the functional subtypes of lymphocytes and/or macrophages and exclude other cell types such as neutrophils, eosinophils, mast cells, etc. \n\nBy enabling direct comparison of immunofluorescence and H&E imaging, the Orion method allows us to identify unstained cells or architectural features with prominent morphologic characteristics. \n\nIn this case, inspecting the H&E channel reveals that the unstained cells within this cluster are neutrophils, identifiable by their distinctive, multi-lobed nuclei. \n",
            "shapes": [
              {
                "uid": "frame-9-box-0",
                "type": "rectangle",
                "targetView": "spatial",
                "x": 63993,
                "y": 6152,
                "width": 526,
                "height": 506,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4
              },
              {
                "uid": "frame-9-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 64270,
                "y1": 6683,
                "x2": 64164,
                "y2": 6500,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "CD45+ neutrophils",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -1.4011,
              "spatialTargetX": 63602,
              "spatialTargetY": 6799,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-10",
            "title": "Another budding region - near the deep invasive edge",
            "text": "In this image, we see another budding region situated at the deep invasive edge of the tumor, where it infiltrates the muscularis propria layer.\n\nThis region recapitulates many characteristics we previously described. _Try toggling between channel groups to explore the specific markers and features of this area!_\n",
            "shapes": [
              {
                "uid": "frame-10-box-0",
                "type": "rectangle",
                "targetView": "spatial",
                "x": 63774,
                "y": 24050,
                "width": 1615,
                "height": 1519,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4
              },
              {
                "uid": "frame-10-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 64174,
                "y1": 21838,
                "x2": 63691,
                "y2": 22243,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Tumor mass",
                "textPosition": "start"
              },
              {
                "uid": "frame-10-arrow-1",
                "type": "line",
                "targetView": "spatial",
                "x1": 63737,
                "y1": 25137,
                "x2": 64014,
                "y2": 24570,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Budding cells",
                "textPosition": "start"
              },
              {
                "uid": "frame-10-arrow-2",
                "type": "line",
                "targetView": "spatial",
                "x1": 67354,
                "y1": 24542,
                "x2": 66966,
                "y2": 25040,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Muscularis",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -2.9793,
              "spatialTargetX": 64352,
              "spatialTargetY": 23673,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-11",
            "title": "Tertiary lymphoid structure (TLS) at the invasive margin",
            "text": "In invasive colorectal cancers, a significant local immune response often leads to the development of tertiary lymphoid structures (TLS) around the tumor. These structures resemble the Peyer’s patches we examined earlier, featuring germinal centers where B cells mature and proliferate, a surrounding mantle of T cells, and interspersed myeloid cells. \n\nThe presence of numerous TLS may be associated with improved patient survival and favorable response to therapies that target the immune system. Our recently published research revealed that TLS exhibit complex functional interactions and form expansive 3D superstructures within the tissue. [DOI: 10.1016/j.cell.2022.12.028](https://doi.org/10.1016/j.cell.2022.12.028)\n\n_You may want to change channel groups to observe other immune populations or zoom out to explore smaller TLS-like structures in the vicinity._",
            "shapes": [
              {
                "uid": "frame-11-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 70234,
                "y1": 27640,
                "x2": 70070,
                "y2": 27357,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Germinal center",
                "textPosition": "start"
              },
              {
                "uid": "frame-11-arrow-1",
                "type": "line",
                "targetView": "spatial",
                "x1": 69087,
                "y1": 27814,
                "x2": 69098,
                "y2": 27487,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Mantle",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -2.0315,
              "spatialTargetX": 69230,
              "spatialTargetY": 27415,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-12",
            "title": "Autofluorescence illuminates tissue features ",
            "text": "To enhance the signal-to-noise ratios of the antibody staining, we acquired the autofluorescence of each sample. Interestingly, we discovered that natural tissue autofluorescence can aid in identifying acellular features.\n\nIn this particular image, we have highlighted an artery, which is surrounded by thick layers of alpha-SMA+ vascular smooth muscle. The elastic lamina of the vessel wall becomes prominent due to a significant autofluorescence signal. \n\nWithin the lumen of the artery, we can also observe autofluorescent red blood cells. It is important to note that red blood cells and acellular structures like the elastic lamina are typically not characterized in immunofluorescence experiments. However, the Orion multimodal imaging approach enables the easy identification and analysis of these structures. ",
            "shapes": [
              {
                "uid": "frame-12-arrow-0",
                "type": "line",
                "targetView": "spatial",
                "x1": 72070,
                "y1": 31242,
                "x2": 72510,
                "y2": 31073,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Elastic lamina",
                "textPosition": "start"
              },
              {
                "uid": "frame-12-arrow-1",
                "type": "line",
                "targetView": "spatial",
                "x1": 73268,
                "y1": 30686,
                "x2": 72869,
                "y2": 30935,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Red blood cells",
                "textPosition": "start"
              },
              {
                "uid": "frame-12-arrow-2",
                "type": "line",
                "targetView": "spatial",
                "x1": 71907,
                "y1": 32653,
                "x2": 71671,
                "y2": 32245,
                "strokeColor": [
                  0,0,0
                ],
                "strokeWidth": 4,
                "markerEnd": "Arrow",
                "text": "Fat cell",
                "textPosition": "start"
              }
            ],
            "viewState": {
              "spatialZoom": -2.5576,
              "spatialTargetX": 71694,
              "spatialTargetY": 31446,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          },
          {
            "uid": "frame-13",
            "title": "Metadata about this sample",
            "text": "### Diagnosis  \n**Age at Diagnosis**: 56 years  \n**Primary Diagnosis**: Adenocarcinoma NOS  \n**Site of Resection or Biopsy**: Rectosigmoid junction   \n**Tumor Grade**: High Grade  \n**Stage at Diagnosis**: IIIB  \n\n### Demographics\n**Species**: Human  \n**Vital Status**: Deceased   \n**Cause of death**: Cancer-related  \n**Sex**: Male  \n**Race**: White  \n**Ethnicity**: Not hispanic or latino  \n\n### Therapy  \n**Pre-operative**: None  \n**Post-operative**: Chemotherapy (FOLFOX) and radiation  \n**Initial Disease Status**: Initial Diagnosis  \n\n### Follow Up  \n**Progression**: Yes - Progression or Recurrence  \n**Last Known Disease Status**: Distant met recurrence/progression  \n**Age at Follow Up**: 58 years  \n**Days to Progression**: 459  \n\n### Biospecimen  \n**Acquisition Method Type**: Surgical Resection  \n\n### Molecular Test  \n**Molecular analysis method**: Targeted Sequencing  \n**Genotype Available**: Yes  \n**Genetic Features**:  p53, BRAF  \n\n## Imaging  \n**Imaging Assay Type**: Orion  \n**Fixative Type**: Formalin  \n**Microscope**: RareCyte Orion  \n**Objective**: 20X0.75 NA  \n**Binned**: No  \n\n## Publication and Data Availability  \n### Associated Data:  \n[DOI: 10.5281/zenodo.7637655](https://doi.org/10.5281/zenodo.7637655) \n **Visit [tissue-atlas.org/atlas-datasets/lin-chen-campton-2023](https://www.tissue-atlas.org/atlas-datasets/lin-chen-campton-2023/) to learn more.** \n\n\n### Attribution:  \n*Please cite with the following conventions:*  \n**Publication and underlying data**  \nLin, J.R., Chen, Y.A., Campton, D., et al., High-plex immunofluorescence imaging and traditional histology of the same tissue section for discovering image-based biomarkers. *Nature Cancer*, 2023, [DOI: 10.1038/s43018-023-00576-1](https://doi.org/10.1038/s43018-023-00576-1).  \n\n**This Minerva Story**  \nJuliann Tefft, Yu-An Chen, Shannon Coy, Jia-Ren Lin, and Sarah Arena. Multimodal spatial profiling of colorectal cancer using Orion. Harvard Dataverse. V1, 2023, [DOI: 10.7910/DVN/76DTDF](https://doi.org/10.7910/DVN/76DTDF). \n\n### Associated Identifiers\n| ID Type                        | ID         |\n|--------------------------------|------------|\n| LSP Slide ID                   | LSP10388   |\n| Publication Participant No. | C04        |\n| HTAN Participant ID            | HTA7\\_934   |\n| HTAN Biospec. Block ID      | HTA7\\_934\\_1 |\n| HTAN Biospec. Section ID    | HTA7\\_934\\_9 |",
            "shapes": [],
            "viewState": {
              "spatialZoom": -6.5,
              "spatialTargetX": 36451,
              "spatialTargetY": 20273,
              "spatialImageLayer": [
                {
                  "index": 0,
                  "channels": [
                    {
                      "selection": {
                        "channel": 0
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 2
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 3
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 17
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 18
                      },
                      "visible": true
                    },
                    {
                      "selection": {
                        "channel": 10
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 12
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 15
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 4
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 14
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 6
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 8
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 7
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 11
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 1
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 13
                      },
                      "visible": false
                    },
                    {
                      "selection": {
                        "channel": 16
                      },
                      "visible": false
                    }
                  ]
                },
                {
                  "index": 1,
                  "visible": false
                }
              ]
            }
          }
        ]
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
          "spatialTargetY": "A"
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
          "spatialTargetY": "A"
        },
        "x": 9,
        "y": 0,
        "w": 3,
        "h": 12
      }
    ]
  };
