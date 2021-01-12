import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function WrappedIndex() {
  return (
    <Layout
      title="Demos"
      description="Demos of Vitessce features">
      <BrowserOnly>
        {() => {
          const Index = require('./_Index.js').default;
          return (
            <Index />
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}
