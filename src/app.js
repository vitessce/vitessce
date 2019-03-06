import React from 'react';
import ReactDOM from 'react-dom';

import ToolMenu from './components/ToolMenu';
import { LayerManagerPublisher } from './components/layermanager';
import { StatusSubscriber } from './components/status';
import { TsneSubscriber } from './components/tsne';
import { HeatmapSubscriber } from './components/heatmap';
import { SpatialSubscriber } from './components/spatial';

import './css/index.css';

const FAKE_API_RESPONSE = {
  'linnarsson-2018': {
    name: 'Linnarsson - osmFISH',
    description: 'Spatial organization of the somatosensory cortex revealed by cyclic smFISH',
    layers: [
      {
        name: 'Molecules',
        type: 'MOLECULES',
        url: 'https://s3.amazonaws.com/vitessce-data/linnarsson.molecules.json',
      },
      {
        name: 'Cells',
        type: 'CELLS',
        url: 'https://s3.amazonaws.com/vitessce-data/linnarsson.cells.json',
      },
      {
        name: 'Images',
        type: 'IMAGES',
        url: 'https://s3.amazonaws.com/vitessce-data/linnarsson.polyt.json',
      },
    ],
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
  const { layers } = FAKE_API_RESPONSE[datasetId];
  const card = 'card card-body bg-light my-2';
  const [lLg, lMd, lSm] = [4, 5, 6];
  const [rLg, rMd, rSm] = [12 - lLg, 12 - lMd, 12 - lSm];
  const col = 'd-flex flex-column px-2';
  const left = `${col} col-lg-${lLg} col-md-${lMd} col-sm-${lSm}`;
  const right = `${col} col-lg-${rLg} col-md-${rMd} col-sm-${rSm}`;
  // Card around toolpicker seemed like a waste of space
  document.getElementById(id).innerHTML = `
    <div class="container-fluid d-flex h-100 p-2">
      <div class="${left}">
        <div id="toolmenu" class="my-2"></div>
        <div id="layermanager" class="${card}"></div>
        <div id="status" class="my-2"></div>
        <div class="d-flex flex-column h-50">
          <div>tSNE</div>
          <div id="tsne" class="${card}"></div>
        </div>
      </div>
      <div class="${right}">
        <div class="d-flex flex-column h-75">
          <div>Spatial</div>
          <div id="spatial" class="${card}"></div>
        </div>
        <div class="d-flex flex-column h-25">
          <div>Heatmap</div>
          <div id="heatmap" class="${card}"></div>
        </div>
      </div>
    </div>
  `;

  renderComponent(<ToolMenu />, 'toolmenu');
  renderComponent(<LayerManagerPublisher layers={layers} />, 'layermanager');
  renderComponent(<StatusSubscriber />, 'status');
  renderComponent(<TsneSubscriber />, 'tsne');
  renderComponent(<HeatmapSubscriber />, 'heatmap');
  renderComponent(<SpatialSubscriber />, 'spatial');
}

export default function renderApp(id) {
  const datasetId = new URLSearchParams(window.location.search).get('dataset');
  if (datasetId) {
    renderDataset(id, datasetId);
  } else {
    renderWelcome(id);
  }
}
