import React from 'react';
import { Vitessce, VitessceConfig, hconcat, vconcat } from '../../../../dist/umd/production/index.min.js';

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  Vitessce,
  VitessceConfig,
  hconcat,
  vconcat,
};

export default ReactLiveScope;
