/* eslint-disable */
import React, { useEffect } from 'react';
import {
  registerPluginViewType,
} from '../../app/plugins';
import {
  CoordinationType,
} from '../../app/constants';
// For plugin views to use:
import TitleInfo from '../../components/TitleInfo';
import {
  useCoordination,
  useLoaders,
} from '../../app/state/hooks';

function MyPluginView(props) {
  const {
    spatialZoom,
    setSpatialZoom,
  } = props;

  function handleClick() {
    setSpatialZoom(-10 + Math.random()*10);
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

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    spatialZoom
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
      isReady={true}
    >
      <MyPluginView
        spatialZoom={spatialZoom}
        setSpatialZoom={setSpatialZoom}
      />
    </TitleInfo>
  );
}

// Register the plugin view type.
registerPluginViewType(
  'myCustomZoomController',
  MyPluginViewSubscriber,
  [
    CoordinationType.DATASET,
    CoordinationType.SPATIAL_ZOOM,
  ]
);

// Use the plugin view in the configuration.
export const pluginViewTest = {
  name: 'Test plugin view types',
  version: '1.0.6',
  description: 'Demonstration of a basic plugin view implementation.',
  public: true,
  datasets: [
    {
      uid: 'plugin-test-dataset',
      name: 'Plugin test dataset',
      files: [
        {
          "type": "raster",
          "fileType": "raster.json",
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/spraggins/spraggins.raster.json"
        }
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


