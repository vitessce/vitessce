import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createOnDrop, Vitessce } from '@vitessce/all';
import { generateConfigAlt as generateConfig, parseUrls } from '@vitessce/config';
import { TextField, Button } from '@vitessce/styles';
import clsx from 'clsx';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { QueryParamProvider } from 'use-query-params';
import { useSetHashParams } from './use-hash-param.js';
import { useHashOrQueryParam } from './use-query-or-hash-param.js';
import { useStyles } from './launcher-styles.js';

function logConfigUpgrade(prevConfig, nextConfig) {
  // eslint-disable-next-line no-console
  console.log(`Upgrade view config schema from ${prevConfig.version} to ${nextConfig.version}`);
  // eslint-disable-next-line no-console
  console.log(prevConfig);
  // eslint-disable-next-line no-console
  console.log(nextConfig);
}


export function LauncherStart(props) {
  const {
    setIsEditing,
    configUrl,
    setConfigUrl,
    sourceUrlArr,
    setSourceUrlArr,
  } = props;
  const { classes } = useStyles();

  const [spotlightCard, setSpotlightCard] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [isDragging, setIsDragging] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isDragProcessing, setIsDragProcessing] = useState(false);

  const localDataCardRef = useRef(null);

  const [viewConfig, setViewConfig] = useState(null);
  const [stores, setStores] = useState(null);

  const onDropHandler = useMemo(() => createOnDrop(
    { setViewConfig, setStores },
  ), [setViewConfig, setStores]);

  // Effect for setting up drag-and-drop event listeners.
  useEffect(() => {
    const zone = localDataCardRef.current;

    const onDragEnter = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };
    const onDragLeave = () => {
      setIsDragging(false);
    };
    const onDragOver = (e) => {
      e.preventDefault();
    };
    const onDrop = async (e) => {
      e.preventDefault();

      setIsDragging(false);
      setIsDragProcessing(true);

      // Call onDrop handler passed in from parent of <VitS/Vitessce/> via prop.
      await onDropHandler(e);

      setIsDragProcessing(false);
    };

    // The dragenter event happens at the moment you drag something in to the target element,
    // and then it stops.
    // The dragover event happens during the time you are dragging something until you drop it.
    zone.addEventListener('dragenter', onDragEnter);
    zone.addEventListener('dragleave', onDragLeave);
    zone.addEventListener('dragover', onDragOver);
    zone.addEventListener('drop', onDrop);

    return () => {
      zone.removeEventListener('dragenter', onDragEnter);
      zone.removeEventListener('dragleave', onDragLeave);
      zone.removeEventListener('dragover', onDragOver);
      zone.removeEventListener('drop', onDrop);
    };
  }, [localDataCardRef, onDropHandler]);


  return (
    <div className={classes.launcher}>
      <div className={classes.launcherRow}>
        <h2>Begin with data</h2>
        <p>TODO: add link to docs regarding file extensions.</p>
        <div className={classes.cardRow}>
          <div className={clsx(classes.card, classes.cardDashed, { [classes.cardDim]: spotlightCard && spotlightCard !== 'data-local' })} ref={localDataCardRef}>
            <h3>Local data <br/> (Drag and drop)</h3>
            <p>Drag-and-drop local files to view them in Vitessce. Vitessce launches with a default configuration (based on file types and contents) which can be edited. Files remain local; no upload required.</p>
            <button>Select data files or folders</button>
          </div>
          <div className={clsx(classes.card, { [classes.cardDim]: spotlightCard && spotlightCard !== 'data-remote' })}>
            <h3>Remote data <br/> (Load from URL)</h3>
            <p>
              Enter file URLs to view them in Vitessce. Vitessce launches with a default configuration (based on file types and contents) which can be edited. See our <a href="https://vitessce.io/docs/data-hosting/">data hosting</a> documentation for more details.&nbsp;
              {/*<span className="select-examples">
                <label>Try an example:&nbsp;</label>
                <select>
                  <option>TODO</option>
                </select>
              </span>*/}
            </p>
            <div className={classes.textareaAndButton}>
              <TextField
                multiline
                label="Data URL(s)"
                placeholder="One or more file URLs (semicolon-separated)"
                minRows={2}
                className={classes.dataUrlTextarea}
                value={sourceUrlArr ? sourceUrlArr.join(';') : ''}
                onChange={(e) => {
                  // Clear existing state.
                  setConfigUrl(undefined);
                  setSourceUrlArr(e.target.value);
                }}
                onBlur={() => setSpotlightCard(null)}
                onFocus={() => {
                  setSpotlightCard('data-remote');
                  // We need to set isEditing, otherwise the launcher UI will disappear
                  // as soon as there is a non-empty sourceUrlArr value.
                  setIsEditing(true);
                }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                }}
              >Visualize</Button>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.launcherRow}>
        <h2>Begin with configuration</h2>
        <div className={classes.cardRow}>
          {/*<div className={classes.card}>
            <h3>Config Editor</h3>
            <p>Use the online configuration editor to paste, create, or edit a Vitessce configuration using JSON or JS API syntax.</p>
            <button>Launch JSON editor</button>&nbsp;
            <button>Launch JS editor</button>&nbsp;
            <button>Launch Python editor</button>
          </div>*/}
          <div className={clsx(classes.card, classes.cardDashed, { [classes.cardDim]: spotlightCard && spotlightCard !== 'config-local' })}>
            <h3>Local config file <br/> (Drag and drop)</h3>
            <p>View a Vitessce configuration that has been saved to a JSON file.</p>
            <button>Select JSON file</button>
          </div>
          <div className={clsx(classes.card, { [classes.cardDim]: spotlightCard && spotlightCard !== 'config-remote' })}>
            <h3>Remote config file <br/> (Load from URL)</h3>
            <p>
              View a Vitessce configuration that has been saved to a JSON file.&nbsp;
              {/*<span className="select-examples">
                <label>Try an example:&nbsp;</label>
                <select>
                  <option>TODO</option>
                </select>
              </span>*/}
            </p>
            <div className={classes.textareaAndButton}>
              <TextField
                multiline
                label="Config URL"
                placeholder="Enter a URL"
                minRows={2}
                className={classes.dataUrlTextarea}
                value={configUrl ? configUrl : ''}
                onChange={(e) => {
                  // Clear existing state.
                  setSourceUrlArr(undefined);
                  setConfigUrl(e.target.value);
                }}
                onBlur={() => setSpotlightCard(null)}
                onFocus={() => {
                  setSpotlightCard('config-remote');
                  // We need to set isEditing, otherwise the launcher UI will disappear
                  // as soon as there is a non-empty configUrl value.
                  setIsEditing(true);
                }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                }}
              >Visualize</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ControlledLauncherInner(props) {
  const {
    isEditing = true,
    setIsEditing,
    configUrl,
    setConfigUrl,
    sourceUrlArr,
    setSourceUrlArr,
  } = props;

  const { classes } = useStyles();

  const configUrlQueryEnabled = !!configUrl;
  const configUrlResult = useQuery({
    enabled: configUrlQueryEnabled,
    queryKey: ['config-from-url', configUrl],
    queryFn: async () => {
      const resp = await fetch(configUrl);
      if (!resp.ok) {
        throw new Error(`Failed to fetch config from URL: ${resp.status} ${resp.statusText}`);
      }
      const configJson = await resp.json();
      return configJson;
    },
  });

  const sourceUrlQueryEnabled = Array.isArray(sourceUrlArr) && sourceUrlArr.length > 0;
  const sourceUrlResult = useQuery({
    enabled: sourceUrlQueryEnabled,
    queryKey: ['data-metadata-from-urls', sourceUrlArr],
    queryFn: async () => {
      console.log('Generating config from source URLs:', sourceUrlArr);
      const { config, stores } = await generateConfig(parseUrls(sourceUrlArr));
      return { config, stores };
    },
  });

  let isLoading = false;
  let validConfig = null;
  let stores = null;
  if(configUrlQueryEnabled) {
    isLoading = configUrlResult.isLoading;
    if (configUrlResult.isSuccess) {
      validConfig = configUrlResult.data;
    }
  } else if (sourceUrlQueryEnabled) {
    isLoading = sourceUrlResult.isLoading;
    if (sourceUrlResult.isSuccess) {
      validConfig = sourceUrlResult.data.config.toJSON();
      stores = sourceUrlResult.data.stores;
    }
  }

  // TODO: handle error states from react-query results.



  // Possible states:
  // - needsStart: No URL parameters; Show the launcher UI.
  // - Awaiting URL parameter parsing.
  // - Invalid/unrecognized example ID
  // - Loading config or data/metadata from URL.
  // - Loaded config but was invalid.
  // - Could not identify a valid/supported data format from data file extension(s).
  //   - Suggest to append `$supportedFileType` to source URL(s) to specify the data format if file extension is non-standard.
  // - Failed to load config or data/metadata from URL.
  // - Error if BOTH config and source parameters are provided.
  // - Error if BOTH hash and query parameters are provided.

  console.log(configUrlResult);
  console.log(sourceUrlResult);
  const pageMode = false; // TODO
  const PageComponent = null; // TODO
  const isExpanded = false; // TODO

  const onDropHandler = null; // TODO
  const debug = false; // TODO
  const theme = 'dark'; // TODO

  console.log(validConfig, stores);

  return (isEditing ? (
    <LauncherStart
      setIsEditing={setIsEditing}
      configUrl={configUrl}
      setConfigUrl={setConfigUrl}
      sourceUrlArr={sourceUrlArr}
      setSourceUrlArr={setSourceUrlArr}
    />
  ) : (validConfig ? (
    <>
      {/*<pre>{JSON.stringify(validConfig, null, 2)}</pre>*/}
      <main className={clsx(classes.vitessceApp, { 'vitessce-expanded': isExpanded, 'vitessce-page': pageMode })}>
        {pageMode ? (
          <style>{`
            .vitessce-container {
              height: max(100%,100vh);
              width: 100%;
              overflow: hidden;
              position: relative;
              left: 0;
            }
          `}
          </style>
        ) : (
          <style>{`
            .vitessce-container {
              height: max(100%,100vh);
              width: 100%;
              overflow: hidden;
              position: relative;
              left: 0;
            }
          `}</style>
        )}
        <Vitessce
          theme={theme}
          validateOnConfigChange={debug}
          onConfigChange={debug ? console.log : undefined}
          onConfigUpgrade={debug ? logConfigUpgrade : undefined}
          config={validConfig}
          height={isExpanded ? undefined : 800}
          pageMode={pageMode}
          stores={stores}
          onDrop={onDropHandler}
        >
          {pageMode && PageComponent ? (<PageComponent />) : null}
        </Vitessce>
      </main>
    </>
  ) : (
    isLoading ? (
      <h2>Loading...</h2>
    ) : (
      <div>Error loading configuration or data from URL parameters.</div>
    )
  )));
}


