import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export default function DataTypesTable() {
  return (
    <table className={styles.dataTypesTable}>
      <thead>
        <tr><th>Data Type</th><th>File Types</th><th>Convert from...</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>obs</code>
            <br />Observations:
            e.g., cells, their positions (spatially and for dimensionality-reduction scatterplots),
            their segmentations as polygons, and other per-cell attributes.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#cellsjson')}><code>cells.json</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndataobszarr')}><code>anndataObs.zarr</code></a></li>
            </ul>
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
            <code>subObs</code>
            <br />Sub-observations:
            e.g., spatially-resolved molecules such as individual RNA molecules
            measured by FISH assays.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#moleculesjson')}><code>molecules.json</code></a></li>
            </ul>
          </td>
          <td />
        </tr>
        <tr>
          <td>
            <code>obsSets</code>
            <br /> Observation sets:
            e.g., cell sets (lists or hierarchies of cells),
            to represent cell type assignments or clustering results.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#cellsetsjson')}><code>cellSets.json</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndataobssetszarr')}><code>anndataObsSets.zarr</code></a></li>
            </ul>
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
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#proprietary-image-formats')}>Proprietary Formats</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsFeatureMatrix</code>
            <br /> Observation-by-feature matrix:
            e.g., cell-by-gene expression matrix.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#expressionmatrixzarr')}><code>expressionMatrix.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndataobsfeaturematrixzarr')}><code>anndataObsFeatureMatrix.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#expressionmatrixjson')}><code>expressionMatrix.json</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#genesjson')}><code>genes.json</code></a></li>
            </ul>
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
        </tr>
        <tr>
          <td><code>genomicProfiles</code><br /> Genomic profiles, such as ATAC-seq profiles.</td>
          <td><ul><li><a href={useBaseUrl('/docs/data-file-types/#genomicprofileszarr')}><code>genomicProfiles.zarr</code></a></li></ul></td>
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
