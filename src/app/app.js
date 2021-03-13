import React, { useEffect, useRef, useState } from 'react';
import { getConfig, listConfigs } from './api';
import Welcome from './Welcome';
import Warning from './Warning';
import Vitessce from './Vitessce';

import '../css/index.scss';
import '../../node_modules/react-grid-layout/css/styles.css';
import '../../node_modules/react-resizable/css/styles.css';

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


function checkResponse(response, theme, debug) {
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
      return Promise.resolve(() => (
        <Vitessce
          config={config}
          theme={theme}
          // eslint-disable-next-line no-console
          onConfigChange={debug ? console.log : undefined}
          validateOnConfigChange={debug}
        />
      ));
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

/**
 * Convenience function for creating the minimal Vitessce demo and demo listing
 * components based on the current URL parameters.
 * @param {object} params
 * @param {number|null} params.rowHeight The row height to pass to the Vitessce grid.
 * Optional. By default, null.
 * @param {boolean} showBetaHeader Should the header which links to the beta documentation
 * website be rendered? Optional. By default, false.
 * @returns A component, either <Welcome/> or <Vitessce/> depending on the URL params.
 */
export function createApp(params) {
  const { rowHeight = null, showBetaHeader = false } = params;
  const urlParams = new URLSearchParams(window.location.search);
  const datasetId = urlParams.get('dataset');
  const debug = urlParams.get('debug') === 'true';
  const datasetUrl = urlParams.get('url');
  const showAll = urlParams.get('show') === 'all';
  const theme = validateTheme(urlParams.get('theme'));

  if (datasetId) {
    const config = getConfig(datasetId);
    return (
      <Vitessce
        config={config}
        rowHeight={rowHeight}
        theme={theme}
        // eslint-disable-next-line no-console
        onConfigChange={(debug ? console.log : undefined)}
        validateOnConfigChange={debug}
      />
    );
  }
  if (datasetUrl) {
    const responsePromise = fetch(datasetUrl)
      .then(response => checkResponse(response, theme, debug))
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
  return (<Welcome configs={configs} theme={theme} showBetaHeader={showBetaHeader} />);
}
