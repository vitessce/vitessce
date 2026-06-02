import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';

import styles from './styles.module.css';

const configAttrs = {
  'codeluppi-2018': ['imaging', 'CSV'],
  'codeluppi-2018-via-zarr': ['imaging', 'Zarr', 'AnnData'],
  'eng-2019': ['spatial', 'CSV'],
  'wang-2018': ['spatial', 'CSV'],
  'spraggins-2020': ['imaging'],
  'neumann-2020': ['multi-modal', 'imaging', 'OME-TIFF'],
  'satija-2020': ['Zarr', 'AnnData'],
  'sn-atac-seq-hubmap-2020': ['CSV', 'Zarr'],
  'blin-2019': ['imaging', '3D', 'Zarr', 'OME-NGFF'],
  'human-lymph-node-10x-visium': ['imaging', 'Zarr', 'AnnData'],
  'habib-2017': ['Zarr', 'AnnData'],
  'marshall-2022': ['spatial', 'Zarr', 'AnnData'],
  'kuppe-2022': ['mosaic', 'imaging', 'Zarr', 'AnnData'],
  'combat-2022': ['multi-modal', 'Zarr', 'AnnData', 'scalability'],
  'meta-2022-azimuth': ['Zarr', 'AnnData', 'scalability'],
  'salcher-2022': ['Zarr', 'AnnData', 'scalability'],
  'spatialdata-visium': ['spatial', 'imaging', 'Zarr', 'SpatialData'],
  'spatialdata-visium_io': ['spatial', 'imaging', 'Zarr', 'SpatialData'],
  'spatialdata-mcmicro_io': ['spatial', 'imaging', 'Zarr', 'SpatialData'],
  'maynard-2021': ['spatial', 'imaging', 'Zarr', 'SpatialData'],
  'jain-2024': ['imaging', 'spatial', 'ome-tiff', '3D', 'meshes', 'XR'],
  'sorger-2024-2': ['imaging', 'spatial', 'ome-tiff', '3D', 'meshes', 'XR'],
  'sorger-2024-4': ['imaging', 'spatial', 'ome-tiff', '3D', 'meshes', 'XR'],
};

function cleanAttr(attrVal) {
  let val = attrVal;
  if (val.match(/^\d/)) {
    val = `_${val}`;
  }
  return val.toLowerCase().replace('-', '');
}

function ExampleCard({ configKey, config, baseUrl, theme }) {
  const imgSrc = useBaseUrl(`/img/examples/${theme}/${configKey}.png`);
  const attrs = configAttrs[configKey] || [];

  return (
    <a href={`${baseUrl}${configKey}`} className={styles.exampleCard}>
      <img
        src={imgSrc}
        alt={config.name}
        className={styles.exampleCardImage}
        loading="lazy"
      />
      <div className={styles.exampleCardBody}>
        <h3 className={styles.exampleCardTitle}>{config.name}</h3>
        <p className={styles.exampleCardDescription}>{config.description}</p>
        <div className={styles.exampleCardTags}>
          {attrs.map(attrVal => (
            <span
              key={`${configKey}-${attrVal}`}
              className={clsx(styles.exampleCardPill, styles[cleanAttr(attrVal)])}
            >
              {attrVal}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

function DemoList(props) {
  const { colorMode } = useColorMode();
  const theme = colorMode === 'dark' ? 'dark' : 'light';
  const {
    configs,
    small = false,
    subset = [
      'codeluppi-2018',
      'eng-2019',
      'wang-2018',
      'spraggins-2020',
      'neumann-2020',
      'satija-2020',
      'sn-atac-seq-hubmap-2020',
      'blin-2019',
      'human-lymph-node-10x-visium',
      'habib-2017',
      'marshall-2022',
      'kuppe-2022',
      'combat-2022',
      'meta-2022-azimuth',
      'salcher-2022',
      'spatialdata-visium',
      'spatialdata-visium_io',
      'spatialdata-mcmicro_io',
      'maynard-2021',
      'jain-2024',
      'sorger-2024-2',
      'sorger-2024-4',
    ],
  } = props;

  const baseUrl = useBaseUrl('/#?dataset=');

  // Collect all unique tags from the subset.
  const allTags = useMemo(() => {
    const tagSet = new Set();
    subset.forEach((key) => {
      (configAttrs[key] || []).forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [subset]);

  const [activeTags, setActiveTags] = useState([]);

  const toggleTag = (tag) => {
    if (tag === null) {
      setActiveTags([]);
      return;
    }
    setActiveTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  // Filter demos by active tags (show only those matching ALL active tags).
  const filteredSubset = useMemo(() => {
    if (activeTags.length === 0) return subset;
    return subset.filter((key) => {
      const attrs = configAttrs[key] || [];
      return activeTags.every(tag => attrs.includes(tag));
    });
  }, [subset, activeTags]);

  return (
    <div className={small ? undefined : styles.examplesPageContainer}>
      {!small && (
        <div className={styles.examplesPageHeader}>
          <h1>Example Visualizations</h1>
          <p>
            Interactive demonstrations of Vitessce across spatial biology,
            multi-omics, and 3D tissue visualization datasets.
          </p>
        </div>
      )}

      {/* Tag filter bar — only on the full examples page */}
      {!small && (
        <div className={styles.filterBar}>
          <button
            type="button"
            className={clsx(
              styles.filterButton,
              { [styles.filterButtonActive]: activeTags.length === 0 },
            )}
            onClick={() => toggleTag(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              type="button"
              className={clsx(
                styles.filterButton,
                { [styles.filterButtonActive]: activeTags.includes(tag) },
              )}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className={clsx(styles.examplesGrid, { [styles.examplesGridSmall]: small })}>
        {filteredSubset.map(key => (
          <ExampleCard
            key={key}
            configKey={key}
            config={configs[key]}
            baseUrl={baseUrl}
            theme={theme}
          />
        ))}
      </div>

      {filteredSubset.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--vit-text-muted)', padding: '2rem' }}>
          No examples match the selected filters.
        </p>
      )}
    </div>
  );
}

export default DemoList;
