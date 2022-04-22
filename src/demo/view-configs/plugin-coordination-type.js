import React from 'react';
import Slider from '@material-ui/core/Slider';
import {
  registerPluginCoordinationType,
  registerPluginViewType,
} from '../../app/plugins';
import {
  CoordinationType,
} from '../../app/constants';
// For plugin views to use:
import TitleInfo from '../../components/TitleInfo';
import {
  useCoordination,
} from '../../app/state/hooks';

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

registerPluginCoordinationType(
  'myCustomCoordinationType',
  0.75,
);

// Register the plugin view type.
registerPluginViewType(
  'myCustomSlider',
  MyPluginSliderSubscriber,
  [
    CoordinationType.DATASET,
    'myCustomCoordinationType',
  ],
);

// Use the plugin view in the configuration.
export const pluginCoordinationType = {
  name: 'Test plugin views and coordination types',
  version: '1.0.9',
  description: 'Demonstration of a plugin coordination type implementation. The left sliders should be coordinated, while the right sliders are independent.',
  public: true,
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
