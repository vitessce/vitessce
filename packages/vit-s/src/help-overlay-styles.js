import { makeStyles } from '@material-ui/core';

export const useHelpStyles = makeStyles(theme => ({

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    position: 'relative',
    backgroundColor: theme.palette.gridLayoutBackground,
    color: theme.palette.tooltipText,
    padding: ' 10px 20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
    width: '30%',
    border: '10px solid grey',
    display: 'flex',
    flexDirection: 'column',
  },

  closeButton: {
    alignSelf: 'flex-end',
    padding: '0px',
  },
}));
