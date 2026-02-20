/* eslint-disable global-require */
import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function WrappedDemos() {
  return (
    <Layout
      title="Examples"
      description="Interactive demonstrations of Vitessce across spatial biology, multi-omics, and 3D tissue visualization datasets."
      image="http://beta.vitessce.io/img/logo-card.png"
    >
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
