/* eslint-disable max-len */
import React, { useMemo } from 'react';
import {
  VitS,
} from '@vitessce/vit-s';
import {
  upgradeAndParse,
} from '@vitessce/schemas';
import { META_VERSION } from '@vitessce/constants-internal';
import {
  baseViewTypes,
  baseFileTypes,
  baseJointFileTypes,
  baseCoordinationTypes,
} from './base-plugins.js';

function logConfig(config: any, name: string) {
  console.groupCollapsed(`🚄 Vitessce (${META_VERSION.version}) ${name}`);
  console.info(`data:,${JSON.stringify(config)}`);
  console.info(JSON.stringify(config, null, 2));
  console.groupEnd();
}

export function Vitessce(props: any) {
  const {
    config,
    onConfigUpgrade,
    pluginViewTypes: pluginViewTypesProp,
    pluginFileTypes: pluginFileTypesProp,
    pluginCoordinationTypes: pluginCoordinationTypesProp,
    pluginJointFileTypes: pluginJointFileTypesProp,
  } = props;

  const configUid = config?.uid;
  const configVersion = config?.version;

  const [configOrWarning, success] = useMemo(() => {
    try {
      logConfig(config, 'input view config');
      const validConfig = upgradeAndParse(config, onConfigUpgrade);
      return [validConfig, true];
    } catch (e) {
      console.error(e);
      return [
        {
          title: 'Config validation or upgrade failed.',
          unformatted: (e as any).message,
        },
        false,
      ];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configUid, configVersion]);

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


  return (
    <VitS
      {...props}
      config={configOrWarning}
      viewTypes={mergedPluginViewTypes}
      fileTypes={mergedPluginFileTypes}
      jointFileTypes={mergedPluginJointFileTypes}
      coordinationTypes={mergedPluginCoordinationTypes}
      warning={(success ? null : configOrWarning)}
    />
  );
}
