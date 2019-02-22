// The CSS imports are just here to be included in the UMD build,
// so they can be referenced through unpkg.
import './css/index.css';

import { Heatmap } from './components/heatmap';
import { Spatial } from './components/spatial';
import { Tsne } from './components/tsne';
import renderApp from './app';

export default {
  Heatmap,
  Spatial,
  Tsne,
  renderApp,
};
