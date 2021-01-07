import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

function getDemoUrl(demoKey) {
  return useBaseUrl(`demos/index.html#?dataset=${demoKey}`);
}

function DemoList(props) {
    const {
        configs,
        descriptions,
    } = props;

    const demos = Object.entries(configs).filter(([k, v]) => v.public);
    return (
        <>
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
        </>
    );
}

export default DemoList;
