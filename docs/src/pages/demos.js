import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function WrappedDemos(props) {
  return (
    <Layout
      title="Demos"
      description="Demos of Vitessce features">
      <BrowserOnly>
        {() => {
          const Demos = require('./_Demos.js').default;
          return (
            <Demos />
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}

