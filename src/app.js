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

const urlPrefix = 'https://s3.amazonaws.com/vitessce-data/0.0.9/linnarsson-2018';
const FAKE_API_RESPONSE = {
  'linnarsson-2018': {
    name: 'Linnarsson - osmFISH',
    description: 'Spatial organization of the somatosensory cortex revealed by cyclic smFISH',
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

function DatasetPicker(props) {
  const { datasets } = props;
  const links = Object.entries(datasets).map(
    ([id, dataset]) => (
      <a
        href={`?dataset=${id}`}
        className="list-group-item list-group-item-action flex-column align-items-start"
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
    <div class="container-fluid d-flex h-50">
      <div class="${LIGHT_CARD}" style="width: 100%; max-width: 330px; margin: auto;" >
        <form method="GET">
          <h1>🚄  Vitessce</h1>
          <div class="py-2" id="dataset-picker"></div>
        </form>
      </div>
    </div>
  `;
  renderComponent(<DatasetPicker datasets={FAKE_API_RESPONSE} />, 'dataset-picker');
}

function renderDataset(id, datasetId) {
  const { layers, name, description } = FAKE_API_RESPONSE[datasetId];
  const [sideLg, sideMd] = [3, 4];
  const [middleLg, middleMd] = [12 - 2 * sideLg, 12 - 2 * sideMd];
  const col = 'd-flex flex-column px-2';
  const side = `${col} col-lg-${sideLg} col-md-${sideMd}`;
  const middle = `${col} col-lg-${middleLg} col-md-${middleMd}`;
  // Card around toolpicker seemed like a waste of space
  document.getElementById(id).innerHTML = `
    <div class="container-fluid d-flex h-100 p-2">
      <div class="${side}">
        <div id="layermanager"><!-- No UI exposure --></div>
        <div class="d-flex flex-column h-25">
          <div id="title" class="${SCROLL_CARD}"></div>
        </div>
        <div id="status" class="my-2 d-flex flex-column h-25"></div>
        <div id="tsne" class="d-flex flex-column h-50"></div>
      </div>
      <div class="${middle}">
        <div id="spatial" class="d-flex flex-column h-75"></div>
        <div id="heatmap" class="d-flex flex-column h-25"></div>
      </div>
      <div class="${side}">
        <div id="factors" class="d-flex flex-column h-25"></div>
        <div id="genes" class="d-flex flex-column h-75"></div>
      </div>
    </div>
  `;

  renderComponent(<LayerManagerPublisher layers={layers} />, 'layermanager');
  renderComponent(<div><h4>{name}</h4><p>{description}</p></div>, 'title');
  renderComponent(<StatusSubscriber />, 'status');
  renderComponent(<TsneSubscriber />, 'tsne');
  renderComponent(<HeatmapSubscriber />, 'heatmap');
  renderComponent(<SpatialSubscriber />, 'spatial');
  renderComponent(<FactorsSubscriber />, 'factors');
  renderComponent(<GenesSubscriber />, 'genes');
}

export default function renderApp(id) {
  const datasetId = new URLSearchParams(window.location.search).get('dataset');
  if (datasetId) {
    renderDataset(id, datasetId);
  } else {
    renderWelcome(id);
  }
}
