import React from 'react';
import ReactDOM from 'react-dom';
import VitessceGrid from 'vitessce-grid';

import '../css/index.css';
import '../../node_modules/react-grid-layout/css/styles.css';
import '../../node_modules/react-resizable/css/styles.css';

import Welcome from './Welcome';
import { LayerManagerPublisher } from '../components/layermanager';

import { getConfig } from './api';
import getComponent from './componentRegistry';

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

export default function renderApp(id) {
  const datasetId = new URLSearchParams(window.location.search).get('dataset');
  if (datasetId) {
    const config = getConfig(datasetId);
    renderComponent(
      <React.Fragment>
        <LayerManagerPublisher layers={config.layers} />
        <VitessceGrid
          layout={config.responsiveLayout}
          getComponent={getComponent}
        />,
      </React.Fragment>,
      id,
    );
  } else {
    renderComponent(
      <Welcome />,
      id,
    );
  }
}
