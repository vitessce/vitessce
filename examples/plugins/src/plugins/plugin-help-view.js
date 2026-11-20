/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import {
  PluginHelpView,
} from '@vitessce/plugins';

// A custom React component to render in place of the default
// help tooltip for the spatial view.
function MySpatialHelp() {
  return (
    <div>
      <h4 style={{ margin: '0 0 8px' }}>Spatial View (Custom Help)</h4>
      <p style={{ margin: 0 }}>
        This help content was provided by a portal-defined PluginHelpView,
        overriding the default Vitessce tooltip for this view.
      </p>
    </div>
  );
}

// A custom React component to render in place of the default
// help tooltip for the description view.
function MyDescriptionHelp() {
  return (
    <p style={{ margin: 0 }}>
      Custom help text for the description panel, registered via
      <code> new PluginHelpView(&apos;description&apos;, MyDescriptionHelp) </code>.
    </p>
  );
}


export const pluginHelpViewProps = {
  pluginHelpViews: [
    new PluginHelpView('spatial', MySpatialHelp),
    new PluginHelpView('description', MyDescriptionHelp),
  ],
};

export const pluginHelpView = {
  name: 'Test plugin help views',
  version: '1.0.9',
  description: 'Demonstration of the PluginHelpView plugin API: click the ? button on the Description or Spatial views to see custom help content.',
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
      x: 0,
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
  ],
};
