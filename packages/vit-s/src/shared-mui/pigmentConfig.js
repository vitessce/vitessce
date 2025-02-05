import { muiTheme } from './styles.js';

/**
 * @type {import('@pigment-css/vite-plugin').PigmentOptions}
 */
export const pigmentConfig = {
  transformLibraries: ['@mui/material'],
  theme: muiTheme,
};
