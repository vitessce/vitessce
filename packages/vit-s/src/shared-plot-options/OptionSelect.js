import React from 'react';
import styled from '@emotion/styled';
import { StyledSelect } from './styles.js';

export default function OptionSelect(props) {
  return (
    <StyledSelect
      native
      disableUnderline
      {...props}
      aria-label="Select an option"
    />
  );
}

export const StyledOptionSelect = styled(OptionSelect)({
  '& select': {
    fontSize: '14px',
  },
});
