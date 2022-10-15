import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export default function DataTypesTable() {
  const anndataConvenienceFileType = (
    <li>
      <a href={useBaseUrl('/docs/data-file-types/#anndatazarr')}>
        <code>anndata.zarr</code>
      </a>{' '}
      (<a href="#joint-file-types">joint</a>)
    </li>
  );
  return (
    <table className={styles.dataTypesTable}>
      <thead>
        <tr>
          <th>Data Type</th>
          <th>File Types</th>
          <th>Convert from...</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>obsEmbedding</code>
            <br /> Per-observation 2D embedding coordinates. Typically used to
            store dimensionality reductions performed on cell-by-biomarker
            expression matrices.
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#obsembeddingcsv')}>
                  <code>obsEmbedding.csv</code>
                </a>
              </li>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#obsembeddinganndatazarr',
                  )}
                >
                  <code>obsEmbedding.anndata.zarr</code>
                </a>
              </li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>
                  AnnData
                </a>
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsLocations</code>
            <br /> Spatially-resolved 2D coordinates. For example, individual
            RNA molecule x-y coordinates measured by FISH, or cell segmentation
            centroid coordinates.
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#obslocationscsv')}>
                  <code>obsLocations.csv</code>
                </a>
              </li>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#obslocationsanndatazarr',
                  )}
                >
                  <code>obsLocations.anndata.zarr</code>
                </a>
              </li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>
                  AnnData
                </a>
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsSets</code>
            <br /> Lists or hierarchies of sets of observations. For example,
            cell type annotations or unsupervised clustering results.
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#obssetsjson')}>
                  <code>obsSets.json</code>
                </a>
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#obssetscsv')}>
                  <code>obsSets.csv</code>
                </a>
              </li>
              <li>
                <a
                  href={useBaseUrl('/docs/data-file-types/#obssetsanndatazarr')}
                >
                  <code>obsSets.anndata.zarr</code>
                </a>
              </li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>
                  AnnData
                </a>
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsLabels</code>
            <br /> Per-observation string labels. For example, alternate cell
            identifiers.
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#obslabelscsv')}>
                  <code>obsLabels.csv</code>
                </a>
              </li>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#obslabelsanndatazarr',
                  )}
                >
                  <code>obsLabels.anndata.zarr</code>
                </a>
              </li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>
                  AnnData
                </a>
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>image</code>
            <br />
            Multi-scale multiplexed imaging data, including OME-TIFF files and
            OME-NGFF Zarr stores.
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#rasterome-zarr')}>
                  <code>image.ome-zarr</code>
                </a>
                <ul>
                  <li>OME-NGFF</li>
                </ul>
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#imagerasterjson')}>
                  <code>image.raster.json</code>
                </a>
                <ul>
                  <li>OME-TIFF</li>
                  <li>Bioformats-Zarr (precursor to OME-NGFF)</li>
                </ul>
              </li>
            </ul>
          </td>
          <td>
            <ul>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#proprietary-image-formats',
                  )}
                >
                  Proprietary Formats
                </a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsFeatureMatrix</code>
            <br /> Observation-by-feature matrix. Typically used to store
            cell-by-gene expression matrices.
          </td>
          <td>
            <ul>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#obsfeaturematrixcsv',
                  )}
                >
                  <code>obsFeatureMatrix.csv</code>
                </a>
              </li>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#obsfeaturematrixanndatazarr',
                  )}
                >
                  <code>obsFeatureMatrix.anndata.zarr</code>
                </a>
              </li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>
                  AnnData
                </a>
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>featureLabels</code>
            <br /> Per-feature string labels. For example, alternate gene
            identifiers.
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#featurelabelscsv')}>
                  <code>featureLabels.csv</code>
                </a>
              </li>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#featurelabelsanndatazarr',
                  )}
                >
                  <code>featureLabels.anndata.zarr</code>
                </a>
              </li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>
                  AnnData
                </a>
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsSegmentations</code>
            <br /> Per-observation segmentation polygons or bitmasks. Typically
            used to store cell or organelle segmentations.
          </td>
          <td>
            <ul>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#obssegmentationsjson',
                  )}
                >
                  <code>obsSegmentations.json</code>
                </a>
              </li>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#obssegmentationsanndatazarr',
                  )}
                >
                  <code>obsSegmentations.anndata.zarr</code>
                </a>
              </li>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#obssegmentationsrasterjson',
                  )}
                >
                  <code>obsSegmentations.raster.json</code>
                </a>
              </li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>
                  AnnData
                </a>
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>genomic-profiles</code>
            <br /> Genomic profiles, such as ATAC-seq profiles.
          </td>
          <td>
            <ul>
              <li>
                <a
                  href={useBaseUrl(
                    '/docs/data-file-types/#genomic-profileszarr',
                  )}
                >
                  <code>genomic-profiles.zarr</code>
                </a>
              </li>
            </ul>
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#snapatac')}>
                  SnapATAC
                </a>
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
