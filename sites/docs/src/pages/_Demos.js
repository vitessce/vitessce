import React from 'react';

import { configs } from '@vitessce/example-configs';
import DemoList from './_DemoList';


export default function Demos() {
  return <DemoList configs={configs} />;
}
