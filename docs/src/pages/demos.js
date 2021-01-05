import React from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

import { configs } from '../../../src/demo/configs';

import styles from './styles.module.css';

const demos = Object.entries(configs).filter(([k, v]) => v.public);

function getDemoUrl(demoKey) {
  return useBaseUrl(`app/index.html?dataset=${demoKey}`);
}

function Demos() {
  return (
    <Layout
      title="Demos"
      description="Demos of Vitessce features">
      
      <p className={styles.demoDescription}>
        The demos compiled here showcase the core features of Vitessce.
      </p>
      <div className={styles.demoGridContainer}>
        {demos.map(([key, d]) => (
          <div key={key} className={styles.demoGridItem}>
            <a href={getDemoUrl(key)}  className={styles.demoGridItemLink}>{d.name}</a>
            <p className={styles.demoGridItemDescription}>{d.description}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Demos;
