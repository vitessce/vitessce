/* eslint-disable */
import React from 'react';
import {
  ThemeProvider, StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles';
import VitessceWithSidebarConsumer from './VitessceWithSidebarConsumer';

const generateClassName = createGenerateClassName({
  disableGlobal: true,
});

export default function VitessceWithSidebar(props) {
  return (
    <StylesProvider generateClassName={generateClassName}>
      <VitessceWithSidebarConsumer {...props} />
    </StylesProvider>
  );
}