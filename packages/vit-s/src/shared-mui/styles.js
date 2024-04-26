import { createTheme, colors } from '@material-ui/core';

const { grey } = colors;

const globalColors = {
  white: '#FFFFFF',
  grayLight: '#D3D3D3',
  grayMid: '#808080',
  grayDark: '#555555',
  black: '#000000',
  grayDarkL5: 'rgb(98, 98, 98)', // lighten(map-get($global-colors, "gray-dark"), 5%);
  grayDarkD15: 'rgb(47, 47, 47)', // darken(map-get($global-colors, "gray-dark"), 15%);
  grayMidL10: 'rgb(154, 154, 154)', // lighten(map-get($global-colors, "gray-mid"), 10%);
  grayLightL10: 'rgb(237, 237, 237)', // lighten(map-get($global-colors, "gray-light"), 10%);
};

const sharedThemeOptions = {
  // Use px instead of rem, so that sizing is consistent despite the root element font-size.
  // Reference: https://github.com/mui/material-ui/blob/627c08fc/src/styles/createTypography.js
  typography: {
    pxToRem: size => `${size}px`,
    display4: {
      fontSize: '112px',
    },
    display3: {
      fontSize: '56px',
    },
    display2: {
      fontSize: '45px',
    },
    display1: {
      fontSize: '34px',
    },
    headline: {
      fontSize: '24px',
    },
    title: {
      fontSize: '21px',
    },
    subheading: {
      fontSize: '16px',
    },
    body2: {
      fontSize: '14px',
    },
    body1: {
      fontSize: '14px',
    },
    caption: {
      fontSize: '12px',
    },
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
};

export const muiTheme = {
  dark: createTheme({
    palette: {
      type: 'dark',
      primary: grey,
      secondary: grey,
      primaryBackground: '#222222',
      primaryBackgroundHighlight: '#000000',
      primaryBackgroundInput: '#D3D3D3',
      primaryBackgroundDim: '#333333',
      primaryBackgroundLight: '#757575',
      primaryForeground: '#D3D3D3',
      primaryForegroundL5: 'rgb(224, 224, 224)',
      primaryForegroundL10: 'rgb(237, 237, 237)',
      primaryForegroundD15: 'rgb(173, 173, 173)',
      primaryForegroundDim: '#000000',
      primaryForegroundActive: '#9bb7d6',
      secondaryBackground: '#000000',
      secondaryBackgroundDim: '#444444',
      secondaryForeground: '#D3D3D3',
      gridLayoutBackground: '#333333',
      cardBorder: 'rgba(0, 0, 0, 0.125)',
      tooltipText: '#FFFFFF',
      ...globalColors,
    },
    ...sharedThemeOptions,
  }),
  light: createTheme({
    palette: {
      type: 'light',
      primary: grey,
      secondary: grey,
      primaryBackground: '#F1F1F1',
      primaryBackgroundHighlight: '#FFFFFF',
      primaryBackgroundInput: '#FFFFFF',
      primaryBackgroundDim: '#8A8A8A',
      primaryBackgroundLight: '#e0e0e0',
      primaryForeground: '#333333',
      primaryForegroundL5: 'rgb(64, 64, 64)', // lighten(map-get($theme-colors, "primary-foreground"), 5%);
      primaryForegroundL10: 'rgb(77, 77, 77)', // lighten(map-get($theme-colors, "primary-foreground"), 10%);
      primaryForegroundD15: 'rgb(13, 13, 13)', // darken(map-get($theme-colors, "primary-foreground"), 15%);
      primaryForegroundDim: '#808080',
      primaryForegroundActive: '#0074D9',
      secondaryBackground: '#F1F1F1',
      secondaryBackgroundDim: '#C0C0C0',
      secondaryForeground: '#222222',
      gridLayoutBackground: '#FFFFFF',
      cardBorder: 'rgba(241, 241, 241, 0.125)',
      tooltipText: 'rgba(0, 0, 0, 0.87)',
      ...globalColors,
    },
    ...sharedThemeOptions,
  }),
};
