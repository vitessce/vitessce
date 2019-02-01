import React from 'react';
import ReactDOM from 'react-dom';

import './css/file-drop.css';
import './css/index.css';

import { FileManagerPublisher } from '../../src/components/fileManager';
import { MessagesSubscriber } from '../../src/components/messages';
import { TsneSubscriber } from '../../src/components/tsne/';
import { HeatmapSubscriber } from '../../src/components/heatmap/';
import { SpatialSubscriber } from '../../src/components/spatial/';

function render(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

render(<FileManagerPublisher />, 'filemanager');
render(<MessagesSubscriber />, 'messages');
render(<TsneSubscriber />, 'tsne');
render(<HeatmapSubscriber />, 'heatmap');
render(<SpatialSubscriber />, 'spatial');
