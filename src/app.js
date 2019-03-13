import React from 'react';
import ReactDOM from 'react-dom';

import { LayerManagerPublisher } from './components/layermanager';
import { StatusSubscriber } from './components/status';
import { TsneSubscriber } from './components/tsne';
import { HeatmapSubscriber } from './components/heatmap';
import { SpatialSubscriber } from './components/spatial';
import { GenesSubscriber } from './components/genes';

import './css/index.css';

const urlPrefix = 'https://s3.amazonaws.com/vitessce-data/0.0.8/linnarsson-2018';
const FAKE_API_RESPONSE = {
  'linnarsson-2018': {
    name: 'Linnarsson - osmFISH',
    description: 'Spatial organization of the somatosensory cortex revealed by cyclic smFISH',
    layers: ['cells', 'clusters', 'factors', 'genes', 'molecules', 'neighborhoods'].map(name => ({
      name,
      type: name.toUpperCase(),
      url: `${urlPrefix}/linnarsson.${name}.json`,
    })).concat([
      {
        name: 'images',
        type: 'IMAGES',
        url: `${urlPrefix}/linnarsson.nuclei.json`,
      },
      // TODO: add polyT
    ]),
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
      <div class="card card-body bg-light" style="width: 100%; max-width: 330px; margin: auto;" >
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
  const card = 'card card-body bg-light my-2';
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
          <div id="title" class="${card}" style="overflow: scroll;"></div>
        </div>
        <div id="status" class="my-2 d-flex flex-column h-25"></div>
        <div class="d-flex flex-column h-50">
          <div>t-SNE</div>
          <div id="tsne" class="${card}"></div>
        </div>
      </div>
      <div class="${middle}">
        <div class="d-flex flex-column h-75">
          <div>Spatial</div>
          <div id="spatial" class="${card}"></div>
        </div>
        <div class="d-flex flex-column h-25">
          <div>Heatmap</div>
          <div id="heatmap" class="${card}"></div>
        </div>
      </div>
      <div class="${side}">
        <div class="d-flex flex-column h-100">
          <div>Genes</div>
          <div id="genes" class="${card}" style="overflow: scroll;"></div>
        </div>
      </div>
    </div>
  `;

  renderComponent(<LayerManagerPublisher layers={layers} />, 'layermanager');
  renderComponent(<div><h4>{name}</h4><p>{description}</p></div>, 'title');
  renderComponent(<StatusSubscriber />, 'status');
  renderComponent(<TsneSubscriber />, 'tsne');
  renderComponent(<HeatmapSubscriber />, 'heatmap');
  renderComponent(<SpatialSubscriber />, 'spatial');
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
