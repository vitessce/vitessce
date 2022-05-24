import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import { DataType } from '../../../src/app/constants';
import { DATA_TYPE_ENTITY_TYPES_MAPPING } from '../../../src/app/constant-relationships';

export default function DataTypesTable() {
  return (
    <table className={styles.dataTypesTable}>
      <thead>
        <tr>
          <th>Data Type</th>
          <th>File Types</th>
          <th><a href={useBaseUrl('/docs/entity-types/')}>Entity Types</a></th>
          <th>Convert from...</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>{DataType.CELLS}</code>
            <br /> Cells, their positions (spatially and for dimensionality-reduction scatterplots),
            their segmentations as polygons, and other per-cell attributes.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#cellsjson')}><code>cells.json</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-cellszarr')}><code>anndata-cells.zarr</code></a></li>
            </ul>
          </td>
          <td>
            {DATA_TYPE_ENTITY_TYPES_MAPPING[DataType.CELLS]
              .map((entityType, i, entityTypes) => (
                <>
                  <code>{entityType}</code>
                  {i < entityTypes.length - 1 ? (<span>,&nbsp;<br /></span>) : null}
                </>
              ))}
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#seurat')}>Seurat</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#snapatac')}>SnapATAC</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>{DataType.MOLECULES}</code>
            <br /> Spatially-resolved molecules such as individual RNA molecules
            measured by FISH assays.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#moleculesjson')}><code>molecules.json</code></a></li>
            </ul>
          </td>
          <td>
            {DATA_TYPE_ENTITY_TYPES_MAPPING[DataType.MOLECULES]
              .map((entityType, i, entityTypes) => (
                <>
                  <code>{entityType}</code>
                  {i < entityTypes.length - 1 ? (<span>,&nbsp;<br /></span>) : null}
                </>
              ))}
          </td>
          <td />
        </tr>
        <tr>
          <td>
            <code>cell-sets</code>
            <br /> Lists or hierarchies of cell sets,
            used to store cell type assignments or automated clustering results.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#cell-setsjson')}><code>cell-sets.json</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-cell-setszarr')}><code>anndata-cell-sets.zarr</code></a></li>
            </ul>
          </td>
          <td>
            {DATA_TYPE_ENTITY_TYPES_MAPPING[DataType.CELL_SETS]
              .map((entityType, i, entityTypes) => (
                <>
                  <code>{entityType}</code>
                  {i < entityTypes.length - 1 ? (<span>,&nbsp;<br /></span>) : null}
                </>
              ))}
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#seurat')}>Seurat</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#snapatac')}>SnapATAC</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>raster</code>
            <br />
            Multi-scale multiplexed imaging data, including OME-TIFF files and OME-NGFF stores.
          </td>
          <td>
            <ul>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#rasterome-zarr')}>
                  <code>raster.ome-zarr</code>
                </a> (OME-NGFF)
              </li>
              <li>
                <a href={useBaseUrl('/docs/data-file-types/#rasterjson')}><code>raster.json</code></a>
                <ul>
                  <li>OME-TIFF</li>
                  <li>Bioformats-Zarr (precursor to OME-NGFF)</li>
                </ul>
              </li>
            </ul>
          </td>
          <td>
            {DATA_TYPE_ENTITY_TYPES_MAPPING[DataType.RASTER]
              .map((entityType, i, entityTypes) => (
                <>
                  <code>{entityType}</code>
                  {i < entityTypes.length - 1 ? (<span>,&nbsp;<br /></span>) : null}
                </>
              ))}
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#proprietary-image-formats')}>Proprietary Formats</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>expression-matrix</code>
            <br /> Gene expression matrices.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#expression-matrixzarr')}><code>expression-matrix.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-expression-matrixzarr')}><code>anndata-expression-matrix.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#clustersjson')}><code>clusters.json</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#genesjson')}><code>genes.json</code></a></li>
            </ul>
          </td>
          <td>
            {DATA_TYPE_ENTITY_TYPES_MAPPING[DataType.EXPRESSION_MATRIX]
              .map((entityType, i, entityTypes) => (
                <>
                  <code>{entityType}</code>
                  {i < entityTypes.length - 1 ? (<span>,&nbsp;<br /></span>) : null}
                </>
              ))}
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#seurat')}>Seurat</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td><code>neighborhoods</code><br /> </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#neighborhoodsjson')}><code>neighborhoods.json</code></a></li>
            </ul>
          </td>
          <td />
          <td />
        </tr>
        <tr>
          <td><code>genomic-profiles</code><br /> Genomic profiles, such as ATAC-seq profiles.</td>
          <td><ul><li><a href={useBaseUrl('/docs/data-file-types/#genomic-profileszarr')}><code>genomic-profiles.zarr</code></a></li></ul></td>
          <td />
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#snapatac')}>SnapATAC</a></li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
