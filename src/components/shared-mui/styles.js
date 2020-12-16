import { makeStyles, createMuiTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

export const styles = makeStyles(() => ({
  paper: {
    maxHeight: 200,
    overflow: 'auto',
    zIndex: 1500,
  },
  span: {
    width: '70px',
    textAlign: 'center',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
  popper: {
    zIndex: 4,
  },
}));

export const muiTheme = {
  dark: createMuiTheme({
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
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
  }),
  light: createMuiTheme({
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
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
  }),
};
