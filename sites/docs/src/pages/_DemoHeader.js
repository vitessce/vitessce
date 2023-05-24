import React from 'react';
import DemoDescription from './_DemoDescription.js';
import ErrorBoundary from './_ErrorBoundary.js';

import styles from './styles.module.css';

function DemoHeader(props) {
  const {
    demo,
    config,
  } = props;

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
    </div>
  );
}

export default DemoHeader;
