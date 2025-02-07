/* eslint-disable max-len */
import styled from '@emotion/styled';

export const SelectableTableContainer = styled('div')(({ theme }) => ({
  flex: '1 1 auto',
  outline: 'none',
}));


export const SelectableTableItem = styled('div')(({ theme }) => ({
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
}));


export const SelectableTableRow = styled(SelectableTableItem)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  borderBottom: `1px solid ${theme.palette.secondaryBackgroundDim}`, // map-get($theme-colors, "secondary-background-dim");
}));

export const SelectableTableCell = styled('div')(({ theme }) => ({
  textAlign: 'left',
  flexBasis: 0,
  flexGrow: 1,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const InputContainer = styled(SelectableTableCell)(({ theme }) => ({
  width: '1em',
  '& label': {
    display: 'block',
    margin: '0',
    cursor: 'pointer',
  },
  '& input': {
    cursor: 'pointer',
  },
}));

export const HiddenInputColumn = styled(InputContainer)(({ theme }) => ({
  // Class for first column of inputs, to hide them if desired.
  display: 'none',
}));

export const RadioOrCheckbox = styled('input')(({ theme }) => ({
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
}));

export const TableRadio = styled(RadioOrCheckbox)(({ theme }) => ({
  borderRadius: '50%',
}));

export const TableCheckbox = styled(RadioOrCheckbox)(({ theme }) => ({
  borderRadius: '2px',
}));
