
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { grey } from '@material-ui/core/colors';

import { makeStyles, createMuiTheme, withStyles } from '@material-ui/core/styles';

const paperStyles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
});
const popperStyles = () => ({
  root: {
    zIndex: 4,
  },
});

export const StyledPopper = withStyles(popperStyles)(Popper);
export const StyledPaper = withStyles(paperStyles)(Paper);

export const spanStyles = makeStyles(() => ({
  span: {
    width: '70px',
    textAlign: 'center',
    paddingLeft: '2px',
    paddingRight: '2px',
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
      action: {
        hoverOpacity: 0,
      },
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
      action: {
        hoverOpacity: 0,
      },
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
  }),
};
