/* eslint-disable */
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
  appContainer: {
    backgroundColor: 'blue',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
  },
  sidebarContainer: {
    backgroundColor: 'rgb(230, 230, 230)',
    width: '36px',
    height: '100vh',
    float: 'left',
    '& svg': {
      width: '30px',
      height: '30px',
      margin: '3px',
    }
  },
  actionContainer: {
    position: 'relative',
    '& svg': {
      color: 'rgb(103, 103, 103)',
      cursor: 'pointer',
    },
    '& svg:hover': {
      color: 'rgb(34, 34, 34)',
      
    },
    '& svg:hover + label': {
      display: 'inline-block',
    },
    '& label': {
      display: 'none',
      float: 'right',
      overflow: 'visible',
      position: 'absolute',
      zIndex: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.5)',
      marginLeft: '3px',
      borderRadius: '5px',
      padding: '3px',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      marginTop: '6px',
    },
  },
  mainContainer: {
    width: 'calc(100% - 36px)',
    height: '100%',
    float: 'left',
  },
}));

