import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';

export default function ComponentImage(props) {
  const {
    alt = '',
    filename,
  } = props;
  const { colorMode } = useColorMode();
  const isDarkTheme = (colorMode === 'dark');
  const baseUrl = useBaseUrl('/img/components');
  const theme = (isDarkTheme ? 'dark' : 'light');
  return (
    <img src={`${baseUrl}/${theme}/${filename}`} alt={alt} title={alt} />
  );
}
