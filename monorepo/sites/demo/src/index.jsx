import React from 'react';
import { createRoot } from 'react-dom/client';
import { VitessceDemo } from './vitessce-demo';

// Register view type plugins
import { DescriptionSubscriber } from '@vitessce/description';
import { registerPluginViewType, ViewType as vt, CoordinationType as ct } from 'vitessce';

registerPluginViewType(vt.DESCRIPTION, DescriptionSubscriber, [
  ct.DATASET,
  ct.SPATIAL_IMAGE_LAYER,
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<VitessceDemo />);
