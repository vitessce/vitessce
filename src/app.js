import React from 'react';
import ReactDOM from 'react-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { LayerManagerPublisher } from './components/layermanager';
import { StatusSubscriber } from './components/status';
import { TsneSubscriber } from './components/tsne';
import { HeatmapSubscriber } from './components/heatmap';
import { SpatialSubscriber } from './components/spatial';
import { GenesSubscriber } from './components/genes';
import { FactorsSubscriber } from './components/factors';

import './css/index.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';

import { SCROLL_CARD, LIGHT_CARD } from './components/classNames';
import TitleInfo from './components/TitleInfo';

const urlPrefix = 'https://s3.amazonaws.com/vitessce-data/0.0.12/linnarsson-2018';
const FAKE_API_RESPONSE = {
  'linnarsson-2018': {
    name: 'Linnarsson - osmFISH',
    description: 'Spatial organization of the somatosensory cortex revealed by cyclic smFISH',
    views: {
      spatial: {
        zoom: -6.5,
        offset: [200, 200],
      },
    },
    layers: [
      'cells',
      'clusters',
      'factors',
      'genes',
      'images',
      'molecules',
      'neighborhoods',
    ].map(name => ({
      name,
      type: name.toUpperCase(),
      url: `${urlPrefix}/linnarsson.${name}.json`,
    })),
  },
};

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

export function DatasetList(props) {
  const { datasets } = props;
  const links = Object.entries(datasets).map(
    ([id, dataset]) => (
      <a
        href={`?dataset=${id}`}
        className="list-group-item list-group-item-action flex-column align-items-start bg-black"
        key={id}
      >
        <div className="d-flex w-100 justify-content-between">
          <h5>{dataset.name}</h5>
        </div>
        <p>{dataset.description}</p>
      </a>
    ),
  );
  return (
    <div className="list-group">
      {links}
    </div>
  );
}

function renderWelcome(id) {
  document.getElementById(id).innerHTML = `
    <div class="container-fluid d-flex flex-column align-items-end">
      <div class="${LIGHT_CARD}" style="width: 100%; max-width: 330px; margin: auto;" >
        <form method="GET">
          <h1>🚄  Vitessce</h1>
          <div>
            <p>
              This is a demo of key concepts for a visual integration tool for exploration
              of (spatial) single-cell experiment data.
              This demo focusses on scalable, linked visualizations that support both
              spatial and non-spatial representation of cell-level and molecule-level data.
            </p>
            Select a data set below:
          </div>
          <div class="py-2" id="dataset-list"></div>
        </form>
      </div>
      <div class="${LIGHT_CARD}" style="width: 100%;">
        <p>
          Vitessce is supported by the NIH Common Fund, through the
          <a href="https://commonfund.nih.gov/HuBMAP">Human BioMolecular Atlas Program (HuBMAP)</a>,
          Integration, Visualization & Engagement (HIVE) Initiative,
          RFA-RM-18-001.
        </p>
      </div>
    </div>
  `;
  renderComponent(<DatasetList datasets={FAKE_API_RESPONSE} />, 'dataset-list');
}

function VitessceGrid(props) {
  const { datasetId } = props;
  const {
    layers, views, name, description,
  } = FAKE_API_RESPONSE[datasetId];

  const ResponsiveGridLayout = WidthProvider(Responsive);

  const lgColLayout = {
    description: { x: 0, y: 0 },
    status: { x: 0, y: 1 },
    tsne: { x: 0, y: 2, h: 2 },
    spatial: { x: 1, y: 0, h: 4 },
    factors: { x: 2, y: 0, h: 2 },
    genes: { x: 2, y: 2, h: 2 },
    heatmap: { x: 0, y: 4, w: 3 },
  };
  const lgColXs = [0, 3, 9];
  const lgColWs = [3, 6, 3];
  const lgLayout = Object.entries(lgColLayout).map(([id, spec]) => ({
    i: id,
    y: spec.y,
    h: spec.h || 1,
    x: lgColXs[spec.x],
    w: lgColWs[spec.x],
  }));

  console.log('>>>>', lgLayout);
  const layouts = {
    lg: lgLayout,
  };

  return (
    <React.Fragment>
      <LayerManagerPublisher layers={layers} />
      <ResponsiveGridLayout
        className="layout"
        cols={{
          lg: 12, md: 12, sm: 12, xs: 12, xxs: 12,
        }}
        layouts={layouts}
        rowHeight={150}
        width={800}
        draggableHandle=".title"
      >
        <div key="description"><Description description={`${name}: ${description}`} /></div>
        <div key="status"><StatusSubscriber /></div>
        <div key="tsne"><TsneSubscriber /></div>
        <div key="spatial"><SpatialSubscriber view={views.spatial} /></div>
        <div key="factors"><FactorsSubscriber /></div>
        <div key="genes"><GenesSubscriber /></div>
        <div key="heatmap"><HeatmapSubscriber /></div>
      </ResponsiveGridLayout>
    </React.Fragment>
  );
}

function Description(props) {
  const { description } = props;
  return (
    <React.Fragment>
      <TitleInfo title="Data Set" />
      <div className={SCROLL_CARD}>
        <p className="details">{description}</p>
      </div>
    </React.Fragment>
  );
}

export default function renderApp(id) {
  const datasetId = new URLSearchParams(window.location.search).get('dataset');
  if (datasetId) {
    renderComponent(<VitessceGrid datasetId={datasetId} />, id);
  } else {
    renderWelcome(id);
  }
}
