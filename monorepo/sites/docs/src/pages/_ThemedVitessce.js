import React, { useLayoutEffect, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { Vitessce as VitS } from '@vitessce/vit-s';
import { setup } from 'vitessce';

function Vitessce(props) {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    setup();
    setReady(true);
  }, []);
  return (ready ? (
    <VitS {...props} />
  ) : null);
}

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
