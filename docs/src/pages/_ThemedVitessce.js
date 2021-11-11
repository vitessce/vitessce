import React from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import { Vitessce } from 'vitessce/dist/esm/index';

function VitessceAppStyles() {
  return (
    <style>{`   
          .footer {
              display: none;
          }
          .navbar__item {
              opacity: 0.2;
              transition: opacity 0.25s;
          }
          .navbar:hover .navbar__item {
              opacity: 1;
          }
      `}
    </style>
  );
}


export default function ThemedVitessce(props) {
  const { isDarkTheme } = useThemeContext();
  return (
    <>
      <VitessceAppStyles />
      <Vitessce
        theme={isDarkTheme ? 'dark' : 'light'}
        {...props}
      />
    </>
  );
}
