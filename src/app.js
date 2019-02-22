import React from 'react';
import ReactDOM from 'react-dom';

import ToolMenu from './components/ToolMenu';
import { FileManagerPublisher } from './components/filemanager';
import { StatusSubscriber } from './components/status';
import { TsneSubscriber } from './components/tsne';
import { HeatmapSubscriber } from './components/heatmap';
import { SpatialSubscriber } from './components/spatial';

import './css/file-drop.css';
import './css/index.css';

const FAKE_API_RESPONSE = {
  'linnarsson-2018': {
    name: 'Linnarsson - osmFISH',
    layers: [
      {
        name: 'Cells',
        type: 'CELLS',
        url: 'https://s3.amazonaws.com/vitessce-data/linnarsson.cells.json',
      },
      {
        name: 'Molecules',
        type: 'MOLECULES',
        url: 'https://s3.amazonaws.com/vitessce-data/linnarsson.molecules.json',
      },
    ],
  },
  'todo-2019': {
    name: 'TODO',
    layers: [],
  },
};

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

function renderComponents(id, datasetId) {
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
        <div id="filemanager" class="${card}"></div>
        <div id="status" class="my-2"></div>
        <div id="tsne" class="${card}" style="height: 50%;"></div>
      </div>
      <div class="${right}">
        <div id="spatial" class="${card}" style="height: 60%;"></div>
        <div id="heatmap" class="${card}" style="min-height: 200px;"></div>
      </div>
    </div>
  `;

  renderComponent(<ToolMenu />, 'toolmenu');
  renderComponent(<FileManagerPublisher layers={layers} />, 'filemanager');
  renderComponent(<StatusSubscriber />, 'status');
  renderComponent(<TsneSubscriber />, 'tsne');
  renderComponent(<HeatmapSubscriber />, 'heatmap');
  renderComponent(<SpatialSubscriber />, 'spatial');
}

function DatasetPicker(props) {
  const { datasets } = props;
  const options = Object.entries(datasets).map(
    ([id, dataset]) => <option value={id} key={id}>{dataset.name}</option>,
  );
  return (
    <select name="dataset" className="btn btn-outline-dark">
      {options}
    </select>
  );
}

function renderWelcome(id) {
  document.getElementById(id).innerHTML = `
    <div class="container-fluid d-flex h-50">
      <div class="card card-body bg-light" style="width: 100%; max-width: 330px; margin: auto;" >
        <form method="GET">
          <h1>🚄  Vitessce</h1>
          <div class="py-2" id="dataset-picker"></div>
          <input type="submit" class="btn btn-outline-primary btn-sm">
        </form>
      </div>
    </div>
  `;
  renderComponent(<DatasetPicker datasets={FAKE_API_RESPONSE} />, 'dataset-picker');
}

export default function renderApp(id) {
  const datasetId = new URLSearchParams(window.location.search).get('dataset');
  if (datasetId) {
    renderComponents(id, datasetId);
  } else {
    renderWelcome(id);
  }
}
