/* eslint-disable */
// done
import React from 'react';
import styled from 'styled-components';

import {
  StyledLensIcon,
  StyledPaddedIconButton
} from './styles';

import { VIEWER_PALETTE } from '../utils';

const StyledContainer = styled("div")`
  width: 70px;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const ColorPalette = ({ handleChange }) => {
  return (
    <StyledContainer aria-label="color-swatch">
      {VIEWER_PALETTE.map(color => (
        <StyledPaddedIconButton
          key={color}
          onClick={() => handleChange(color)}
        >
          <StyledLensIcon
            fontSize="small"
            style={{ color: `rgb(${color})` }}
          />
        </StyledPaddedIconButton>
      ))}
    </StyledContainer>
  );
};

export default ColorPalette;
