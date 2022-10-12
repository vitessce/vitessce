import React from 'react';

import DemoList from './_DemoList';

import { configs } from '@vitessce/example-configs';

export default function Demos() {
  return (
    <DemoList configs={configs} />
  );
}
