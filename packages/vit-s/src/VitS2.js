import React, { useEffect, useMemo, useCallback } from 'react';
import {
  ThemeProvider,
  StylesProvider,
} from '@material-ui/core';
import {
  useQuery,
} from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import { buildConfigSchema, latestConfigSchema } from '@vitessce/schemas';
import { muiTheme } from './shared-mui/styles.js';
import {
  ViewConfigProvider,
  createViewConfigStore,
  AuxiliaryProvider,
  createAuxiliaryStore,
} from './state/hooks.js';

import VitessceGrid from './VitessceGrid.js';
import { Warning } from './Warning.js';
import CallbackPublisher from './CallbackPublisher.js';
import {
  initialize,
  logConfig,
} from './view-config-utils.js';
import { createLoaders } from './vitessce-grid-utils.js';
import { createGenerateClassName } from './mui-utils.js';
import { AsyncFunctionsContext } from './contexts.js';


export function VitS2(props) {
  const {
    config,
    stores,
    rowHeight,
    height,
    theme,
    onWarn,
    onConfigChange,
    onLoaderChange,
    validateConfig = true,
    validateOnConfigChange = false,
    isBounded = false,
    uid = null,
    remountOnUidChange = true,
    configKey,
    viewTypes,
    fileTypes,
    jointFileTypes,
    asyncFunctions,
    coordinationTypes,
    warning,
    pageMode = false,
    children,
    configVersion,
  } = props;
  
  const pluginSpecificConfigSchema = useMemo(() => buildConfigSchema(
    fileTypes,
    jointFileTypes,
    coordinationTypes,
    viewTypes,
  ), [viewTypes, fileTypes, jointFileTypes, coordinationTypes]);

  // Process the view config and memoize the result:
  // - Validate.
  // - Upgrade, if legacy schema.
  // - Validate after upgrade, if legacy schema.
  // - Initialize (based on initStrategy).
  const queryResult = useQuery({
    queryKey: [configKey, configVersion, pluginSpecificConfigSchema, warning],
    queryFn: async () => {
      if (warning) {
        return [warning, false];
      }
      logConfig(config, 'input view config');
      if (!validateConfig) {
        return [config, true];
      }
      const result = latestConfigSchema.safeParse(config);
      if (result.success) {
        const upgradedConfig = result.data;
        logConfig(upgradedConfig, 'parsed view config');
        // Perform second round of parsing against plugin-specific config schema.
        const pluginSpecificResult = pluginSpecificConfigSchema.safeParse(upgradedConfig);
        // Initialize the view config according to the initStrategy.
        if (pluginSpecificResult.success) {
          try {
            const upgradedConfigWithValidPlugins = pluginSpecificResult.data;
            // TODO: use react-query instead of useMemo
            const initializedConfig = await initialize(
              upgradedConfigWithValidPlugins,
              jointFileTypes,
              coordinationTypes,
              viewTypes,
            );
            logConfig(initializedConfig, 'initialized view config');
            return [initializedConfig, true];
          } catch (e) {
            return [
              {
                title: 'Config initialization failed.',
                unformatted: e.message,
              },
              false,
            ];
          }
        }
        return [
          {
            title: 'Config validation failed on second pass.',
            unformatted: pluginSpecificResult.error.message,
          },
          false,
        ];
      }
      return [{
        title: 'Config validation failed on first pass.',
        unformatted: result.error.message,
      }, result.success];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  });

  const configOrWarning = queryResult?.data?.[0];
  const success = queryResult?.data?.[1];

  // Emit the upgraded/initialized view config
  // to onConfigChange if necessary.
  useEffect(() => {
    if (success && !isEqual(configOrWarning, config) && onConfigChange) {
      onConfigChange(configOrWarning);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, configKey, configOrWarning, onConfigChange]);

  // Initialize the view config and loaders in the global state.
  const createViewConfigStoreClosure = useCallback(() => {
    if (success) {
      const loaders = createLoaders(
        configOrWarning.datasets,
        configOrWarning.description,
        fileTypes,
        coordinationTypes,
        stores,
      );
      return createViewConfigStore(loaders, configOrWarning);
    }
    // No config found, so clear the loaders.
    return createViewConfigStore(null, null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, configKey]);

  return success ? (
    <ViewConfigProvider
      createStore={createViewConfigStoreClosure}
      {...(remountOnUidChange ? ({ key: configKey }) : {})}
    >
      <AuxiliaryProvider createStore={createAuxiliaryStore}>
        <AsyncFunctionsContext.Provider value={asyncFunctions}>
          <VitessceGrid
            pageMode={pageMode}
            success={success}
            configKey={configKey}
            viewTypes={viewTypes}
            fileTypes={fileTypes}
            coordinationTypes={coordinationTypes}
            config={configOrWarning}
            rowHeight={rowHeight}
            height={height}
            theme={theme}
            isBounded={isBounded}
            stores={stores}
          >
            {children}
          </VitessceGrid>
          <CallbackPublisher
            onWarn={onWarn}
            onConfigChange={onConfigChange}
            onLoaderChange={onLoaderChange}
            validateOnConfigChange={validateOnConfigChange}
            pluginSpecificConfigSchema={pluginSpecificConfigSchema}
          />
        </AsyncFunctionsContext.Provider>
      </AuxiliaryProvider>
    </ViewConfigProvider>
  ) : (
    <Warning {...configOrWarning} />
  );
}
