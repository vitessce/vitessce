import { makeStyles } from '@vitessce/styles';

export const useStyles = makeStyles()(theme => ({
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
      border: 'none',
      fontSize: '12px',
      lineHeight: 1.43,
      opacity: 0.8,
      outline: 0,
      padding: '0 2px !important',
      textAlign: 'left',
      color: theme.palette.tooltipText,
    },
    '& table': {
      borderCollapse: 'collapse',
      marginBottom: '0px',
    },
  },
}));
