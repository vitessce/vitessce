import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

function WrappedApp(props) {
  return (
    <BrowserOnly>
      {() => {
        const App = require('./_App.js').default;
        return (<App {...props} />);
      }}
    </BrowserOnly>
  );
}

export default WrappedApp;
