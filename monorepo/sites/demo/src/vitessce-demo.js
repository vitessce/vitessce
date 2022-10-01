import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable no-console */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Vitessce } from 'vitessce';
import { getConfig, listConfigs } from './api';
import { Welcome } from './welcome';
import { Warning } from './warning';
import './index.scss';
function AwaitResponse(props) {
    const { response, theme, } = props;
    const [isLoading, setIsLoading] = useState(true);
    const responseRef = useRef();
    useEffect(() => {
        response.then((c) => {
            responseRef.current = c;
            setIsLoading(false);
        });
    }, [response]);
    return (!isLoading ? React.createElement(responseRef.current) : _jsx(Warning, { title: "Loading...", theme: theme }));
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
function logConfigUpgrade(prevConfig, nextConfig) {
    // eslint-disable-next-line no-console
    console.log(`Upgrade view config schema from ${prevConfig.version} to ${nextConfig.version}`);
    // eslint-disable-next-line no-console
    console.log(prevConfig);
    // eslint-disable-next-line no-console
    console.log(nextConfig);
}
function checkResponse(response, theme, debug) {
    if (!response.ok) {
        return Promise.resolve(() => (_jsx(Warning, { title: "Fetch response not OK", preformatted: preformattedDetails(response), theme: theme })));
    }
    return response.text().then((text) => {
        try {
            const config = JSON.parse(text);
            return Promise.resolve(() => (_jsx(Vitessce, { config: config, theme: theme, onConfigChange: debug ? console.log : undefined, onConfigUpgrade: debug ? logConfigUpgrade : undefined, validateOnConfigChange: debug })));
        }
        catch (e) {
            return Promise.resolve(() => (_jsx(Warning, { title: "Error parsing JSON", preformatted: preformattedDetails(response), unformatted: `${e.message}: ${text}`, theme: theme })));
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
export function VitessceDemo() {
    const result = useMemo(() => {
        const { rowHeight = null } = {};
        const urlParams = new URLSearchParams(window.location.search);
        const datasetId = urlParams.get('dataset');
        const debug = urlParams.get('debug') === 'true';
        const datasetUrl = urlParams.get('url');
        const showAll = urlParams.get('show') === 'all';
        const theme = validateTheme(urlParams.get('theme'));
        if (datasetId) {
            const config = getConfig(datasetId);
            return (_jsx(Vitessce, { config: config, rowHeight: rowHeight, theme: theme, onConfigChange: debug ? console.log : undefined, onConfigUpgrade: debug ? logConfigUpgrade : undefined, validateOnConfigChange: debug }));
        }
        if (datasetUrl) {
            const responsePromise = fetch(datasetUrl)
                .then(response => checkResponse(response, theme, debug))
                .catch(error => Promise.resolve(() => (_jsx(Warning, { title: "Error fetching", unformatted: error.message, theme: theme }))));
            return (_jsx(AwaitResponse, { response: responsePromise, theme: theme }));
        }
        const configs = listConfigs(showAll);
        return (_jsx(Welcome, { configs: configs, theme: theme }));
    }, [window.location.search]);
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
      html, body {
        height: 100%;
      }
      body {
        font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
        display: flex;
        flex-direction: column;
      }
      #root {
        flex: 1;
      }
      #root .vitessce-container {
        height: max(100%, 100vh);
        width: 100%;
        overflow: hidden;
      }
      ` }), result] }));
}
