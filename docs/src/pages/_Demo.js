import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useThemeContext from '@theme/hooks/useThemeContext';
import {
    Vitessce
  } from '../../../dist/umd/production/index.min.js';

import styles from './styles.module.css';

function ThemedVitessce(props) {
    const { isDarkTheme } = useThemeContext();
    return (
        <Vitessce
            theme={isDarkTheme ? "dark" : "light"}
            {...props}
        />
    );
}

function Demo(props) {
    const {
        demo,
        config,
        description
    } = props;

    function handleEdit() {

    }
  return (
    <>
        <h5>Demo</h5>
        <h1>{config.name}</h1>
        <h2>{config.description}</h2>
        
        <div className={styles.demoMarkdownContainer}>
            {description}
        </div>

        <div className={styles.vitessceClear}>
            <button
              className={styles.vitessceClearButton}
              onClick={handleEdit}
            >
              Edit
            </button>
        </div>

        <main className={'vitessce-app'}>
          <ThemedVitessce
            validateOnConfigChange={false}
            config={config}
          />
        </main>
    </>
  );
}

export default Demo;
