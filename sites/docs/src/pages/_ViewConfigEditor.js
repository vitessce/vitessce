/* eslint-disable no-nested-ternary */
import React, { useCallback, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useDropzone } from 'react-dropzone';
import {
  LiveProvider, LiveContext, LiveError, LivePreview,
} from 'react-live';
import {
  VitessceConfig, generateConfigs, hconcat, vconcat,
} from '@vitessce/config';
import {
  CoordinationType, ViewType, DataType, FileType,
} from '@vitessce/constants';
import { upgradeAndValidate } from '@vitessce/vit-s';
import ThemedControlledEditor from './_ThemedControlledEditor';
import {
  baseJs, baseJson, exampleJs, exampleJson,
} from './_live-editor-examples';
import { JSON_TRANSLATION_KEY } from './_editor-utils';
import JsonHighlight from './_JsonHighlight';


import styles from './styles.module.css';


// To simplify the JS editor, the user only needs to write
// the inner part of the createConfig() function,
// because this code will wrap the user's code to
// return a React component for react-live.
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

const scope = {
  VitessceConfig,
  hconcat,
  vconcat,
  ViewType,
  DataType,
  FileType,
  CoordinationType,
  vt: ViewType,
  dt: DataType,
  ft: FileType,
  ct: CoordinationType,
  Highlight: JsonHighlight,
};

