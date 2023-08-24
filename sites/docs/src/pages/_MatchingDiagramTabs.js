import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

export default function MatchingDiagramTabs() {
  const baseUrl = useBaseUrl('/img/matching');
  return (
    <>
      <div className={styles.viewConfigTabs}>
        <Tabs
          defaultValue="heatmap"
          values={[
            { label: 'Heatmap', value: 'heatmap' },
            { label: 'Scatterplot', value: 'scatterplot' },
            { label: 'Spatial', value: 'spatial' },
            { label: 'Hide matches', value: 'none' },
          ]}
          aria-label="View configuration tabs"
        >
          {['heatmap', 'scatterplot', 'spatial', 'none'].map(val => (
            <TabItem value={val} key={val}>
              <img src={`${baseUrl}/${val}.png`} alt={val} title={val} />
            </TabItem>
          ))}
        </Tabs>
      </div>
    </>
  );
}
