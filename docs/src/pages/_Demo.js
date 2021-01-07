import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

import { configs } from '../../../src/demo/configs';

import styles from './styles.module.css';

const demos = Object.entries(configs).filter(([k, v]) => v.public);

function getDemoUrl(demoKey) {
  return useBaseUrl(`app/index.html?dataset=${demoKey}`);
}

function Demo(props) {
    const {
        demo,
        config,
        description
    } = props;
  return (
    <>
        {demo}
    </>
  );
}

export default Demo;
