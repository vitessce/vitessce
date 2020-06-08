import { makeStyles, createMuiTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

export const controllerTheme = {
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

export const useOptionStyles = makeStyles(() => ({
  paper: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  span: {
    width: '70px',
    textAlign: 'center',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
  colors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    paddingLeft: '2px',
    paddingRight: '2px',
  },
}));

export const useExpansionPanelStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: '100%',
    flexDirection: 'column',
  },
}));
