import styled from '@emotion/styled';
import { Button, Grid, Accordion as MuiAccordion, AccordionDetails as MuiAccordionDetails, TextField, Select } from '@mui/material';


export const Header = styled(Grid)({
  marginTop: '10px',
  marginBottom: '10px',
});

export const FullWidthBox = styled('div')({
  width: '100%',
});

export const SelectButton = styled(Button)({
  position: 'absolute',
  right: 0,
});

export const Accordion = styled(MuiAccordion)({
  width: '100%',
  margin: '0 !important',
});

export const AccordionDetails = styled(MuiAccordionDetails)({
  paddingTop: 0,
});

export const CartList = styled('ul')({
  marginTop: 0,
  marginBottom: 0,
});

export const SearchInput = styled(TextField)({
  lineHeight: 'initial',
  height: 'auto !important',
});

export const SelectInput = styled(Select)({
  height: 'auto !important',
});
