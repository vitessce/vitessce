import React from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import { Vitessce } from 'vitessce/dist/esm/index';


export default function ThemedVitessce(props) {
  const { isDarkTheme } = useThemeContext();
  return (
    <>
      <Vitessce
        theme={isDarkTheme ? 'dark' : 'light'}
        {...props}
      />
    </>
  );
}
