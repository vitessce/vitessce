import React from 'react';
import ReactDOM from 'react-dom';

import '../css/index.css';
import '../../node_modules/react-grid-layout/css/styles.css';
import '../../node_modules/react-resizable/css/styles.css';

import Welcome from './Welcome';
import PubSubVitessceGrid from './PubSubVitessceGrid';

import { getConfig, listConfigs } from './api';


function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

export default function renderApp(id) {
  const datasetId = new URLSearchParams(window.location.search).get('dataset');
  if (datasetId) {
    const config = getConfig(datasetId);
    renderComponent(
      <PubSubVitessceGrid config={config} />,
      id,
    );
  } else {
    const configs = listConfigs();
    renderComponent(
      <Welcome configs={configs} />,
      id,
    );
  }
}
