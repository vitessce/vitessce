import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

import { configs } from '../../../src/demo/configs';

const descriptions = {

};

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
function WrappedDemos(props) {
  return (
    <Layout
      title="Demos"
      description="Demos of Vitessce features">
      <BrowserOnly>
        {() => {
          const Demos = require('./_Demos.js').default;
          return (
            <Demos
              {...props}
              configs={configs}
              descriptions={descriptions}
            />
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}

export default WrappedDemos;
