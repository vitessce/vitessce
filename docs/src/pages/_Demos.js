import React from 'react';
import Loading from '@theme/Loading';
import registry from '@generated/registry';
import Loadable from 'react-loadable';

import useHashParam from './_use-hash-param';
import Demo from './_Demo';
import DemoList from './_DemoList';


function Demos(props) {
    const {
        configs,
        descriptions
    } = props;
  const [demo, setDemo] = useHashParam('dataset', undefined);

  // Try to get the Description component from the markdown file in
  // the docs/demos/ directory (if one exists).
  const chunkRegistry = Object.values(registry)
    .find(c => c[1] === `@site/docs/demos/${demo}.md`);

  let Description = () => null;
  if(chunkRegistry) {
      // Reference: https://github.com/facebook/docusaurus/blob/cf97662/packages/docusaurus/src/client/exports/ComponentCreator.tsx#L56
    const [optsLoader, optsModules, optsWebpack] = chunkRegistry;

    Description = Loadable({
        loading: Loading,
        loader: optsLoader,
        modules: optsModules,
        webpack: () => optsWebpack,
    });
  }

  return (Object.keys(configs).includes(demo) ? (
    <Demo
        demo={demo}
        config={configs[demo]}
        description={<Description />}
    />
  ) : (
    <DemoList
        configs={configs}
        descriptions={descriptions}
    />
  ));
}

export default Demos;
