import React, { useCallback, useEffect, useState, useReducer } from 'react';
import clsx from 'clsx';
import { useQueryParam, StringParam, BooleanParam, QueryParamProvider } from 'use-query-params';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useThemeContext from '@theme/hooks/useThemeContext';
import { useDropzone } from 'react-dropzone';
import ControlledEditor from './_ControlledEditor';
import { LiveProvider, LiveContext, LiveError, LivePreview } from 'react-live';
import Highlight, { defaultProps } from "prism-react-renderer";
import usePrismTheme from '@theme/hooks/usePrismTheme';
import copy from 'copy-text-to-clipboard';
import {
  Vitessce,
  VitessceConfig, hconcat, vconcat,
  CoordinationType, Component, DataType, FileType,
} from '../../../dist/umd/production/index.min.js';
import styles from './styles.module.css';

import { configs } from '../../../src/demo/configs';

const JSON_TRANSLATION_KEY = 'vitessceJsonTranslation';

const baseJson = `{
  "version": "1.0.0",
  "name": "My config",
  "description": "",
  "datasets": [],
  "coordinationSpace": {},
  "layout": [],
  "initStrategy": "auto"
}`;

const baseJs = `const vc = new VitessceConfig("My config");

return vc.toJSON();`;

const exampleJs = `// Instantiate a view config object.
const vc = new VitessceConfig("My example config", "This demonstrates the JavaScript API");
// Add a dataset and its files.
const baseUrl = "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries";
const dataset = vc
    .addDataset("Dries")
    .addFile(baseUrl + '/dries.cells.json', dt.CELLS, ft.CELLS_JSON)
    .addFile(baseUrl + '/dries.cell-sets.json', dt.CELL_SETS, ft.CELL_SETS_JSON);
// Add components.
// Use mapping: "UMAP" so that cells are mapped to the UMAP positions from the JSON file.
const umap = vc.addView(dataset, cm.SCATTERPLOT, { mapping: "UMAP" });
// Use mapping: "t-SNE" so that cells are mapped to the t-SNE positions from the JSON file.
const tsne = vc.addView(dataset, cm.SCATTERPLOT, { mapping: "t-SNE" });
// Add the cell sets controller component.
const cellSetsManager = vc.addView(dataset, cm.CELL_SETS);
// Add the cell set sizes bar plot component.
const cellSetSizesPlot = vc.addView(dataset, cm.CELL_SET_SIZES);
// Link the zoom levels of the two scatterplots.
vc.linkViews([umap, tsne], [ct.EMBEDDING_ZOOM], [2.5]);
// Try un-commenting the line below to link center points of the two scatterplots!
//vc.linkViews([umap, tsne], [ct.EMBEDDING_TARGET_X, ct.EMBEDDING_TARGET_Y], [0, 0]);
vc.layout(
    vconcat(
        hconcat(tsne, umap),
        hconcat(cellSetsManager, cellSetSizesPlot)
    )
);

return vc.toJSON();`;

const exampleJson = `{
  "version": "1.0.0",
  "name": "My example config",
  "description": "This demonstrates the JSON schema",
  "datasets": [
    {
      "uid": "D1",
      "name": "Dries",
      "files": [
        {
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries/dries.cells.json",
          "type": "cells",
          "fileType": "cells.json"
        },
        {
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/dries/dries.cell-sets.json",
          "type": "cell-sets",
          "fileType": "cell-sets.json"
        }
      ]
    }
  ],
  "coordinationSpace": {
    "dataset": {
      "A": "D1"
    },
    "embeddingType": {
      "A": "UMAP",
      "B": "t-SNE"
    },
    "embeddingZoom": {
      "A": 2.5
    }
  },
  "layout": [
    {
      "component": "scatterplot",
      "coordinationScopes": {
        "dataset": "A",
        "embeddingType": "A",
        "embeddingZoom": "A"
      },
      "x": 6,
      "y": 0,
      "w": 6,
      "h": 6
    },
    {
      "component": "scatterplot",
      "coordinationScopes": {
        "dataset": "A",
        "embeddingType": "B",
        "embeddingZoom": "A"
      },
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 6
    },
    {
      "component": "cellSets",
      "coordinationScopes": {
        "dataset": "A"
      },
      "x": 0,
      "y": 6,
      "w": 6,
      "h": 6
    },
    {
      "component": "cellSetSizes",
      "coordinationScopes": {
        "dataset": "A"
      },
      "x": 6,
      "y": 6,
      "w": 6,
      "h": 6
    }
  ],
  "initStrategy": "auto"
}`;

