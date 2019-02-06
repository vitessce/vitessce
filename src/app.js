import React from 'react';
import ReactDOM from 'react-dom';

import { FileManagerPublisher } from './components/fileManager';
import { MessagesSubscriber } from './components/messages';
import { TsneSubscriber } from './components/tsne/';
import { HeatmapSubscriber } from './components/heatmap/';
import { SpatialSubscriber } from './components/spatial/';

import './css/file-drop.css';
import './css/index.css';

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

export default function renderApp(id) {
  const card = 'card card-body bg-light my-2';
  const [lLg, lMd, lSm] = [4, 5, 6];
  const [rLg, rMd, rSm] = [12 - lLg, 12 - lMd, 12 - lSm];
  const col = 'd-flex flex-column pr-2';
  const left = `${col} col-lg-${lLg} col-md-${lMd} col-sm-${lSm}`;
  const right = `${col} col-lg-${rLg} col-md-${rMd} col-sm-${rSm}`;
  document.getElementById(id).innerHTML = `
    <div class="container-fluid d-flex h-100 px-0">
      <div class="${left}">
        <div id="filemanager" class="${card}"></div>
        <div id="messages" class="${card}"></div>
        <div id="tsne" class="${card}" style="height: 50%;"></div>
      </div>
      <div class="${right}">
        <div id="spatial" class="${card}" style="height: 60%;"></div>
        <div id="heatmap" class="${card}" style="min-height: 200px;"></div>
      </div>
    </div>
  `;

  renderComponent(<FileManagerPublisher />, 'filemanager');
  renderComponent(<MessagesSubscriber />, 'messages');
  renderComponent(<TsneSubscriber />, 'tsne');
  renderComponent(<HeatmapSubscriber />, 'heatmap');
  renderComponent(<SpatialSubscriber />, 'spatial');
}
