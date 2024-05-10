import React from 'react';

import { configs } from '@vitessce/example-configs';
import DemoList from './_DemoList.js';


export default function Demos() {
  return (
    <DemoList configs={configs} />
  );
}
