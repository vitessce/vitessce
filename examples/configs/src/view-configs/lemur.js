/* eslint-disable max-len */
import {
  VitessceConfig,
  hconcat,
  vconcat,
} from '@vitessce/config';

function generateLemur2023Config() {
  const vc = new VitessceConfig({ schemaVersion: '1.0.16', name: 'Lake et al.' });
  const dataset = vc.addDataset('lake_et_al').addFile({
    fileType: 'anndata.zarr',
    url: 'https://storage.googleapis.com/vitessce-demo-data/scmd-analysis-october-2023/lake_et_al.small.h5ad.zarr',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
      embeddingType: 'DensMAP',
    },
    options: {
      obsFeatureMatrix: {
        path: 'layers/DE',
        // path: 'layers/normalize_pearson_residuals',
        // "path": "layers/counts"
      },
      obsEmbedding: {
        path: 'obsm/X_densmap',
      },
      obsSets: [
        {
          name: 'Cell Type',
          path: 'obs/cell_type',
        },
        {
          name: 'Donor ID',
          path: 'obs/donor_id',
        },
        {
          name: 'Disease',
          path: 'obs/disease',
        },
      ],
      featureLabels: {
        path: 'var/feature_name',
      },
    },
  }).addFile({
    fileType: 'sampleSets.csv',
    url: 'https://storage.googleapis.com/vitessce-demo-data/scmd-analysis-october-2023/20231129_OpenAccessClinicalData.csv',
    options: {
      sampleIndex: 'Participant ID',
      sampleSets: [
        {
          name: 'Tissue Type',
          column: 'Tissue Type',
        },
        {
          name: 'Hypertension',
          column: 'Hypertension',
        },
      ],
    },
    coordinationValues: {
      sampleType: 'sample',
    },
  }).addFile({
    fileType: 'sampleEdges.anndata.zarr',
    url: 'https://storage.googleapis.com/vitessce-demo-data/scmd-analysis-october-2023/lake_et_al.small.h5ad.zarr',
    options: {
      path: 'obs/donor_id',
    },
    coordinationValues: {
      sampleType: 'sample',
      obsType: 'cell',
    },
  })
    .addFile({
      fileType: 'featureStats.anndata.zarr',
      url: 'https://storage.googleapis.com/vitessce-demo-data/scmd-analysis-october-2023/lake_et_al.small.h5ad.zarr',
      options: {
        path: 'uns/diffexp',
      },
      coordinationValues: {
        featureType: 'gene',
        sampleType: 'sample',
      },
    });

  const scatterplot = vc.addView(dataset, 'scatterplot');
  const obsSets = vc.addView(dataset, 'obsSets');
  const obsSetSizes = vc.addView(dataset, 'obsSetSizes');
  const featureList = vc.addView(dataset, 'featureList');
  const volcanoPlot = vc.addView(dataset, 'volcanoPlot');

  vc.linkViews([scatterplot], ['embeddingType'], ['DensMAP']);

  vc.linkViewsByObject([scatterplot, volcanoPlot, featureList], {
    featureSelection: ['ENSG00000169344'],
    obsColorEncoding: 'geneSelection',
    featureValueColormapRange: [0, 1.00],
  }, { meta: false });

  vc.linkViews([volcanoPlot], ['sampleType', 'sampleSetSelection'], ['sample', [
    ['Tissue Type', 'Healthy Reference'],
    ['Tissue Type', 'CKD'],
  ]]);

  vc.layout(hconcat(
    vconcat(
      scatterplot,
      hconcat(
        obsSets,
        obsSetSizes,
      ),
    ),
    vconcat(
      featureList,
      volcanoPlot,
    ),
  ));
  const configJSON = vc.toJSON();
  return configJSON;
}


export const lemur2023 = generateLemur2023Config();
