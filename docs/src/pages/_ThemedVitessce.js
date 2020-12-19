import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useThemeContext from '@theme/hooks/useThemeContext';
import '../../../dist/umd/production/static/css/index.css';

export default function ThemedVitessce(props) {
    const { isDarkTheme } = useThemeContext();
    return (
      <BrowserOnly>
        {() => {
          const Vitessce = require('../../../dist/umd/production/index.min.js').Vitessce;
          return (<Vitessce
            theme={isDarkTheme ? "dark" : "light"}
            {...props}
            />);
        }}
      </BrowserOnly>
    );
}