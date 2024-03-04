import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';

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
    ],
  } = props;

  const baseUrl = useBaseUrl('/#?dataset=');

  const demos = subset.map(key => ([key, configs[key]]));
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
            {configAttrs[key] ? configAttrs[key].map(attrVal => (
              <span key={`${key}-${attrVal}`} className={clsx(styles.demoGridItemPill, styles[cleanAttr(attrVal)])}>
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
