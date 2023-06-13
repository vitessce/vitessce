import React, { useEffect, useMemo } from 'react';
import {
  ThemeProvider,
  StylesProvider,
} from '@material-ui/core';
import { isEqual } from 'lodash-es';
import { META_VERSION } from '@vitessce/constants-internal';
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
} from './view-config-utils.js';
import { generateClassName } from './mui-utils.js';

function logConfig(config, name) {
  console.groupCollapsed(`🚄 Vitessce (${META_VERSION.version}) ${name}`);
  console.info(`data:,${JSON.stringify(config)}`);
  console.info(JSON.stringify(config, null, 2));
  console.groupEnd();
}


/**
 * The Vitessce component.
 * @param {object} props
 * @param {object} props.config A Vitessce view config.
 * If the config is valid, the VitessceGrid will be rendered as a child.
 * If the config is invalid, a Warning will be rendered instead.
 * @param {undefined|number} props.rowHeight Row height for grid layout. Optional.
 * @param {number} props.height Total height for grid layout. Optional.
 * @param {string} props.theme The theme, used for styling as
 * light or dark. Optional. By default, "dark"
 * @param {function} props.onWarn A callback for warning messages. Optional.
 * @param {function} props.onConfigChange A callback for view config
 * updates. Optional.
 * @param {function} props.onLoaderChange A callback for loader
 * updates. Optional.
 * @param {boolean} props.validateOnConfigChange Whether to validate
 * against the view config schema when publishing changes. Use for debugging
 * purposes, as this may have a performance impact. By default, false.
 * @param {array} props.viewTypes Plugin view types.
 * @param {array} props.fileTypes Plugin file types.
 * @param {array} props.jointFileTypes Plugin joint file types.
 * @param {array} props.coordinationTypes Plugin coordination types.
 * @param {null|object} props.warning A warning to render within the Vitessce grid,
 * provided by the parent.
 */
export function VitS(props) {
  const {
    config,
    rowHeight,
    height,
    theme,
    onWarn,
    onConfigChange,
    onLoaderChange,
    validateOnConfigChange = false,
    isBounded = false,
    viewTypes: viewTypesProp,
    fileTypes: fileTypesProp,
    jointFileTypes: jointFileTypesProp,
    coordinationTypes: coordinationTypesProp,
    warning,
  } = props;

  const viewTypes = useMemo(() => (viewTypesProp || []), [viewTypesProp]);
  const fileTypes = useMemo(() => (fileTypesProp || []), [fileTypesProp]);
  const jointFileTypes = useMemo(
    () => (jointFileTypesProp || []),
    [jointFileTypesProp],
  );
  const coordinationTypes = useMemo(
    () => (coordinationTypesProp || []),
    [coordinationTypesProp],
  );

  const configUid = config?.uid;
  const configVersion = config?.version;

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
  const [configOrWarning, success] = useMemo(() => {
    if (warning) {
      return [warning, false];
    }
    logConfig(config, 'input view config');
    const result = latestConfigSchema.safeParse(config);
    if (result.success) {
      const upgradedConfig = result.data;
      logConfig(upgradedConfig, 'upgraded view config');
      // Perform second round of parsing against plugin-specific config schema.
      const pluginSpecificResult = pluginSpecificConfigSchema.safeParse(upgradedConfig);
      // Initialize the view config according to the initStrategy.
      if (pluginSpecificResult.success) {
        try {
          const upgradedConfigWithValidPlugins = pluginSpecificResult.data;
          const initializedConfig = initialize(
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
  }, [configUid, configVersion, pluginSpecificConfigSchema, warning]);

  // Emit the upgraded/initialized view config
  // to onConfigChange if necessary.
  useEffect(() => {
    if (success && !isEqual(configOrWarning, config) && onConfigChange) {
      onConfigChange(configOrWarning);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, configUid, configOrWarning, onConfigChange]);

  return success ? (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={muiTheme[theme]}>
        <ViewConfigProvider createStore={createViewConfigStore}>
          <AuxiliaryProvider createStore={createAuxiliaryStore}>
            <VitessceGrid
              viewTypes={viewTypes}
              fileTypes={fileTypes}
              coordinationTypes={coordinationTypes}
              config={configOrWarning}
              rowHeight={rowHeight}
              height={height}
              theme={theme}
              isBounded={isBounded}
            />
            <CallbackPublisher
              onWarn={onWarn}
              onConfigChange={onConfigChange}
              onLoaderChange={onLoaderChange}
              validateOnConfigChange={validateOnConfigChange}
              pluginSpecificConfigSchema={pluginSpecificConfigSchema}
            />
          </AuxiliaryProvider>
        </ViewConfigProvider>
      </ThemeProvider>
    </StylesProvider>
  ) : (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={muiTheme[theme]}>
        <Warning {...configOrWarning} />
      </ThemeProvider>
    </StylesProvider>
  );
}
