/* eslint-disable no-nested-ternary */
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { generateConfig, getHintOptions } from '@vitessce/config';
import { upgradeAndParse } from '@vitessce/schemas';
// import LoadingOverlay from '../components/loadingOverlay.js';
import StudyIdInput from '../components/StudyIdInput.js';
import { baseJson } from './_live-editor-examples.js';

import styles from './styles.module.css';

import {STUDY_ID_LENGTH, NO_DATASET_URL_ERROR} from './_editor-utils.js';

export default function ViewConfigEditor(props) {
  const {
    pendingJson,
    setPendingJson,
    error,
    setError,
    loading,
    setUrl,
    setStudyIdInput,
  } = props;


  const [pendingUrl, setPendingUrl] = useState('');
  const [datasetUrls, setDatasetUrls] = useState('');
  const [pendingFileContents, setPendingFileContents] = useState('');
  const [generateConfigError, setGenerateConfigError] = useState(null);
  const [inputURL, setInputURL] = useState('');
  const [studyId, setStudyId] = useState(null);
  const [showReset, setShowReset] = useState(null);
  const [loadFrom, setLoadFrom] = useState('editor');


  const exampleURL = 'https://assets.hubmapconsortium.org/a4be39d9c1606130450a011d2f1feeff/ometiff-pyramids/processedMicroscopy/VAN0012-RK-102-167-PAS_IMS_images/VAN0012-RK-102-167-PAS_IMS-registered.ome.tif';


  function handleSetStudyId(id) {
    setStudyId(id);
  }

  function handleInputError(errMessage) {
    setError(errMessage);
  }

  function sanitiseURLs(urls) {
    return urls
      .split(/;/)
      .map(url => url.trim())
      .filter(url => url.match(/^http/g));
  }

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 1) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const { result } = reader;
        setPendingFileContents(result);
        setLoadFrom('file');
        setError(null);
      });
      reader.readAsText(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });


  function validateConfig(nextConfig) {
    let upgradeSuccess;
    let failureReason;
    try {
      failureReason = upgradeAndParse(JSON.parse(nextConfig));
      upgradeSuccess = true;
    } catch (e) {
      upgradeSuccess = false;
      failureReason = e.message;
      console.error(e);
    }
    return [upgradeSuccess, failureReason];
  }

  async function handleEditorGo() {
    console.log(inputURL, error, inputURL === '', datasetUrls);
    if ((inputURL === '' && datasetUrls === '') || error) {
      setError(NO_DATASET_URL_ERROR);
      return;
    }
    if (studyId && studyId !== '' && studyId.length === STUDY_ID_LENGTH) {
      let nextUrl;
      if (loadFrom === 'editor') {
        const nextConfig = pendingJson;
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
      setStudyIdInput(studyId);
      } 
    else {
      setError('Enter a valid Study Id');
    }
  }

  async function handleConfigGeneration(exampleURL) {
    setDatasetUrls(exampleURL);
    setShowReset(true);
    const sanitisedUrls = sanitiseURLs(exampleURL);
    if (sanitisedUrls.length === 0) {
      return;
    }
    setGenerateConfigError(null);
    setError(null);
    try {
      const configJson = await generateConfig(sanitisedUrls, 'Basic');
      setPendingJson(() => JSON.stringify(configJson, null, 2));
      setLoadFrom('editor');
    } catch (e) {
      setGenerateConfigError(e.message);
      throw e;
    }
  }

  function handleUrlChange(event) {
    const url = event.target.value;
    setPendingUrl(url);
    setLoadFrom('url');
    setInputURL(url);
    const sanitisedUrls = sanitiseURLs(event.target.value);
    if(sanitisedUrls.length === 0) {
      if(datasetUrls === ''){
        setError('Enter a correct URL');
      }
      else {
        setError(null);
        setLoadFrom('editor');
      }
      return;
    }
    else
      setError(null)
  }


  function handleTextAreaURLChange(newDatasetUrls) {
    setDatasetUrls(newDatasetUrls);
    setInputURL(newDatasetUrls);
    const sanitisedUrls = sanitiseURLs(newDatasetUrls);
    console.log("san", sanitisedUrls);
    if (sanitisedUrls.length === 0) {
      setError('Incorrect URL');
      return;
    }
    try {
      // This errors if file type is incorrect
      getHintOptions(sanitisedUrls);
      setGenerateConfigError(null);
      setPendingJson(baseJson);
    } catch (e) {
      setGenerateConfigError(e.message);
    }
  }

    function resetEditor() {
      setPendingJson(baseJson);
      setDatasetUrls('');
      if(inputURL === '' && datasetUrls === '') {
        setError(NO_DATASET_URL_ERROR);
      }
      else if(inputURL !== '' && sanitiseURLs(inputURL)?.length > 0){
        setLoadFrom('url')
      }
       
        
      setShowReset(false);
    }

  return (
    loading ? (
      <pre>Loading...</pre>
    ) : (

      <main className={styles.viewConfigEditorMain}>
        {/* <LoadingOverlay isLoading={loadingOverlay} /> */}
        <div className={styles.mainContainer}>
          {error && (
          <pre className={styles.vitessceAppLoadError}>{error}</pre>
          )}
          <div className={styles.viewConfigInputs}>
            <div className={styles.viewConfigInputUrlOrFile}>
              <p className={styles.viewConfigInputUrlOrFileText}>
                Enter the URLs to one or more data files
                (semicolon-separated).
                <button
                  type="button"
                  onClick={() => handleConfigGeneration(exampleURL)}
                >Try an example
                </button>
                {showReset && <button type="button" onClick={resetEditor}>Reset the editor</button>}
              </p>
              <div className={styles.viewConfigInputUrlOrFileSplit}>
                <textarea
                  type="text"
                  className={styles.viewConfigUrlTextarea}
                  placeholder="One or more file URLs (semicolon-separated)"
                  value={datasetUrls}
                  onChange={e => handleTextAreaURLChange(e.target.value)}
                />
                <div className={styles.studyInput}>
                  <StudyIdInput
                    idLength={STUDY_ID_LENGTH}
                    onInputError={handleInputError}
                    onInputChange={handleSetStudyId}
                  />
                </div>
              </div>
              <div className={styles.viewConfigInputUrlOrFileSplit}>
                <div />
                {/* placeholder to align with the next grid div */}
                <div className={styles.goButtonDiv}>
                  <button
                    type="button"
                    className={styles.viewConfigGo}
                    onClick={handleEditorGo}
                  >Load from {loadFrom}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {datasetUrls !== '' ? (
            generateConfigError ? (
              <pre className={styles.vitessceAppLoadError}>
                {generateConfigError}
              </pre>
            ) : null
          ) : null}

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
          </div>
        </div>
      </main>
    )
  );
}
