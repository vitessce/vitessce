import React from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import { Vitessce } from '../../../dist/umd/production/index.min.js';
import '../../../dist/umd/production/static/css/index.css';

export default function ThemedVitessce(props) {
    const { isDarkTheme } = useThemeContext();
    return (
      <Vitessce
        {...props}
        theme={isDarkTheme ? "dark" : "light"}
      />
    );
}