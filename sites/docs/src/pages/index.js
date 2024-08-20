/* eslint-disable global-require */
import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function WrappedIndex() {
  return (
    <Layout
      description="Experience Vitessce with Mixed Reality"
    >
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
