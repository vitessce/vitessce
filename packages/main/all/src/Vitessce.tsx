/* eslint-disable max-len */
import { useMemo } from 'react';
import {
  VitS,
} from '@vitessce/vit-s';
import {
  upgradeAndParse,
} from '@vitessce/schemas';
import {
  baseViewTypes,
  baseFileTypes,
  baseJointFileTypes,
  baseCoordinationTypes,
} from './base-plugins';

// TODO: clean up any type
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
