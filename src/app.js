import React from 'react';
import ReactDOM from 'react-dom';

import { FileManagerPublisher } from './components/fileManager';
import { MessagesSubscriber } from './components/messages';
import { TsneSubscriber } from './components/tsne/';
import { HeatmapSubscriber } from './components/heatmap/';
import { SpatialSubscriber } from './components/spatial/';

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

export default function renderApp(id) {
  document.getElementById(id).innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <div id="sidebar" class="col-lg-4 col-md-5 col-sm-6">
          <div class="card card-body bg-light my-3" style="height: 30%;">
            <div id="filemanager"></div>
            <div id="messages"></div>
          </div>
          <div id="tsne" class="card card-body bg-light my-3" style="height: 65%;"></div>
        </div>
        <div id="main" class="col-lg-8 col-md-7 col-sm-6">
          <div id="spatial" class="card card-body bg-light my-3" style="height: 60%;"></div>
          <div id="heatmap" class="card card-body bg-light my-3" style="height: 35%;"></div>
        </div>
      </div>
    </div>
  `;

  renderComponent(<FileManagerPublisher />, 'filemanager');
  renderComponent(<MessagesSubscriber />, 'messages');
  renderComponent(<TsneSubscriber />, 'tsne');
  renderComponent(<HeatmapSubscriber />, 'heatmap');
  renderComponent(<SpatialSubscriber />, 'spatial');
}