export default function ViewConfigEditor(props) {
  const {
    pendingJson,
    setPendingJson,
    pendingJs,
    setPendingJs,
    error,
    setError,
    loading,
    setUrl,
  } = props;

  const viewConfigDocsJsUrl = useBaseUrl('/docs/view-config-js/');
  const viewConfigDocsJsonUrl = useBaseUrl('/docs/view-config-json/');
  const defaultViewConfigDocsUrl = useBaseUrl('/docs/default-config-json');

  const [pendingUrl, setPendingUrl] = useState('');
  const [datasetUrls, setDatasetUrls] = useState('');
  const [pendingFileContents, setPendingFileContents] = useState('');

  const [syntaxType, setSyntaxType] = useState('JSON');
  const [loadFrom, setLoadFrom] = useState('editor');

  const exampleURL = 'https://assets.hubmapconsortium.org/a4be39d9c1606130450a011d2f1feeff/ometiff-pyramids/processedMicroscopy/VAN0012-RK-102-167-PAS_IMS_images/VAN0012-RK-102-167-PAS_IMS-registered.ome.tif';

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 1) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const { result } = reader;
        setPendingFileContents(result);
        setLoadFrom('file');
      });
      reader.readAsText(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });


  function validateConfig(nextConfig) {
    const [failureReason, upgradeSuccess] = upgradeAndValidate(JSON.parse(nextConfig));
    return [upgradeSuccess, failureReason];
  }

  function handleEditorGo() {
    let nextUrl;
    if (loadFrom === 'editor') {
      let nextConfig = pendingJson;
      if (syntaxType === 'JS') {
        nextConfig = window[JSON_TRANSLATION_KEY];
      }
      nextUrl = `data:,${encodeURIComponent(nextConfig)}`;
      const [valid, failureReason] = validateConfig(nextConfig);
      if (!valid) {
        setError(failureReason);
        return;
      }
    } else if (loadFrom === 'url') {
      nextUrl = pendingUrl;
    } else if (loadFrom === 'file') {
      nextUrl = `data:,${encodeURIComponent(pendingFileContents)}`;
    }
    setUrl(nextUrl);
  }

  function sanitiseURLs(urls) {
    return urls
      .split(/;/)
      .map(url => url.trim())
      .filter(url => url.match(/^http/g));
  }

  async function handleConfigGeneration() {
    setError(null);
    const sanitisedUrls = sanitiseURLs(datasetUrls);
    await generateConfigs(sanitisedUrls)
      .then((configJson) => {
        setPendingJson(JSON.stringify(configJson, null, 2));
        setLoadFrom('editor');
      })
      .catch((e) => {
        setError(e.message);
      });
  }

  function handleUrlChange(event) {
    setPendingUrl(event.target.value);
    setLoadFrom('url');
  }

  function handleDatasetUrlChange(event) {
    setDatasetUrls(event.target.value);
  }

  function handleSyntaxChange(event) {
    setSyntaxType(event.target.value);
  }

  function tryExample() {
    if (syntaxType === 'JSON') {
      setPendingJson(exampleJson);
    } else {
      setPendingJs(exampleJs);
    }
    setLoadFrom('editor');
  }

  function resetEditor() {
    if (syntaxType === 'JSON') {
      setPendingJson(baseJson);
      setDatasetUrls('');
    } else {
      setPendingJs(baseJs);
    }
  }

  const showReset = (syntaxType === 'JSON' && pendingJson !== baseJson) || (syntaxType === 'JS' && pendingJs !== baseJs);

  return (
    loading ? (
      <pre>Loading...</pre>
    ) : (
      <main className={styles.viewConfigEditorMain}>
        {error && (
          <pre className={styles.vitessceAppLoadError}>{JSON.stringify(error, null, 2)}</pre>
        )}
        <p className={styles.viewConfigEditorInfo}>
          To use Vitessce, enter a&nbsp;
          <a href={syntaxType === 'JS' ? viewConfigDocsJsUrl : viewConfigDocsJsonUrl}>view config</a>
            &nbsp;using the editor below.&nbsp;
          <button type="button" onClick={tryExample}>Try an example</button>&nbsp;
          {showReset && <button type="button" onClick={resetEditor}>Reset the editor</button>}
        </p>

        <div className={styles.viewConfigInputs}>
          <div className={styles.viewConfigInputUrlOrFile}>
            <p className={styles.viewConfigInputUrlOrFileText}>
              Alternatively, enter the URLs to one or more data files
              (semicolon-separated) to populate the editor with a&nbsp;
              <a href={defaultViewConfigDocsUrl}>default view config</a>.&nbsp;
              <button
                type="button"
                onClick={() => setDatasetUrls(exampleURL)}
              >Try an example
              </button>
            </p>
            <div className={styles.generateConfigInputUrl}>
              <input
                type="text"
                className={styles.viewConfigUrlInput}
                placeholder="One or more file URLs (semicolon-separated)"
                value={datasetUrls}
                onChange={handleDatasetUrlChange}
              />
            </div>
          </div>
          <div className={styles.viewConfigInputButton}>
            <button
              type="button"
              className={styles.viewConfigGo}
              onClick={handleConfigGeneration}
            >Generate config
            </button>
          </div>
        </div>

        <div className={styles.viewConfigEditorType}>
          <label htmlFor="editor-syntax">
            <select
              className={styles.viewConfigEditorTypeSelect}
              value={syntaxType}
              onChange={handleSyntaxChange}
              id="editor-syntax"
            >
              <option value="JSON">JSON</option>
              <option value="JS">JS</option>
            </select>
          </label>
        </div>
        <div className={styles.viewConfigEditorInputsSplit}>
          <div className={styles.viewConfigEditor}>
            {syntaxType === 'JSON' ? (
              <>
                <ThemedControlledEditor
                  value={pendingJson}
                  onChange={(value) => {
                    setPendingJson(value);
                    setLoadFrom('editor');
                  }}
                  language="json"
                />
              </>
            ) : (
              <div className={styles.viewConfigEditorPreviewJSSplit}>
                <LiveProvider code={pendingJs} scope={scope} transformCode={transformCode}>
                  <LiveContext.Consumer>
                    {({ code }) => (
                      <div className={styles.viewConfigEditorJS}>
                        <ThemedControlledEditor
                          value={code}
                          onChange={(value) => {
                            setPendingJs(value);
                            setLoadFrom('editor');
                          }}
                          language="javascript"
                        />
                      </div>
                    )}
                  </LiveContext.Consumer>
                  <div className={styles.viewConfigPreviewErrorSplit}>
                    <p className={styles.livePreviewHeader}>Translation to JSON</p>
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
                  {isDragActive
                    ? <span>Drop the file here ...</span>
                    : (pendingFileContents ? (
                      <span>Successfully read the file.</span>
                    ) : (
                      <span>Drop a file</span>
                    )
                    )}
                </div>
              </div>
            </div>
            <div className={styles.viewConfigInputButton}>
              <button
                type="button"
                className={styles.viewConfigGo}
                onClick={handleEditorGo}
              >Load from {loadFrom}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  );
}
