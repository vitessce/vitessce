import React from 'react';
import ReactDOM from 'react-dom';

import { LayerManagerPublisher } from './components/layermanager';
import { StatusSubscriber } from './components/status';
import { TsneSubscriber } from './components/tsne';
import { HeatmapSubscriber } from './components/heatmap';
import { SpatialSubscriber } from './components/spatial';
import { GenesSubscriber } from './components/genes';
import { FactorsSubscriber } from './components/factors';

import './css/index.css';
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
          <div class="py-2" id="dataset-picker"></div>
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
  renderComponent(<DatasetList datasets={FAKE_API_RESPONSE} />, 'dataset-picker');
}

function renderDataset(id, datasetId) {
  const {
    layers, views, name, description,
  } = FAKE_API_RESPONSE[datasetId];
  const [sideBig, sideSmall] = [3, 4];
  const [middleBig, middleSmall] = [12 - 2 * sideBig, 12 - 2 * sideSmall];
  const col = 'd-flex flex-column px-2';
  const side = `${col} col-md-${sideBig} col-sm-${sideSmall}`;
  const middle = `${col} col-md-${middleBig} col-sm-${middleSmall}`;
  document.getElementById(id).innerHTML = `
    <div class="container-fluid d-flex h-75 pt-2 pl-2 pr-2">
      <div id="layermanager"><!-- No UI exposure --></div>
      <div class="${side}">
        <div id="description" class="d-flex flex-column h-25"></div>
        <div id="status" class="d-flex flex-column h-25"></div>
        <div id="tsne" class="d-flex flex-column h-50"></div>
      </div>
      <div class="${middle}">
        <div id="spatial" class="d-flex flex-column h-100"></div>
      </div>
      <div class="${side}">
        <div id="factors" class="d-flex flex-column h-25"></div>
        <div id="genes" class="d-flex flex-column h-75"></div>
      </div>
    </div>
    <div class="container-fluid d-flex h-25 pb-2 pl-2 pr-2">
      <div class="${col} col-lg-12">
        <div id="heatmap" class="d-flex flex-column h-100"></div>
      </div>
    </div>
  `;

  renderComponent(<LayerManagerPublisher layers={layers} />, 'layermanager');
  renderComponent(<Description description={`${name}: ${description}`} />, 'description');
  renderComponent(<StatusSubscriber />, 'status');
  renderComponent(<TsneSubscriber />, 'tsne');
  renderComponent(<HeatmapSubscriber />, 'heatmap');
  renderComponent(<SpatialSubscriber view={views.spatial} />, 'spatial');
  renderComponent(<FactorsSubscriber />, 'factors');
  renderComponent(<GenesSubscriber />, 'genes');
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
    renderDataset(id, datasetId);
  } else {
    renderWelcome(id);
  }
}
