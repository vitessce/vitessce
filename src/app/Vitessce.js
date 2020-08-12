import React from 'react';
import Ajv from 'ajv';
import {
  ThemeProvider, StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles';
import packageJson from '../../package.json';
import { muiTheme } from '../components/shared-mui/styles';
import configSchema from '../schemas/config.schema.json';

import DatasetLoaderProvider from './DatasetLoaderProvider';
import VitessceGrid from './VitessceGrid';
import Warning from './Warning';
import { getComponent } from './component-registry';

const generateClassName = createGenerateClassName({
  disableGlobal: true,
});

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
 */
export default function Vitessce(props) {
  const {
    config,
    onConfigChange,
    rowHeight,
    height,
    theme,
    onWarn,
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

  // TODO: verify that all component uid values are unique.
  // TODO: fill in all missing coordination objects with default global values
  // TODO: fill in all missing component coordination scope mappings with "global"
  //       (if want to link everything by default)
  //       or alternatively a unique ID (if want to link nothing by default)

  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={muiTheme[theme]}>
        <DatasetLoaderProvider>
          <VitessceGrid
            config={config}
            onConfigChange={onConfigChange}
            getComponent={getComponent}
            rowHeight={rowHeight}
            height={height}
            theme={theme}
            onWarn={onWarn}
          />
        </DatasetLoaderProvider>
      </ThemeProvider>
    </StylesProvider>
  );
}
