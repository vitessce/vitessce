import React, { useState, useEffect } from 'react';
import { QueryParamProvider, useQueryParam, StringParam, BooleanParam } from 'use-query-params';
import useHashParam from './_use-hash-param';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Home from './_Home';
import DemoHeader from './_DemoHeader';
import ThemedVitessce from './_ThemedVitessce';

import { configs } from '../../../src/demo/configs';

import styles from './styles.module.css';

function VitessceAppStyles() {
    return (
        <style>{`   
            .footer {
                display: none;
            }
            .navbar__item {
                opacity: 0.2;
                transition: opacity 0.25s;
            }
            .navbar:hover .navbar__item {
                opacity: 1;
            }
        `}</style>
    );
}

function IndexWithHashParams() {
  const [demo, setDemo] = useHashParam('dataset', undefined, 'string');
  const [debug, setDebug] = useHashParam('debug', false, 'boolean');
  const [url, setUrl] = useHashParam('url', undefined, 'string');
  const [edit, setEdit] = useHashParam('edit', false, 'boolean');


  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validConfig, setValidConfig] = useState(undefined);

  useEffect(() => {
      let unmounted = false;
      async function processParams() {
        if (url) {
          setLoading(true);
          try {
            const response = await fetch(url);
            if(unmounted) {
              return;
            }
            if(response.ok) {
              const responseText = await response.text();
              if(unmounted) {
                return;
              }

              try {
                  const responseJson = JSON.parse(responseText);
                  // TODO: validate here.
                  setValidConfig(responseJson);
                  setError(null);
              } catch(e) {
                  setError({
                      title: "Error parsing JSON",
                      message: e.message,
                  });
                  setValidConfig(null);
              }
              
              setLoading(false);
            } else {
              setError({
                title: "Fetch response not OK",
                message: response.statusText,
              });
              setLoading(false);
              setValidConfig(null);
            }
          } catch(e) {
            setError({
              title: "Fetch error",
              message: e.message,
            });
            setLoading(false);
            setValidConfig(null);
          }
        } else if(demo && configs[demo]) {
          setValidConfig(configs[demo]); 
          setError(null);
          setLoading(false);
        } else {
          setValidConfig(null);
          setError(null);
          setLoading(false);
        }
      }
      processParams();
      return () => {
        unmounted = true;
      };
    }, [url, demo]);

  function handleEdit() {
    setDemo(undefined);
    setUrl('data:,' + encodeURIComponent(JSON.stringify(validConfig)));
    setEdit(true);
  }
  
  return (edit ? (
    null
  ) : validConfig ? (
      <div>
        {demo && Object.keys(configs).includes(demo) ? (
          <DemoHeader
            demo={demo}
            config={configs[demo]}
          />
        ) : null}
        <main className="vitessce-app">
            <VitessceAppStyles />
            <ThemedVitessce
                validateOnConfigChange={debug}
                onConfigChange={debug ? console.log : undefined}
                config={validConfig}
            />
            <div className={styles.vitessceClear}>
                <button
                    className={styles.vitessceClearButton}
                    onClick={handleEdit}>
                    Edit
                </button>
            </div>
        </main>
      </div>
    ) : (validConfig === null ? (
      <Home />
    ) : null));
}

function IndexWithQueryParamRedirect() {
  // Determine whether query parameters were used.
  // If so, redirect to the hash parameter equivalent.
  // Reference: https://github.com/vitessce/vitessce/pull/810#discussion_r745842290
  const baseUrl = useBaseUrl('/#?');
  const [demo] = useQueryParam('dataset', StringParam);
  const [url] = useQueryParam('url', StringParam);
  
  useEffect(() => {
    const hasQueryParams = demo || url;
    if(hasQueryParams) {
      const params = (demo ? 'dataset=' + demo : 'url=' + url);
      window.location.href = baseUrl + params;
    }
  }, [baseUrl, demo, url]);
  
  return (<IndexWithHashParams />);
}

export default function Index() {
  return (
    <QueryParamProvider>
      <IndexWithQueryParamRedirect />
    </QueryParamProvider>
  );
}
