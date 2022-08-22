import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

const publicConfigs = {
  'codeluppi-2018': ['imaging', 'CSV'],
  'eng-2019': ['spatial', 'CSV'],
  'wang-2018': ['spatial', 'CSV'],
  'spraggins-2020': ['imaging'],
  'neumann-2020': ['multi-modal', 'imaging', 'OME-TIFF'],
  'satija-2020': ['Zarr', 'scalability'],
  'sn-atac-seq-hubmap-2020': [],
  'blin-2019': ['imaging', '3D', 'Zarr', 'OME-NGFF'],
  // 'codeluppi-2018-via-zarr': ['Zarr'],
  'human-lymph-node-10x-visium': ['imaging', 'Zarr', 'AnnData'],
  'habib-2017': ['Zarr', 'AnnData'],
  'marshall-2022': ['spatial', 'Zarr', 'AnnData'],
  'kuppe-2022': ['mosaic', 'imaging', 'Zarr', 'AnnData'],
  'combat-2022': ['multi-modal', 'Zarr', 'AnnData', 'scalability'],
  'meta-2022-azimuth': ['Zarr', 'AnnData', 'scalability'],
};

function cleanAttr(attrVal) {
  if (attrVal.match(/^\d/)) {
    // eslint-disable-next-line no-param-reassign
    attrVal = `_${attrVal}`;
  }
  return attrVal.toLowerCase().replace('-', '');
}

function DemoList(props) {
  const {
    configs,
    small,
  } = props;

  const baseUrl = useBaseUrl('/#?dataset=');

  const demos = Object.keys(publicConfigs).map(key => ([key, configs[key]]));
  return (
    <>
      <p className={clsx(styles.demoDescription, { [styles.demoDescriptionSmall]: small })}>
        The demos compiled here showcase the core features of Vitessce.
      </p>
      <div className={clsx(styles.demoGridContainer, { [styles.demoGridContainerSmall]: small })}>
        {demos.map(([key, d]) => (
          <div key={key} className={styles.demoGridItem}>
            <a href={baseUrl + key} className={styles.demoGridItemLink}>{d.name}</a>
            <p className={styles.demoGridItemDescription}>{d.description}</p>
            {publicConfigs[key] ? publicConfigs[key].map(attrVal => (
              <span className={clsx(styles.demoGridItemPill, styles[cleanAttr(attrVal)])}>
                {attrVal}
              </span>
            )) : null}
          </div>
        ))}
      </div>
    </>
  );
}

export default DemoList;
