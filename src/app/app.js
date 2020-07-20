import React, { useEffect, useRef, useState } from 'react';
import Ajv from 'ajv';
import {
  ThemeProvider, StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles';

import datasetSchema from '../schemas/dataset.schema.json';

import { PRIMARY_CARD } from '../components/classNames';

import '../css/index.scss';
import '../../node_modules/react-grid-layout/css/styles.css';
import '../../node_modules/react-resizable/css/styles.css';

import Welcome from './Welcome';
import PubSubVitessceGrid from './PubSubVitessceGrid';

import { getConfig, listConfigs } from './api';
import getComponent from './componentRegistry';
import { muiTheme } from '../components/shared-mui/styles';

const generateClassName = createGenerateClassName({
  disableGlobal: true,
});

function Warning(props) {
  const {
    title,
    preformatted,
    unformatted,
    theme,
  } = props;
  return (
    <div className={`vitessce-container vitessce-theme-${theme}`}>
      <div className="warning-layout container-fluid">
        <div className="row">
          <div className="col-12">
            <div className={PRIMARY_CARD}>
              <h1>{title}</h1>
              <pre>{preformatted}</pre>
              <div>{unformatted}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AwaitResponse(props) {
  const {
    response,
    theme,
  } = props;
  const [isLoading, setIsLoading] = useState(true);
  const responseRef = useRef();
  useEffect(() => {
    response.then((c) => {
      responseRef.current = c;
      setIsLoading(false);
    });
  }, [response]);
  return (!isLoading ? React.createElement(responseRef.current) : <Warning title="Loading..." theme={theme} />);
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

/**
 * The Vitessce component.
 * @param {object} props
 * @param {object} props.config A Vitessce view config.
 * If the config is valid, the PubSubVitessceGrid will be rendered as a child.
 * If the config is invalid, a Warning will be rendered instead.
 * @param {number} props.rowHeight Row height for grid layout. Optional.
 * @param {string} props.theme The theme, used for styling as
 * light or dark. Optional. By default, "dark"
 */
export function Vitessce(props) {
  const {
    config,
    rowHeight,
    height,
    theme,
  } = props;
  if (!config) {
    // If the config value is undefined, show a warning message
    return (
      <Warning
        title="No such dataset"
        unformatted="The dataset configuration could not be found."
        theme={theme}
      />
    );
  }
  // NOTE: Remove when this is available in UI.
  console.groupCollapsed('🚄 Vitessce view configuration');
  console.info(`data:,${JSON.stringify(config)}`);
  console.info(JSON.stringify(config, null, 2));
  console.groupEnd();
  const validate = new Ajv().compile(datasetSchema);
  const valid = validate(config);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    return (
      <Warning
        title="Config validation failed"
        preformatted={failureReason}
        theme={theme}
      />
    );
  }
  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={muiTheme[theme]}>
        <PubSubVitessceGrid
          config={config}
          getComponent={getComponent}
          rowHeight={rowHeight}
          height={height}
          theme={theme}
        />
      </ThemeProvider>
    </StylesProvider>
  );
}

function checkResponse(response, theme) {
  if (!response.ok) {
    return Promise.resolve(
      () => (
        <Warning
          title="Fetch response not OK"
          preformatted={preformattedDetails(response)}
          theme={theme}
        />
      ),
    );
  }
  return response.text().then((text) => {
    try {
      const config = JSON.parse(text);
      return Promise.resolve(() => (<Vitessce config={config} theme={theme} />));
    } catch (e) {
      return Promise.resolve(() => (
        <Warning
          title="Error parsing JSON"
          preformatted={preformattedDetails(response)}
          unformatted={`${e.message}: ${text}`}
          theme={theme}
        />
      ));
    }
  });
}

/**
 * Use the theme provided if it is valid, otherwise fall back to the 'dark' theme.
 * @param {string} theme A potentially invalid theme name.
 * @returns {string} A valid theme name.
 */
function validateTheme(theme) {
  return (['light', 'dark'].includes(theme) ? theme : 'dark');
}

export function createApp(rowHeight = null) {
  const urlParams = new URLSearchParams(window.location.search);
  const datasetId = urlParams.get('dataset');
  const datasetUrl = urlParams.get('url');
  const showAll = urlParams.get('show') === 'all';
  const theme = validateTheme(urlParams.get('theme'));

  if (datasetId) {
    const config = getConfig(datasetId);
    return (<Vitessce config={config} rowHeight={rowHeight} theme={theme} />);
  }
  if (datasetUrl) {
    const responsePromise = fetch(datasetUrl)
      .then(response => checkResponse(response, theme))
      .catch(error => Promise.resolve(
        <Warning
          title="Error fetching"
          unformatted={error.message}
          theme={theme}
        />,
      ));
    return (
      <AwaitResponse response={responsePromise} theme={theme} />
    );
  }
  const configs = listConfigs(showAll);
  return (<Welcome configs={configs} theme={theme} />);
}
