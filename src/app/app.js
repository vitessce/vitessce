import React from 'react';
import ReactDOM from 'react-dom';

import { LIGHT_CARD } from '../components/classNames';

import '../css/index.css';
import '../../node_modules/react-grid-layout/css/styles.css';
import '../../node_modules/react-resizable/css/styles.css';

import Welcome from './Welcome';
import PubSubVitessceGrid from './PubSubVitessceGrid';

import { getConfig, listConfigs } from './api';


function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

function Warning(props) {
  const { title, preformatted, unformatted } = props;
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className={LIGHT_CARD}>
            <h1>{title}</h1>
            <pre>{preformatted}</pre>
            <div>{unformatted}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function preformattedDetails(response) {
  return `
    ok: ${response.ok}
    status: ${response.status}
    statusText: ${response.statusText}
    redirected: ${response.redirected}
    type: ${response.type}
    url: ${response.url}`; // TODO: headers
}

function renderResponse(response, id) {
  if (!response.ok) {
    renderComponent(
      <Warning
        title="Fetch response not OK"
        preformatted={preformattedDetails(response)}
      />, id,
    );
  } else {
    response.text().then((text) => {
      try {
        const config = JSON.parse(text);
        renderComponent(<PubSubVitessceGrid config={config} />, id);
      } catch (e) {
        renderComponent(
          <Warning
            title="Error parsing JSON"
            preformatted={preformattedDetails(response)}
            unformatted={`${e.message}: ${text}`}
          />, id,
        );
      }
    });
  }
}

export default function renderApp(id) {
  const datasetId = new URLSearchParams(window.location.search).get('dataset');
  const datasetUrl = new URLSearchParams(window.location.search).get('url');

  if (datasetId) {
    const config = getConfig(datasetId);
    renderComponent(<PubSubVitessceGrid config={config} />, id);
  } else if (datasetUrl) {
    fetch(datasetUrl)
      .then(response => renderResponse(response, id))
      .catch(error => renderComponent(
        <Warning
          title="Error fetching"
          unformatted={error.message}
        />, id,
      ));
  } else {
    const configs = listConfigs();
    renderComponent(<Welcome configs={configs} />, id);
  }
}
