import React from 'react';

import useHashParam from './_use-hash-param';
import Demo from './_Demo';
import DemoList from './_DemoList';


function Demos(props) {
    const {
        configs,
    } = props;
  const [demo, setDemo] = useHashParam('dataset', undefined, 'string');

  return (Object.keys(configs).includes(demo) ? (
    <Demo
        demo={demo}
        config={configs[demo]}
    />
  ) : (
    <DemoList
        configs={configs}
    />
  ));
}

export default Demos;
