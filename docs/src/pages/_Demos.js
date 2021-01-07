import React from 'react';
import useHashParam from 'use-hash-param';
import Demo from './_Demo';
import DemoList from './_DemoList';

import styles from './styles.module.css';

function Demos(props) {
    const {
        configs,
        descriptions
    } = props;
  const [demo, setDemo] = useHashParam('dataset', undefined);

  console.log(demo);

  return (Object.keys(configs).includes(demo) ? (
    <Demo
        demo={demo}
        config={configs[demo]}
        description={descriptions[demo]}
    />
  ) : (
    <DemoList
        configs={configs}
        descriptions={descriptions}
    />
  ));
}

export default Demos;
