// The CSS imports are just here to be included in the UMD build,
// so they can be referenced through unpkg.

import { Heatmap } from './components/heatmap';
import { Spatial } from './components/spatial';
import { Scatterplot } from './components/scatterplot';
import PubSubVitessceGrid from './app/PubSubVitessceGrid';
import { renderApp } from './app';

export default {
  Heatmap,
  Spatial,
  Scatterplot,
  PubSubVitessceGrid,
  renderApp,
};
