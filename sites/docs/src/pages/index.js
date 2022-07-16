
import React from 'react';
import Layout from '@theme/Layout';

import { MyComponent } from 'vitessce';

export default function Index() {
  return (
    <Layout
      description="Example repo."
    >
      <h1>Some home page content</h1>
      <MyComponent color="blue" a={1} b={2} />
    </Layout>
  );
}