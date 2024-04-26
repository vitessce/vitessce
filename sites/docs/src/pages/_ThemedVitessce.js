import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { Vitessce } from 'vitessce';

export default function ThemedVitessce(props) {
  const { colorMode } = useColorMode();
  const isDarkTheme = (colorMode === 'dark');

  return (
    <>
      <Vitessce
        theme={isDarkTheme ? 'dark' : 'light2'}
        {...props}
      />
    </>
  );
}
