import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useThemeContext from '@theme/hooks/useThemeContext';
import { Vitessce } from 'vitessce/dist/esm/index';
import DemoDescription from './_DemoDescription';
import ErrorBoundary from './_ErrorBoundary';

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
    } = props;

    const baseUrl = useBaseUrl('/app/?edit=1&url=');

    return (
        <div>
            <div className={styles.demoHeaderContainer}>
                <h4 className={styles.demoHeaderText}>Demo</h4>
                <h1 className={styles.demoHeaderText}>{config.name}</h1>
                <h2 className={styles.demoHeaderText}>{config.description}</h2>
                
                <div className={styles.demoMarkdownContainer}>
                    <ErrorBoundary>
                        <DemoDescription demo={demo} />
                    </ErrorBoundary>
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
                        href={baseUrl + 'data:,' + encodeURIComponent(JSON.stringify(config))}
                    >
                    Edit
                    </a>
                </div>
            </main>
        </div>
    );
}

export default Demo;