export function ControlledLauncher(props) {
  const queryClient = useMemo(() => new QueryClient({
    // Reference: https://tanstack.com/query/latest/docs/react/guides/window-focus-refetching
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ControlledLauncherInner {...props} />
    </QueryClientProvider>
  );

}


function UncontrolledLauncherInner(props) {
  // Logic for managing state and query/hash params.
  const setHashParams = useSetHashParams();

  // TODO: make this a fully "controlled" component.
  // Handle URL param getting/setting in a parent component.
  // Set and get URL parameters via the parent.
  // Use an edit=true flag to indicate whether to still show the launcher component despite having non-empty param values.
  // TODO: style the launcher so that the one relevant card is "spotlighted" when there is a non-empty param value.

  // That way, the launcher could eventually be contained within the <Vitessce /> component, e.g., if there is an empty config.

  const [exampleId, setExampleId, exampleIdParamError] = useHashOrQueryParam('example', undefined, 'string');
  // TODO: support vitessce-link code param
  // const wsCodeValue = useHashOrQueryParam('session', undefined, 'string');
  const [configUrl, setConfigUrl, configUrlParamError] = useHashOrQueryParam('config', undefined, 'string');
  const [sourceUrlArr, setSourceUrlArr, sourceUrlArrParamError] = useHashOrQueryParam('source', undefined, 'string-array');
  const [isEditingParam, setIsEditing, isEditingParamError] = useHashOrQueryParam('edit', undefined, 'boolean');

  // Check for parameter errors (e.g., both hash+query for same value) and conflicting parameters.
  const hasNoParamError = !exampleIdParamError && !configUrlParamError && !sourceUrlArrParamError && !isEditingParamError;
  const hasNoConflictingParams = (
    (exampleId ? 1 : 0) +
    (configUrl ? 1 : 0) +
    (sourceUrlArr && sourceUrlArr.length > 0 ? 1 : 0)
  ) <= 1;
  const needsStart = !exampleId && !configUrl && (!sourceUrlArr || (Array.isArray(sourceUrlArr) && sourceUrlArr.length === 0));

  const isEditing = isEditingParam === true || needsStart;
  console.log(isEditingParam);

  return (
    <ControlledLauncher
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      configUrl={configUrl}
      setConfigUrl={setConfigUrl}
      sourceUrlArr={sourceUrlArr}
      setSourceUrlArr={setSourceUrlArr}
    />
  )
}

export function Launcher(props) {
  const {
    // TODO: do we need the parent app to provide this in order to update URL state?
    baseUrl = null,
    // TODO: Optional mapping from example IDs to their full JSON config, and potentially more values such as PageComponent, Plugins, etc.
    // See https://github.com/vitessce/vitessce/blob/main/sites/demo/src/api.js
    exampleConfigs = null,
  } = props;

  // TODO: wrap in MUI themeProvider?
  return (
    <QueryParamProvider>
      <>
        {/* TEMP: links for quick testing */}
        <a href="/">Reset</a>&nbsp;
        <a href="/?source=https://storage.googleapis.com/vitessce-demo-data/maynard-2021/151673.sdata.zarr">SpatialData Example</a>&nbsp;
        <a href="/#?source=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr$image.ome-zarr">OME-Zarr Example</a>
      </>
      <UncontrolledLauncherInner />
    </QueryParamProvider>
  );
}