import { createTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

const globalColors = {
  "white": '#FFFFFF',
  "grayLight": '#D3D3D3',
  "grayMid": '#808080',
  "grayDark": '#555555',
  "black": "#000000"
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
      primaryForegroundDim: '#000000',
      primaryForegroundActive: '#9bb7d6',
      secondaryBackground: '#000000',
      secondaryBackgroundDim: '#444444',
      secondaryForeground: '#D3D3D3',
      gridLayoutBackground: '#333333',
      cardBorder: 'rgba(0, 0, 0, 0.125)',
      ...globalColors,
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
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
      primaryForegroundDim: '#808080',
      primaryForegroundActive: '#0074D9',
      secondaryBackground: '#F1F1F1',
      secondaryBackgroundDim: '#C0C0C0',
      secondaryForeground: '#222222',
      gridLayoutBackground: '#FFFFFF',
      cardBorder: 'rgba(241, 241, 241, 0.125)',
      ...globalColors,
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
  }),
};