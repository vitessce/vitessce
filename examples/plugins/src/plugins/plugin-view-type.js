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
          url: 'https://data-1.vitessce.io/0.0.31/master_release/spraggins/spraggins.raster.json',
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
