import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(() => ({
  tooltipAnchor: {
    position: 'relative',
    width: '0px',
    height: '0px',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  tooltipContent: {
    opacity: 0.9,
    padding: '5px',
    pointerEvents: 'none',
    '& table > tbody > tr > th, & table > tbody > tr > td': {
      fontSize: '80%',
      opacity: 0.8,
      outline: 0,
      padding: '0 2px',
    },
    '& table': {
      borderCollapse: 'collapse',
    },
  },
}));
