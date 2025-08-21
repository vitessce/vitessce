/* eslint-disable react/button-has-type */
/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import {
  TitleInfo,
  useCoordination,
} from '@vitessce/vit-s';
import {
  CoordinationType,
} from '@vitessce/constants';
import {
  PluginViewType,
} from '@vitessce/plugins';


// For plugin views to use:
function MyPluginView(props) {
  const {
    spatialZoom,
    setSpatialZoom,
  } = props;

  function handleClick() {
    setSpatialZoom(-10 + Math.random() * 10);
  }
  return (
    <div>
      <p>Zoom level: <b>{spatialZoom}</b></p>
      <p>
        <button onClick={handleClick}>Try a random zoom level</button>
      </p>
    </div>
  );
}

function MyPluginViewSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'My plugin view',
  } = props;

  // Get "props" from the coordination space.
  const [{
    spatialZoom,
  }, {
    setSpatialZoom,
  }] = useCoordination(
    [
      CoordinationType.DATASET,
      CoordinationType.SPATIAL_ZOOM,
    ],
    coordinationScopes,
  );

  return (
    <TitleInfo
      title={title}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady
    >
      <MyPluginView
        spatialZoom={spatialZoom}
        setSpatialZoom={setSpatialZoom}
      />
    </TitleInfo>
  );
}

export const pluginViewTypeProps = {
  pluginViewTypes: [
    new PluginViewType(
      'myCustomZoomController',
      MyPluginViewSubscriber,
      [
        CoordinationType.DATASET,
        CoordinationType.SPATIAL_ZOOM,
      ],
    ),
  ],
};

// Use the plugin view in the configuration.
export const pluginViewType = {
  name: 'Test plugin view types',
  version: '1.0.9',
  description: 'Demonstration of a basic plugin view implementation.',
  datasets: [
    {
      uid: 'plugin-test-dataset',
      name: 'Plugin test dataset',
      files: [
        {
          type: 'raster',
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
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    spatialZoom: {
      A: -6.5,
    },
  },
  layout: [
    {
      component: 'description',
      props: {
        title: 'Description',
      },
      x: 10,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
      },
      x: 2,
      y: 0,
      w: 8,
      h: 2,
    },
    {
      component: 'myCustomZoomController',
      coordinationScopes: {
        spatialZoom: 'A',
      },
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
  ],
};
