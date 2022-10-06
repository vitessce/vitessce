import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { Vitessce, setup } from 'vitessce';

setup();

export default function ThemedVitessce(props) {
  const { colorMode } = useColorMode();
  const isDarkTheme = (colorMode === 'dark');

  return (
    <>
      <Vitessce
        theme={isDarkTheme ? 'dark' : 'light'}
        {...props}
      />
    </>
  );
}
