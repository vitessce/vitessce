import React from 'react';
import ReactDOM from 'react-dom';

import './css/file-drop.css';
import './css/index.css';

import { FileManagerPublisher } from './components/fileManager';
import { MessagesSubscriber } from './components/messages';
import { TsneSubscriber } from './components/tsne';
import { HeatmapSubscriber } from './components/heatmap';
import { SpatialSubscriber } from './components/spatial/';

function render(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

render(<FileManagerPublisher />, 'filemanager');
render(<MessagesSubscriber />, 'messages');
render(<TsneSubscriber />, 'tsne');
render(<HeatmapSubscriber />, 'heatmap');
render(<SpatialSubscriber />, 'spatial');
