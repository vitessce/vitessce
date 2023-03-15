/* eslint-disable react/button-has-type */
/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import {
  TitleInfo,
} from '@vitessce/vit-s';
import {
  PluginViewType,
} from '@vitessce/plugins';

function PluginImageViewSubscriber(props) {
  const {
    removeGridComponent,
    theme,
    title = 'Figure',
    imgSrc,
    imgAlt,
  } = props;

  return (
    <TitleInfo
      title={title}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady
    >
      <img src={imgSrc} alt={imgAlt} />
    </TitleInfo>
  );
}

export const pluginImageViewProps = {
  pluginViewTypes: [
    new PluginViewType(
      'staticImage',
      PluginImageViewSubscriber,
      [],
    ),
  ],
};

// Use the plugin view in the configuration.
export const pluginImageView = {
  name: 'Test plugin image view',
  version: '1.0.9',
  description: 'Demonstration of a basic plugin view implementation.',
  datasets: [],
  initStrategy: 'auto',
  coordinationSpace: {
  },
  layout: [
    {
      component: 'staticImage',
      props: {
        imgSrc: 'http://localhost:8000/test.png',
      },
      x: 0,
      y: 0,
      w: 6,
      h: 6,
    },
  ],
};