function transformCode(code) {
  return `function vitessceConfigEditor() {
      
      function createConfig() {
          ${code}
      }
      
      const vcJson = createConfig();
  
      return (
          <Highlight json={vcJson} />
      );
  }`;
}

function ThemedControlledEditor(props) {
  const { isDarkTheme } = useThemeContext();
  return <ControlledEditor
    {...props}
    theme={(isDarkTheme ? "dark" : "GitHub")}
  />
}

function ThemedVitessce(props) {
    const { isDarkTheme } = useThemeContext();
    return (
        <Vitessce
            theme={isDarkTheme ? "dark" : "light"}
            {...props}
        />
    );
}

function LivePreviewHeader() {
  return (
      <p className={styles.livePreviewHeader}>Translation to JSON</p>
  );
}

function JsonHighlight(props) {
  const {
      json,
  } = props;
  const { isDarkTheme } = useThemeContext();
  const prismTheme = {
    "plain":{
      "color":(isDarkTheme ? "#dcdcdc" : "#393A34"),
      "backgroundColor":"#f6f8fa"
    },
    "styles":[
      {
        "types":["comment","prolog","doctype","cdata"],
        "style":{"color":"#999988","fontStyle":"italic"}
      },
      {
        "types":["namespace"],
        "style":{"opacity":0.7}
      },
      {
        "types":["string","attr-value"],
        "style":{"color":(isDarkTheme ? "#ce9178" : "#0451a5")}
      },
      {
        "types":["punctuation","operator"],
        "style":{"color":(isDarkTheme ? "#dcdcdc" : "#393A34")}
      },
      {
        "types":["entity","url","symbol","variable","constant","property","regex","inserted"],
        "style":{"color":(isDarkTheme ? "#9cdcfe" : "#e3116c")}
      },
      {
        "types":["boolean"],
        "style":{"color":(isDarkTheme ? "#ce9178" : "#0451a5")}
      },
      {
        "types":["number"],
        "style":{"color":(isDarkTheme ? "#aac593" : "#098658")}
      },
      {
        "types":["atrule","keyword","attr-name","selector"],
        "style":{"color":"#00a4db"}
      },
      {
        "types":["function","deleted","tag"],
        "style":{"color":"#d73a49"}
      },
      {
        "types":["function-variable"],
        "style":{"color":"#6f42c1"}
      },
      {
        "types":["tag","selector","keyword"],
        "style":{"color":(isDarkTheme ? "#ce9178" : "#00009f")}
      }
    ]
  };

  const jsonCode = JSON.stringify(json, null, 2);
  
  const [showCopied, setShowCopied] = useState(false);
  
  const handleCopyCode = () => {
      copy(jsonCode);
      setShowCopied(true);
  
      setTimeout(() => setShowCopied(false), 2000);
  };

  useEffect(() => {
    // Put the current translation on the window for easy retrieval.
    // There is probably a better way to do this.
    window[JSON_TRANSLATION_KEY] = jsonCode;
  });
  
  return (
      <Highlight {...defaultProps} code={jsonCode} language="json" theme={prismTheme}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <div className={styles.copyButtonContainer}>
                  <pre className={clsx(className, styles.viewConfigPreviewJSCode)} style={style}>
                      {tokens.map((line, i) => (
                      <div {...getLineProps({ line, key: i })}>
                          {line.map((token, key) => (
                          <span {...getTokenProps({ token, key })} />
                          ))}
                      </div>
                      ))}
                  </pre>
                  <button
                    type="button"
                    aria-label="Copy code to clipboard"
                    className={styles.copyButton}
                    onClick={handleCopyCode}>
                    {showCopied ? 'Copied' : 'Copy'}
                  </button>
              </div>
          )}
      </Highlight>
  )
}

const scope = {
  VitessceConfig: VitessceConfig,
  hconcat: hconcat,
  vconcat: vconcat,
  Component: Component,
  DataType: DataType,
  FileType: FileType,
  CoordinationType: CoordinationType,
  cm: Component,
  dt: DataType,
  ft: FileType,
  ct: CoordinationType,
  Highlight: JsonHighlight,
};

