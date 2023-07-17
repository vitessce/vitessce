import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  box: {
    boxSizing: 'border-box',
  },
  checkbox: {
    padding: '3px',
    color: theme.palette.primaryForeground,
    '&:checked': {
      color: theme.palette.primaryForeground,
    },
    '& input': {
      height: '100%',
    },
  },
  slider: {
    color: theme.palette.primaryForeground,
    minWidth: '60px',
    padding: '10px 0 10px 0',
  },
  sliderValueLabel: {
    '& span': {
      '& span': {
        color: theme.palette.primaryBackground,
      },
    },
  },
  tableContainer: {
    overflow: 'hidden',
    overflowX: 'hidden !important',
  },
  labelCell: {
    padding: '2px 8px 2px 16px',
  },
  inputCell: {
    padding: '2px 16px 2px 8px',
    overflow: 'visible',
  },
  select: {
    '& select': {
      fontSize: '14px',
    },
  },
  optionSelectRoot: {
    padding: 0,
    height: 'auto',
  },
}));
