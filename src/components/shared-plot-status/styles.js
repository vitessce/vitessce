/* eslint-disable */
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  box: {
    boxSizing: 'border-box',
    position: 'absolute',
    bottom: 0,
    right: 0,
    textAlign: 'right',
  },
  statusText: {
    fontSize: '10px',
    display: 'inline-block',
    padding: '2px',
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
  }
}));

