import React from 'react';

import DemoList from './_DemoList';

import { configs } from '@vitessce/examples';

export default function Demos() {
  return (
    <DemoList configs={configs} />
  );
}
