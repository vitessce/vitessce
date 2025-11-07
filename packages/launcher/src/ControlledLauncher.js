/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
import React, { useMemo, useState, useEffect } from 'react';
import { Vitessce } from '@vitessce/all';
import { generateConfigAlt as generateConfig, parseUrls } from '@vitessce/config';
import { Alert } from '@vitessce/styles';
import clsx from 'clsx';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useStyles } from './launcher-styles.js';
import { LauncherStart } from './LauncherStart.js';


function logConfigUpgrade(prevConfig, nextConfig) {
  // eslint-disable-next-line no-console
  console.log(`Upgrade view config schema from ${prevConfig.version} to ${nextConfig.version}`);
  // eslint-disable-next-line no-console
  console.log(prevConfig);
  // eslint-disable-next-line no-console
  console.log(nextConfig);
}

function ControlledLauncherInner(props) {
  const {
    isEditing,
    setIsEditing,
    setIsUsingLocalFiles,
    configUrl,
    setConfigUrl,
    sourceUrlArr,
    setSourceUrlArr,
    marginTop = 0,
    launcherError,
    setLauncherError,
  } = props;

  const { classes } = useStyles();

  const [validConfigFromDroppedData, setValidConfigFromDroppedData] = useState(null);
  const [storesFromDroppedData, setStoresFromDroppedData] = useState(null);

  const configUrlQueryEnabled = !isEditing && !!configUrl;
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

  const sourceUrlQueryEnabled = !isEditing && Array.isArray(sourceUrlArr) && sourceUrlArr.length > 0;
  const sourceUrlResult = useQuery({
    enabled: sourceUrlQueryEnabled,
    queryKey: ['data-metadata-from-urls', sourceUrlArr],
    queryFn: async () => {
      const { config, stores } = await generateConfig(parseUrls(sourceUrlArr));
      return { config, stores };
    },
  });

  let isLoading = false;
  let validConfig = null;
  let stores = null;
  if (configUrlQueryEnabled) {
    isLoading = configUrlResult.isLoading;
    if (configUrlResult.isSuccess) {
      validConfig = configUrlResult.data;
      setLauncherError(null)
    } else if(configUrlResult.isError) {
      setIsEditing(true);
      setLauncherError(`Error loading config from URL: ${configUrlResult.error.message}`);
    }
  } else if (sourceUrlQueryEnabled) {
    isLoading = sourceUrlResult.isLoading;
    if (sourceUrlResult.isSuccess) {
      validConfig = sourceUrlResult.data.config.toJSON();
      stores = sourceUrlResult.data.stores;
      setLauncherError(null);
    } else if(sourceUrlResult.isError) {
      setIsEditing(true);
      setLauncherError(`Error loading data/metadata from source URL(s): ${sourceUrlResult.error.message}`);
    }
  } else if (validConfigFromDroppedData) {
    validConfig = validConfigFromDroppedData;
    stores = storesFromDroppedData;
    setLauncherError(null);
  }


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

  const pageMode = false; // TODO
  const PageComponent = null; // TODO
  const isExpanded = true; // TODO

  const onDropHandler = null; // TODO
  const debug = false; // TODO
  const theme = 'light2'; // TODO


  return (isEditing ? (
    <>
    {launcherError ? (
      <Alert severity="error" onClose={() => setLauncherError(null)}>
        {launcherError}
      </Alert>
    ) : null}
    <LauncherStart
      setIsEditing={setIsEditing}
      setIsUsingLocalFiles={setIsUsingLocalFiles}
      configUrl={configUrl}
      setConfigUrl={setConfigUrl}
      sourceUrlArr={sourceUrlArr}
      setSourceUrlArr={setSourceUrlArr}
      setValidConfigFromDroppedData={setValidConfigFromDroppedData}
      setStoresFromDroppedData={setStoresFromDroppedData}
      launcherError={launcherError}
      setLauncherError={setLauncherError}
    />
    </>
  ) : (validConfig ? (
    <main
      className={clsx(classes.vitessceApp, { 'vitessce-expanded': isExpanded, 'vitessce-page': pageMode })}
      style={{
        height: `calc(100vh - ${marginTop}px)`,
      }}
    >
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
            min-height: calc(100vh - ${marginTop}px);
            width: 100%;
            overflow: hidden;
            position: relative;
            left: 0;
          }
        `}
        </style>
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
  ) : (
    isLoading ? (
      <h2>Loading...</h2>
    ) : (
      <p>Error: undefined state</p>
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
