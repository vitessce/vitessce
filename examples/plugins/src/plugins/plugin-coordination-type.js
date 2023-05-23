/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Slider } from '@material-ui/core';
import {
  TitleInfo,
  useCoordination,
} from '@vitessce/vit-s';
import {
  CoordinationType,
} from '@vitessce/constants';
import {
  PluginCoordinationType,
  PluginViewType,
} from '@vitessce/plugins';
import { z } from '@vitessce/schemas';


function MyPluginSlider(props) {
  const {
    myCustomCoordinationType,
    setMyCustomCoordinationType,
  } = props;

  function handleChange(event, newValue) {
    setMyCustomCoordinationType(newValue);
  }

  return (
    <div>
      <Slider
        value={myCustomCoordinationType}
        onChange={handleChange}
        min={0.0}
        max={1.0}
        step={0.005}
      />
    </div>
  );
}

function MyPluginSliderSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'My plugin slider',
  } = props;

  // Get "props" from the coordination space.
  const [{
    myCustomCoordinationType,
  }, {
    setMyCustomCoordinationType,
  }] = useCoordination(
    [
      CoordinationType.DATASET,
      'myCustomCoordinationType',
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
      <MyPluginSlider
        myCustomCoordinationType={myCustomCoordinationType}
        setMyCustomCoordinationType={setMyCustomCoordinationType}
      />
    </TitleInfo>
  );
}

export const pluginCoordinationTypeProps = {
  pluginCoordinationTypes: [
    new PluginCoordinationType(
      'myCustomCoordinationType',
      0.75,
      z.number(),
    ),
  ],
  pluginViewTypes: [
    new PluginViewType(
      'myCustomSlider',
      MyPluginSliderSubscriber,
      [
        CoordinationType.DATASET,
        'myCustomCoordinationType',
      ],
    ),
  ],
};


// Use the plugin view in the configuration.
export const pluginCoordinationType = {
  name: 'Test plugin views and coordination types',
  version: '1.0.9',
  description: 'Demonstration of a plugin coordination type implementation. The left sliders should be coordinated, while the right sliders are independent.',
  datasets: [
    {
      uid: 'plugin-test-dataset',
      name: 'Plugin test dataset',
      files: [],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    myCustomCoordinationType: {
      A: 0.5,
      B: 0.25,
      C: undefined,
    },
  },
  layout: [
    {
      component: 'description',
      props: {
        title: 'Description',
      },
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      component: 'myCustomSlider',
      coordinationScopes: {
        myCustomCoordinationType: 'A',
      },
      x: 2,
      y: 0,
      w: 2,
      h: 1,
    },
    {
      component: 'myCustomSlider',
      coordinationScopes: {
        myCustomCoordinationType: 'A',
      },
      x: 2,
      y: 1,
      w: 2,
      h: 1,
    },
    {
      component: 'myCustomSlider',
      coordinationScopes: {
        myCustomCoordinationType: 'B',
      },
      x: 4,
      y: 0,
      w: 2,
      h: 1,
    },
    {
      component: 'myCustomSlider',
      x: 4,
      y: 1,
      w: 2,
      h: 1,
    },
  ],
};
