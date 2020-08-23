import React, { useEffect } from 'react';
import Ajv from 'ajv';
import {
  ThemeProvider, StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles';
import isEqual from 'lodash/isEqual';
import packageJson from '../../package.json';
import { muiTheme } from '../components/shared-mui/styles';
import configSchema from '../schemas/config.schema.json';

import DatasetLoaderProvider from './DatasetLoaderProvider';
import VitessceGrid from './VitessceGrid';
import Warning from './Warning';
import ViewConfigPublisher from './ViewConfigPublisher';
import { getComponent } from './component-registry';
import { initialize } from './view-config-utils';

const generateClassName = createGenerateClassName({
  disableGlobal: true,
});


function ValidVitessce(props) {
  const {
    config,
    rowHeight,
    height,
    theme,
    onWarn,
    onConfigChange,
    onLoaderChange,
  } = props;

  // Initialize the view config:
  // - Fill in all missing coordination objects with default global values
  // - Fill in all missing component coordination scope mappings
  //   based on the initStrategy view config field.
  const initializedConfig = initialize(config);

  // Emit the initialized view config if it is different than the
  // prop value.
  useEffect(() => {
    if (!isEqual(initializedConfig, config) && onConfigChange) {
      onConfigChange(initializedConfig);
    }
  }, [initializedConfig, config, onConfigChange]);

  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={muiTheme[theme]}>
        <DatasetLoaderProvider>
          <VitessceGrid
            config={initializedConfig}
            getComponent={getComponent}
            rowHeight={rowHeight}
            height={height}
            theme={theme}
            onWarn={onWarn}
          />
          <ViewConfigPublisher
            onConfigChange={onConfigChange}
            onLoaderChange={onLoaderChange}
          />
        </DatasetLoaderProvider>
      </ThemeProvider>
    </StylesProvider>
  );
}

/**
 * The Vitessce component.
 * @param {object} props
 * @param {object} props.config A Vitessce view config.
 * If the config is valid, the VitessceGrid will be rendered as a child.
 * If the config is invalid, a Warning will be rendered instead.
 * @param {number} props.rowHeight Row height for grid layout. Optional.
 * @param {number} props.height Total height for grid layout. Optional.
 * @param {string} props.theme The theme, used for styling as
 * light or dark. Optional. By default, "dark"
 * @param {function} props.onWarn A callback for warning messages. Optional.
 * @param {function} props.onConfigChange A callback for view config
 * updates. Optional.
 * @param {function} props.onLoaderChange A callback for loader
 * updates. Optional.
 */
export default function Vitessce(props) {
  const {
    config,
    theme,
  } = props;
  if (!config) {
    // If the config value is undefined, show a warning message
    return (
      <Warning
        title="No such dataset"
        unformatted="The dataset configuration could not be found."
        theme={theme}
      />
    );
  }
  // NOTE: Remove when this is available in UI.
  console.groupCollapsed(`🚄 Vitessce (${packageJson.version}) view configuration`);
  console.info(`data:,${JSON.stringify(config)}`);
  console.info(JSON.stringify(config, null, 2));
  console.groupEnd();
  const validate = new Ajv().compile(configSchema);
  const valid = validate(config);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    return (
      <Warning
        title="Config validation failed"
        preformatted={failureReason}
        theme={theme}
      />
    );
  }

  return <ValidVitessce {...props} />;
}
