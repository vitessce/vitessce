import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export default function DataTypesTable() {
  const anndataConvenienceFileType = (
    <li>
      <a href={useBaseUrl('/docs/data-file-types/#anndatazarr')}><code>anndata.zarr</code></a>
    </li>
  );
  const spatialdataConvenienceFileType = (
    <li>
      <a href={useBaseUrl('/docs/data-file-types/#spatialdatazarr')}><code>spatialdata.zarr</code></a>
    </li>
  );
  return (
    <table className={styles.dataTypesTable}>
      <thead>
        <tr><th>Data Type</th><th>File Types</th><th>Convert from...</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>obsEmbedding</code>
            <br /> Per-observation 2D embedding coordinates.
            Typically used to store dimensionality reductions
            performed on cell-by-biomarker expression matrices.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsembeddingcsv')}><code>obsEmbedding.csv</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsembeddinganndatazarr')}><code>obsEmbedding.anndata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsembeddingmudatazarr')}><code>obsEmbedding.mudata.zarr</code></a></li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsPoints</code>
            <br /> Spatially-resolved 2D coordinates without a specified size.
            For example, individual RNA molecule x-y coordinates
            measured by FISH.
            (Supported by <code>spatialBeta</code> view.)
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#obspointscsv')}><code>obsPoints.csv</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obspointsanndatazarr')}><code>obsPoints.anndata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obspointsmudatazarr')}><code>obsPoints.mudata.zarr</code></a></li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsSpots</code>
            <br /> Spatially-resolved 2D coordinates with a specified size.
            For example, spot-based or bead-based spatial transcriptomics such as from 10x Visium.
            (Supported by <code>spatialBeta</code> view.)
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsspotscsv')}><code>obsSpots.csv</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsspotsanndatazarr')}><code>obsSpots.anndata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsspotsmudatazarr')}><code>obsSpots.mudata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsspotsspatialdatazarr')}><code>obsSpots.spatialdata.zarr</code></a></li>
              {anndataConvenienceFileType}
              {spatialdataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsSegmentations</code>
            <br /> Per-observation segmentation polygons or bitmasks.
            For example, cell or organelle segmentations.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssegmentationsome-tiff')}><code>obsSegmentations.ome-tiff</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssegmentationsome-zarr')}><code>obsSegmentations.ome-zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssegmentationsjson')}><code>obsSegmentations.json</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssegmentationsanndatazarr')}><code>obsSegmentations.anndata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssegmentationsmudatazarr')}><code>obsSegmentations.mudata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssegmentationsrasterjson')}><code>obsSegmentations.raster.json</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#labelsspatialdatazarr')}><code>labels.spatialdata.zarr</code></a></li>
              {anndataConvenienceFileType}
              {spatialdataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsLocations</code>
            <br /> 2D coordinates representing
            precise locations corresponding to segmentations.
            For example, cell segmentation centroid coordinates to
            support lasso selection interactions.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#obslocationscsv')}><code>obsLocations.csv</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obslocationsanndatazarr')}><code>obsLocations.anndata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obslocationsmudatazarr')}><code>obsLocations.mudata.zarr</code></a></li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsSets</code>
            <br /> Lists or hierarchies of sets of observations.
            For example, cell type annotations or unsupervised clustering results.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssetsjson')}><code>obsSets.json</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssetscsv')}><code>obsSets.csv</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssetsanndatazarr')}><code>obsSets.anndata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssetsmudatazarr')}><code>obsSets.mudata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obssetsspatialdatazarr')}><code>obsSets.spatialdata.zarr</code></a></li>
              {anndataConvenienceFileType}
              {spatialdataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsLabels</code>
            <br /> Per-observation string labels.
            For example, alternate cell identifiers.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#obslabelscsv')}><code>obsLabels.csv</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obslabelsanndatazarr')}><code>obsLabels.anndata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obslabelsmudatazarr')}><code>obsLabels.mudata.zarr</code></a></li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>image</code>
            <br />
            Multi-scale multiplexed imaging data, including OME-TIFF files and OME-NGFF Zarr stores.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#imageome-zarr')}><code>image.ome-zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#imageome-tiff')}><code>image.ome-tiff</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#imagespatialdatazarr')}><code>image.spatialdata.zarr</code></a></li>
              {spatialdataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#tiff-and-proprietary-image-formats')}>TIFF</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#tiff-and-proprietary-image-formats')}>Proprietary Formats</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>obsFeatureMatrix</code>
            <br /> Observation-by-feature matrix.
            Typically used to store cell-by-gene expression matrices.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsfeaturematrixcsv')}><code>obsFeatureMatrix.csv</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsfeaturematrixanndatazarr')}><code>obsFeatureMatrix.anndata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsfeaturematrixmudatazarr')}><code>obsFeatureMatrix.mudata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#obsfeaturematrixspatialdatazarr')}><code>obsFeatureMatrix.spatialdata.zarr</code></a></li>
              {anndataConvenienceFileType}
              {spatialdataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>featureLabels</code>
            <br /> Per-feature string labels.
            For example, alternate gene identifiers.
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#featurelabelscsv')}><code>featureLabels.csv</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#featurelabelsanndatazarr')}><code>featureLabels.anndata.zarr</code></a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#featurelabelsmudatazarr')}><code>featureLabels.mudata.zarr</code></a></li>
              {anndataConvenienceFileType}
            </ul>
          </td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
              <li><a href={useBaseUrl('/docs/data-file-types/#loom')}>Loom</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td><code>genomic-profiles</code><br /> Genomic profiles, such as ATAC-seq profiles.</td>
          <td><ul><li><a href={useBaseUrl('/docs/data-file-types/#genomic-profileszarr')}><code>genomic-profiles.zarr</code></a></li></ul></td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#snapatac')}>SnapATAC</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <code>sampleEdges</code>
            <br />
            Tuples of (observationId, sampleId) to map observations to samples.
          </td>
          <td><ul><li><a href={useBaseUrl('/docs/data-file-types/#sampleedgesanndatazarr')}><code>sampleEdges.anndata.zarr</code></a></li></ul></td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
            </ul>
          </td>
        </tr>
        <tr>
          <td><code>sampleSets</code><br /> Lists or hierarchies of sets of samples.</td>
          <td><ul><li><a href={useBaseUrl('/docs/data-file-types/#samplesetscsv')}><code>sampleSets.csv</code></a></li></ul></td>
          <td>
            <ul>
              <li><a href={useBaseUrl('/docs/data-file-types/#anndata-as-h5ad')}>AnnData</a></li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
