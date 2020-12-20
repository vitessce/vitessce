import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
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
