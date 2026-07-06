import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';

import styles from './styles.module.css';

const DROPDOWN_OPTIONS = {
  technology: 'TECHNOLOGY',
  dataType: 'DATA_TYPE',
};

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

// Commercial technology / instrument per dataset
const configTech = {
  'codeluppi-2018': 'osmFISH',
  'eng-2019': 'seqFISH+',
  'wang-2018': 'MERFISH',
  'spraggins-2020': 'MALDI IMS',
  'neumann-2020': 'MALDI IMS',
  'satija-2020': '10x Chromium',
  'sn-atac-seq-hubmap-2020': 'snATAC-seq',
  'blin-2019': 'Fluorescence microscopy',
  'human-lymph-node-10x-visium': '10x Genomics Visium®',
  'habib-2017': 'DroNc-seq',
  'marshall-2022': 'Slide-seqV2',
  'kuppe-2022': '10x Genomics Visium®',
  'combat-2022': 'CITE-seq',
  'meta-2022-azimuth': 'scRNA-seq',
  'salcher-2022': 'scRNA-seq',
  'spatialdata-visium': '10x Genomics Visium®',
  'spatialdata-visium_io': '10x Genomics Visium®',
  'spatialdata-mcmicro_io': 'MCMICRO (output data)',
  'maynard-2021': '10x Genomics Visium®',
  'jain-2024': '3D microscopy',
  'sorger-2024-2': 'CyCIF',
  'sorger-2024-4': 'CyCIF',
  'sdata-xenium_rep1_io': '10x Genomics Xenium®',
  'spatialdata-visium_hd': '10x Genomics Visium HD®',
  'codex-2023': 'Akoya PhenoCycler® (formerly CODEX®)',
  'sdata-merfish': 'MERFISH',
  'spatialdata-aligned_visium_xenium': '10x Genomics Xenium®',
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
      'sdata-xenium_rep1_io',
      'spatialdata-visium_hd',
      'codex-2023',
      'sdata-merfish',
      'spatialdata-aligned_visium_xenium',
    ],
  } = props;

  const baseUrl = useBaseUrl('/#?dataset=');

 // To select the filter in the dropdown, i.e., technology or dataType
 const [filterBy, setFilterBy] = useState(DROPDOWN_OPTIONS.technology);
 const [activeTags, setActiveTags] = useState([]);
  
 const options = useMemo(() => {
   const set = new Set();
       subset.forEach((key) => {
     if (filterBy === DROPDOWN_OPTIONS.technology) {
       if (configTech[key]) set.add(configTech[key]);
     } else {
       (configAttrs[key] || []).forEach(t => set.add(t));
     }
       });
   return Array.from(set).sort();
 }, [subset, filterBy]);

  const changeAxis = (nextAxis) => {
     setFilterBy(nextAxis);
     setActiveTags([]);
  };

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
      if (filterBy === DROPDOWN_OPTIONS.technology) {
        return activeTags.includes(configTech[key]);
      }
      const attrs = configAttrs[key] || [];
      return activeTags.every(tag => attrs.includes(tag));
    });
  }, [subset, activeTags, filterBy]);

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
          <select
            className={styles.axisSelect}
            value={filterBy}
            onChange={e => changeAxis(e.target.value)}
            aria-label="Filter examples by"
          >
            <option value={DROPDOWN_OPTIONS.technology}>Technology</option>
            <option value={DROPDOWN_OPTIONS.dataType}>Data type</option>
          </select>
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
          {options.map(option => (
            <button
              key={option}
              type="button"
              className={clsx(
                styles.filterButton,
                { [styles.filterButtonActive]: activeTags.includes(option) },
              )}
              onClick={() => toggleTag(option)}
            >
              {option}
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
