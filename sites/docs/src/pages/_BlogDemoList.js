/* eslint-disable global-require */
import React from 'react';
import { configs } from '@vitessce/example-configs';
import DemoList from './_DemoList.js';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function BlogDemoList() {
  return (
    <DemoList
      configs={configs}
      small
      subset={[
        'codeluppi-2018',
        'codeluppi-2018-via-zarr',
        'eng-2019',
        'wang-2018',
        'satija-2020',
        'human-lymph-node-10x-visium',
        'habib-2017',
        'marshall-2022',
        'kuppe-2022',
        'combat-2022',
        'meta-2022-azimuth',
      ]}
    />
  );
}
