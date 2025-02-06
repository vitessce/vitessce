import React from 'react';
import { IconButton } from '@mui/material';
import { Lens as LensIcon } from '@mui/icons-material';
import { VIEWER_PALETTE } from '@vitessce/utils';
import styled from '@emotion/styled';

const PaletteContainer = styled('div')({
  width: '70px',
  height: '40px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
});

const PaletteButton = styled(IconButton)({
  padding: '3px',
  width: '16px',
});

const StyledLensIcon = styled(LensIcon)(({ theme }) => ({
  width: '17px',
  height: '17px',
  stroke: theme.palette.action.selected,
  'stroke-width': '1px',
}));


const ColorPalette = ({ handleChange }) => (
  <PaletteContainer aria-label="Color swatch">
    {VIEWER_PALETTE.map(color => (
      <PaletteButton
        key={color}
        onClick={() => handleChange(color)}
        aria-label={`Change color to ${color}`}
      >
        <StyledLensIcon
          fontSize="small"
          style={{ color: `rgb(${color})` }}
        />
      </PaletteButton>
    ))}
  </PaletteContainer>
);

export default ColorPalette;
