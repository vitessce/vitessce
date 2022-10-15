/* eslint-disable global-require */
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function BrowserOnlyBlogDemoList() {
  return (
    <BrowserOnly>
      {() => {
        const BlogDemoList = require('./_BlogDemoList.js').default;
        return (
          <BlogDemoList />
        );
      }}
    </BrowserOnly>
  );
}
