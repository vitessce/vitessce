import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  plotOptionsBox: {
    boxSizing: 'border-box',
  },
  plotOptionsCheckbox: {
    padding: '3px',
    color: theme.palette.primaryForeground,
    '&:checked': {
      color: theme.palette.primaryForeground,
    },
    '& input': {
      height: '100%',
    },
  },
  plotOptionsSlider: {
    color: theme.palette.primaryForeground,
    minWidth: '60px',
    padding: '10px 0 10px 0',
  },
  plotOptionsSliderValueLabel: {
    '& span': {
      '& span': {
        color: theme.palette.primaryBackground,
      },
    },
  },
  plotOptionsTableContainer: {
    overflow: 'hidden',
    overflowX: 'hidden !important',
  },
  plotOptionsLabelCell: {
    padding: '2px 8px 2px 16px',
  },
  plotOptionsInputCell: {
    padding: '2px 16px 2px 8px',
    overflow: 'visible',
  },
  plotOptionsSelect: {
    '& select': {
      fontSize: '14px',
    },
  },
  plotOptionsSelectRoot: {
    padding: 0,
    height: 'auto',
  },
}));
