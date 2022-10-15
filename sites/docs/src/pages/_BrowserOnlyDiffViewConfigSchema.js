/* eslint-disable global-require */
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function BrowserOnlyDiffViewConfigSchema() {
  return (
    <BrowserOnly>
      {() => {
        const DiffViewConfigSchema = require('./_DiffViewConfigSchema.js').default;
        return (
          <DiffViewConfigSchema />
        );
      }}
    </BrowserOnly>
  );
}
