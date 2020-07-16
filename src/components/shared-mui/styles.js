import { makeStyles, createMuiTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

export const styles = makeStyles(theme => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
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

export const colorPaletteStyles = makeStyles(() => ({
  colors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    paddingLeft: '2px',
    paddingRight: '2px',
  },
}));

export const muiTheme = {
  dark: createMuiTheme({
    palette: {
      type: 'dark',
      primary: grey,
      secondary: grey,
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
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
  }),
};
