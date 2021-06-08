/* eslint-disable */
import React from 'react';
import {
  ThemeProvider, StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles';
import StyledVitessceSidebar from './StyledVitessceSidebar';

const generateClassName = createGenerateClassName({
  disableGlobal: true,
});

export default function VitessceSidebar(props) {
  return (
    <StylesProvider generateClassName={generateClassName}>
      <StyledVitessceSidebar {...props} />
    </StylesProvider>
  );
}
