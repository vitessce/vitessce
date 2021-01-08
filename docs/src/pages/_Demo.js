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
        config,
        description
    } = props;

    return (
        <>
            <div className={styles.demoHeaderContainer}>
                <h4>Demo</h4>
                <h1>{config.name}</h1>
                <h2>{config.description}</h2>
                
                <div className={styles.demoMarkdownContainer}>
                    {description}
                </div>
            </div>
            <main className={'vitessce-app'}>
                <ThemedVitessce
                    validateOnConfigChange={false}
                    config={config}
                />
                <div className={styles.vitessceClear}>
                    <a
                        className={styles.vitessceClearButton}
                        href={useBaseUrl(`/app/index.html#?edit=1&url=data:,` + encodeURIComponent(JSON.stringify(config)))}
                    >
                    Edit
                    </a>
                </div>
            </main>
        </>
    );
}

export default Demo;
