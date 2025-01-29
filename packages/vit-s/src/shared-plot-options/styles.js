import { styled } from '@mui/material-pigment-css';

import { Select as MuiSelect, TableContainer, Checkbox as MuiCheckbox, Slider as MuiSlider } from '@mui/material';

export const BorderBox = styled('div')({
  boxSizing: 'border-box',
});

export const Checkbox = styled(MuiCheckbox)({
  padding: '3px',
  color: 'primaryForeground',
  '&:checked': {
    color: 'primaryForeground',
  },
  '& input': {
    height: '100%',
  },
});

export const Slider = styled(MuiSlider)(({ theme }) => ({
  color: theme.palette.primaryForeground,
  minWidth: '60px',
  padding: '10px 0 10px 0',
}));

export const SliderValueLabel = styled('div')(({ theme }) => ({
  '& span': {
    '& span': {
      color: theme.palette.primaryBackground,
    },
  },
}));

export const StyledTableContainer = styled(TableContainer)({
  overflow: 'hidden',
  overflowX: 'hidden !important',
});

export const LabelCell = styled('div')({
  padding: '2px 8px 2px 16px',
});

export const InputCell = styled('div')({
  padding: '2px 16px 2px 8px',
  overflow: 'visible',
});


export const StyledSelect = styled(MuiSelect)({
  padding: 0,
  height: 'auto',
});
