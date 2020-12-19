import React from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

import linnarsson from './demo-configs/linnarsson.json';
import spraggins from './demo-configs/spraggins.json';
import dries from './demo-configs/dries.json';
import baysorAllenSmFish from './demo-configs/baysor-allen-smfish.json';

import styles from './styles.module.scss';

const demos = [
  linnarsson,
  spraggins,
  dries,
  baysorAllenSmFish,
];

function getDemoUrl(config) {
  return useBaseUrl('app/?url=data:,' + encodeURIComponent(JSON.stringify(config)));
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
        {demos.map(d => (
          <div key={d.name} className={styles.demoGridItem}>
            <a href={getDemoUrl(d)}  className={styles.demoGridItemLink}>{d.name}</a>
            <p className={styles.demoGridItemDescription}>{d.description}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Demos;
