import { urlPrefix } from '../utils.js';

const vanderbiltDescription = 'High bit depth (uint16) multiplex immunofluorescence images of the kidney by the BIOmolecular Multimodal Imaging Center (BIOMIC) at Vanderbilt University';
const vanderbiltBase = {
  description: vanderbiltDescription,
  layers: [
    {
      name: 'raster',
      type: 'RASTER',
      fileType: 'raster.json',
      options: {
        "schemaVersion": "0.0.2",
        "renderLayers": [
          "Spraggins MxIF",
          "Spraggins IMS"
        ],
        "images": [
          {
            "name": "Spraggins IMS",
            "url": "https://vitessce-data.storage.googleapis.com/0.0.31/master_release/spraggins/spraggins.ims.zarr",
            "type": "zarr",
            "metadata": {
              "dimensions": [
                {
                  "field": "mz",
                  "type": "ordinal",
                  "values": [
                    "675.5366",
                    "703.5722",
                    "721.4766",
                    "725.5562",
                    "729.5892",
                    "731.606",
                    "734.5692",
                    "737.4524",
                    "739.4651",
                    "741.5302",
                    "745.4766",
                    "747.4938",
                    "749.5093",
                    "753.5892",
                    "756.5534",
                    "758.5706",
                    "772.5225",
                    "772.5506",
                    "776.5928",
                    "780.5528",
                    "782.5697",
                    "784.5841",
                    "786.6012",
                    "787.6707",
                    "790.5157",
                    "796.5259",
                    "798.54",
                    "804.5528",
                    "806.5683",
                    "808.5838",
                    "809.6518",
                    "810.6",
                    "811.6699",
                    "813.6847",
                    "815.699",
                    "820.5262",
                    "822.5394",
                    "824.5559",
                    "825.6241",
                    "828.5495",
                    "830.5666",
                    "832.5816",
                    "833.649",
                    "835.6666",
                    "837.6798",
                    "848.5577",
                    "851.6374"
                  ]
                },
                {
                  "field": "y",
                  "type": "quantitative",
                  "values": null
                },
                {
                  "field": "x",
                  "type": "quantitative",
                  "values": null
                }
              ],
              "isPyramid": false,
              "transform": {
                "scale": 20.0,
                "translate": {
                  "y": 12020,
                  "x": 19020
                }
              }
            }
          },
          {
            "name": "Spraggins MxIF",
            "url": "https://vitessce-data.storage.googleapis.com/0.0.31/master_release/spraggins/spraggins.mxif.zarr",
            "type": "zarr",
            "metadata": {
              "dimensions": [
                {
                  "field": "channel",
                  "type": "nominal",
                  "values": [
                    "DAPI - Hoechst (nuclei)",
                    "FITC - Laminin (basement membrane)",
                    "Cy3 - Synaptopodin (glomerular)",
                    "Cy5 - THP (thick limb)"
                  ]
                },
                {
                  "field": "y",
                  "type": "quantitative",
                  "values": null
                },
                {
                  "field": "x",
                  "type": "quantitative",
                  "values": null
                }
              ],
              "isPyramid": true,
              "transform": {
                "translate": {
                  "y": 0,
                  "x": 0
                },
                "scale": 1
              }
            }
          }
        ]
      },
    },
  ],
};

export const spraggins2020 = {
  ...vanderbiltBase,
  version: '0.1.0',
  name: 'Spraggins',
  public: true,
  staticLayout: [
    {
      component: 'spatial',
      props: {
        view: {
          zoom: -6.5,
          target: [20000, 20000, 0],
        },
      },
      x: 0,
      y: 0,
      w: 9,
      h: 2,
    },
    {
      component: 'layerController',
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
  ],
};

export const neumann2020 = {
  version: '1.0.1',
  name: 'Neumann et al., 2020',
  description: 'Four registered imaging modalities (PAS, IMS, AF) from HuBMAP collection HBM876.XNRH.336',
  datasets: [
    {
      uid: 'A',
      name: 'Spraggins',
      files: [
        {
          type: 'raster',
          fileType: 'raster.json',
          options: {
            schemaVersion: '0.0.2',
            images: [
              {
                name: 'PAS',
                type: 'ome-tiff',
                url: 'https://assets.hubmapconsortium.org/f4188a148e4c759092d19369d310883b/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-PAS_images/VAN0006-LK-2-85-PAS_registered.ome.tif?token=',
              },
              {
                name: 'AF',
                type: 'ome-tiff',
                url: 'https://assets.hubmapconsortium.org/2130d5f91ce61d7157a42c0497b06de8/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-AF_preIMS_images/VAN0006-LK-2-85-AF_preIMS_registered.ome.tif?token=',
              },
              {
                name: 'IMS PosMode',
                type: 'ome-tiff',
                url: 'https://assets.hubmapconsortium.org/be503a021ed910c0918842e318e6efa2/ometiff-pyramids/ometiffs/VAN0006-LK-2-85-IMS_PosMode_multilayer.ome.tif?token=',
              },
              {
                name: 'IMS NegMode',
                type: 'ome-tiff',
                url: 'https://assets.hubmapconsortium.org/ca886a630b2038997a4cfbbf4abfd283/ometiff-pyramids/ometiffs/VAN0006-LK-2-85-IMS_NegMode_multilayer.ome.tif?token=',
              },
            ],
            usePhysicalSizeScaling: true,
            renderLayers: [
              'PAS',
              'AF',
              'IMS PosMode',
              'IMS NegMode',
            ],
          },
        },
      ],
    },
  ],
  coordinationSpace: {},
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {},
      x: 0,
      y: 0,
      w: 9,
      h: 12,
    },
    {
      component: 'layerController',
      coordinationScopes: {},
      x: 9,
      y: 0,
      w: 3,
      h: 12,
    },
  ],
  initStrategy: 'auto',
};
