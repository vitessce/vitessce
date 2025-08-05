/* eslint-disable max-len */
import React, { useMemo } from 'react';
import {
  VitSContainer,
  logConfig,
} from '@vitessce/vit-s';
import { log } from '@vitessce/globals';
import {
  upgradeAndParse,
} from '@vitessce/schemas';
import {
  baseViewTypes,
  baseFileTypes,
  baseJointFileTypes,
  baseCoordinationTypes,
  baseAsyncFunctions,
} from './base-plugins.js';

export function Vitessce(props: any) {
  const {
    config,
    onConfigUpgrade,
    pluginViewTypes: pluginViewTypesProp,
    pluginFileTypes: pluginFileTypesProp,
    pluginCoordinationTypes: pluginCoordinationTypesProp,
    pluginJointFileTypes: pluginJointFileTypesProp,
    pluginAsyncFunctions: pluginAsyncFunctionsProp,
  } = props;

  // If config.uid exists, then use it for hook dependencies to detect changes
  // (controlled component case). If not, then use the config object itself
  // and assume the un-controlled component case.
  const configKey = config?.uid || config;
  const configVersion = config?.version;

  const [configOrWarning, success] = useMemo(() => {
    try {
      logConfig(config, 'pre-upgrade view config');
      const validConfig = upgradeAndParse(config, onConfigUpgrade);
      return [validConfig, true];
    } catch (e) {
      log.error(e);
      return [
        {
          title: 'Config validation or upgrade failed.',
          unformatted: (e as any).message,
        },
        false,
      ];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, configVersion]);

  const mergedPluginViewTypes = useMemo(() => ([
    ...baseViewTypes, ...(pluginViewTypesProp || []),
  ]), [pluginViewTypesProp]);

  const mergedPluginFileTypes = useMemo(() => ([
    ...baseFileTypes, ...(pluginFileTypesProp || []),
  ]), [pluginFileTypesProp]);

  const mergedPluginJointFileTypes = useMemo(() => ([
    ...baseJointFileTypes, ...(pluginJointFileTypesProp || []),
  ]), [pluginJointFileTypesProp]);

  const mergedPluginCoordinationTypes = useMemo(() => ([
    ...baseCoordinationTypes, ...(pluginCoordinationTypesProp || []),
  ]), [pluginCoordinationTypesProp]);

  const mergedPluginAsyncFunctions = useMemo(() => ([
    ...baseAsyncFunctions, ...(pluginAsyncFunctionsProp || []),
  ]), [pluginAsyncFunctionsProp]);

  return (
    <VitSContainer
      {...props}
      config={configOrWarning}
      viewTypes={mergedPluginViewTypes}
      fileTypes={mergedPluginFileTypes}
      jointFileTypes={mergedPluginJointFileTypes}
      coordinationTypes={mergedPluginCoordinationTypes}
      asyncFunctions={mergedPluginAsyncFunctions}
      warning={(success ? null : configOrWarning)}
    />
  );
}
