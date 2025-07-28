/* eslint-disable max-len */
import { makeStyles } from '@vitessce/styles';

export const useStyles = makeStyles()(theme => ({
  selectableTable: {
    flex: '1 1 auto',
    outline: 'none',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: `1px solid ${theme.palette.secondaryBackgroundDim}`, // map-get($theme-colors, "secondary-background-dim");
  },
  tableItem: {
    cursor: 'pointer',
    userSelect: 'none',

    '&.row-checked': {
      backgroundColor: theme.palette.secondaryBackgroundDim, // map-get($theme-colors, "secondary-background-dim");
    },
    '&:not(.row-checked):hover': {
      /*
      @if $theme-name == dark {
          background-color: darken(map-get($theme-colors, "secondary-background-dim"), 10%);
      } @else {
          background-color: lighten(map-get($theme-colors, "secondary-background-dim"), 10%);
      }
      */
    },
  },
  tableCell: {
    textAlign: 'left',
    flexBasis: 0,
    flexGrow: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  inputContainer: {
    width: '1em',
    '& label': {
      display: 'block',
      margin: '0',
      cursor: 'pointer',
    },
    '& input': {
      cursor: 'pointer',
    },
  },
  hiddenInputColumn: {
    // Class for first column of inputs, to hide them if desired.
    display: 'none',
  },
  radioOrCheckbox: {
    appearance: 'none',
    /* create custom radiobutton appearance */
    display: 'inline-block',
    width: '1em',
    height: '1em',
    margin: '0.3em 0.5em 0.0em 0.5em',
    padding: '6px',
    /* background-color only for content */
    backgroundClip: 'content-box',
    border: `2px solid ${theme.palette.grayLight}`, // map-get($global-colors, "gray-light");
    backgroundColor: theme.palette.grayLight, // map-get($global-colors, "gray-light");
    '&:checked': {
      backgroundClip: 'unset',
    },
  },
  tableRadio: {
    borderRadius: '50%',
  },
  tableCheckbox: {
    borderRadius: '2px',
  },
}));
