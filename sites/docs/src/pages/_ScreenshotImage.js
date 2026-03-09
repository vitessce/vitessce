import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';

export default function ScreenshotImage(props) {
  const {
    alt = '',
    filename,
    noTitle = false,
  } = props;
  const { colorMode } = useColorMode();
  const isDarkTheme = (colorMode === 'dark');
  const theme = (isDarkTheme ? 'dark' : 'light');
  const baseUrl = useBaseUrl('/img/screenshots');
  return (
    <div>
      <img src={`${baseUrl}/${theme}/${filename}`} alt={alt} title={alt} style={{ width: '100%', display: 'block' }} />
      {!noTitle && <h3 style={{ textAlign: 'center' }}>{alt}</h3>}
    </div>
  );
}