function App() {
  const [demo, setDemo] = useQueryParam('dataset', StringParam);
  const [debug, setDebug] = useQueryParam('debug', BooleanParam);
  const [url, setUrl] = useQueryParam('url', StringParam);
  const [edit, setEdit] = useQueryParam('edit', BooleanParam);
  const [i, increment] = useReducer(v => v+1, 1);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validConfig, setValidConfig] = useState(null);
  
  const [pendingConfig, setPendingConfig] = useState(baseJson);
  const [pendingUrl, setPendingUrl] = useState('');
  const [pendingFileContents, setPendingFileContents] = useState('');

  const [pendingJs, setPendingJs] = useState(baseJs);

  const [syntaxType, setSyntaxType] = useState('JSON');
  const [loadFrom, setLoadFrom] = useState('editor');


  const onDrop = useCallback(acceptedFiles => {
    if(acceptedFiles.length === 1) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const { result } = reader;
        setPendingFileContents(result);
        setLoadFrom('file');
      });
      reader.readAsText(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1});

  useEffect(() => {
    async function processParams() {
      if (url) {
        setLoading(true);
        try {
          const response = await fetch(url);
          if(response.ok) {
            const responseText = await response.text();
            if(edit) {
              // User wants to edit the URL-based config.
              try {
                // Ideally, this is valid JSON and we can
                // use JSON.stringify to add nice indentation.
                const responseJson = JSON.parse(responseText);
                setPendingConfig(JSON.stringify(responseJson, null, 2));
                setValidConfig(null);
              } catch(e) {
                // However, this may be an invalid JSON object
                // so we can just let the user edit the unformatted string.
                setPendingConfig(responseText);
                setValidConfig(null);
              }
              setError(null);
            } else {
              try {
                const responseJson = JSON.parse(responseText);
                // TODO: validate here.
                setPendingConfig(responseJson);
                setValidConfig(responseJson);
                setError(null);
              } catch(e) {
                setError({
                  title: "Error parsing JSON",
                  message: e.message,
                });
                setPendingConfig(responseText);
                setValidConfig(null);
              }
            }
            setLoading(false);
          } else {
            setError({
              title: "Fetch response not OK",
              message: response.statusText,
            });
            setLoading(false);
            setPendingConfig('{}');
            setValidConfig(null);
          }
        } catch(e) {
          setError({
            title: "Fetch error",
            message: e.message,
          });
          setLoading(false);
          setPendingConfig('{}');
          setValidConfig(null);
        }
      } else if(demo && configs[demo]) {
        setPendingConfig(JSON.stringify(configs[demo], null, 2));
        if(edit) {
          setValidConfig(null); 
        } else {
          setValidConfig(configs[demo]); 
        }
        setError(null);
        setLoading(false);
      } else {
        setPendingConfig(baseJson);
        setValidConfig(null);
        setError(null);
        setLoading(false);
      }
    }
    processParams();
  }, [url, edit, demo]);

  function handleEditorGo() {
    setEdit(false, 'pushIn');
    if(loadFrom === 'editor') {
      let nextConfig = pendingConfig;
      if(syntaxType === "JS") {
        nextConfig = window[JSON_TRANSLATION_KEY];
        setSyntaxType("JSON");
      }
      setUrl('data:,' + encodeURIComponent(nextConfig), 'replace');
    } else if(loadFrom === 'url') {
      setUrl(pendingUrl, 'replace');
    } else if(loadFrom === 'file') {
      setUrl('data:,' + encodeURIComponent(pendingFileContents), 'replace');
    }
    increment();
  }

  function handleClear() {
    setEdit(true, 'pushIn');
    increment();
  }

  function handleUrlChange(event) {
    setPendingUrl(event.target.value);
    setLoadFrom('url');
  }

  function handleSyntaxChange(event) {
    setSyntaxType(event.target.value);
  }

  function tryExample() {
    if(syntaxType === "JSON") {
      setPendingConfig(exampleJson);
    } else {
      setPendingJs(exampleJs);
    }
    setLoadFrom('editor');
  }

  function resetEditor() {
    if(syntaxType === "JSON") {
      setPendingConfig(baseJson);
    } else {
      setPendingJs(baseJs);
    }
  }

  const showReset = syntaxType === "JSON" && pendingConfig !== baseJson || syntaxType === "JS" && pendingJs !== baseJs;

  return (
      loading ? (
        <pre>Loading...</pre>
      ) : (!validConfig ? (
        <main className={styles.viewConfigEditorMain}>
          {error && <pre className={styles.vitessceAppLoadError}>{JSON.stringify(error)}</pre>}
          <p className={styles.viewConfigEditorInfo}>
            To use Vitessce, enter a&nbsp;
            <a href={useBaseUrl('/docs/view-config-json/index.html')}>view config</a>
            &nbsp;using the editor below.
            &nbsp;<button onClick={tryExample}>Try an example</button>&nbsp;
            {showReset && <button onClick={resetEditor}>Reset the editor</button>}
          </p>
          <div className={styles.viewConfigEditorType}>
            <label>
              <select className={styles.viewConfigEditorTypeSelect} value={syntaxType} onChange={handleSyntaxChange}>
                <option value="JSON">JSON</option>
                <option value="JS">JS</option>
              </select>
            </label>
          </div>
          <div className={styles.viewConfigEditorInputsSplit}>
            <div className={styles.viewConfigEditor}>
              {syntaxType === "JSON" ? (
                <>
                  <ThemedControlledEditor
                    value={pendingConfig}
                    onChange={(event, value) => {
                      setPendingConfig(value);
                      setLoadFrom('editor');
                    }}
                    height="60vh"
                    language="json"
                    options={{
                      fontSize: 14,
                      minimap: {
                        enabled: false,
                      },
                      contextmenu: false,
                    }}
                  />
                </>
              ) : (
                <div className={styles.viewConfigEditorPreviewJSSplit}>
                  <LiveProvider code={pendingJs} scope={scope} transformCode={transformCode}>
                    <LiveContext.Consumer>
                      {({ code, disabled, onChange }) => (
                        <div className={styles.viewConfigEditorJS}>
                          <ThemedControlledEditor
                            value={code}
                            onChange={(event, value) => {
                              setPendingJs(value);
                              setLoadFrom('editor');
                            }}
                            height="60vh"
                            language="javascript"
                            options={{
                              fontSize: 14,
                              minimap: {
                                enabled: false,
                              },
                              contextmenu: false,
                            }}
                          />
                        </div>
                      )}
                    </LiveContext.Consumer>
                    <div className={styles.viewConfigPreviewErrorSplit}>
                      <LivePreviewHeader/>
                      <div className={styles.viewConfigPreviewScroll}>
                        <LiveError className={styles.viewConfigErrorJS} />
                        <LivePreview className={styles.viewConfigPreviewJS} />
                      </div>
                    </div>
                  </LiveProvider>
                </div>
              )}
            </div>
            <div className={styles.viewConfigInputs}>
              <div className={styles.viewConfigInputUrlOrFile}>
                <p className={styles.viewConfigInputUrlOrFileText}>
                  Alternatively, provide a URL or drag &amp; drop a view config file.
                </p>
                <div className={styles.viewConfigInputUrlOrFileSplit}>
                  <input
                    type="text"
                    className={styles.viewConfigUrlInput}
                    placeholder="Enter a URL"
                    value={pendingUrl}
                    onChange={handleUrlChange}
                  />
                  <div {...getRootProps()} className={styles.dropzone}>
                    <input {...getInputProps()} className={styles.dropzoneInfo} />
                    {isDragActive ?
                      <span>Drop the file here ...</span> :
                      (pendingFileContents ? (
                        <span>Successfully read the file.</span>
                      ) : (
                      <span>Drop a file</span>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.viewConfigInputButton}>
                <button className={styles.viewConfigGo} onClick={handleEditorGo}>Load from {loadFrom}</button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className={'vitessce-app'}>
          <ThemedVitessce
            validateOnConfigChange={debug}
            config={validConfig}
          />
          <div className={styles.vitessceClear}>
            <button
              className={styles.vitessceClearButton}
              onClick={handleClear}
            >
              Edit
            </button>
          </div>
        </main>
      ))
  );
}

// Reference: https://github.com/pbeshai/use-query-params#usage
function WrappedApp() {
  return(
    <QueryParamProvider>
        <App/>
    </QueryParamProvider>
  );
}

export default WrappedApp;
