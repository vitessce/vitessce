/* eslint-disable max-len */
import {
  VitessceConfig,
  hconcat,
  vconcat,
} from '@vitessce/config';

function generateLake2023Config() {
  const vc = new VitessceConfig({ schemaVersion: '1.0.16', name: 'Lake et al.' });
  const dataset = vc.addDataset('lake_et_al').addFile({
    fileType: 'anndata.zarr',
    url: 'https://storage.googleapis.com/vitessce-demo-data/scmd-analysis-october-2023/lake_et_al.2.h5ad.zarr',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
      embeddingType: 'UMAP',
    },
    options: {
      obsFeatureMatrix: {
        // "path": "layers_temp/normalize_pearson_residuals_rechunked",
        path: 'layers/normalize_pearson_residuals',
        // "path": "layers/counts"
      },
      obsEmbedding: {
        path: 'obsm/X_umap',
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
        {
          name: 'Condition',
          path: ['obs/condition.l1', 'obs/condition.l2'],
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
    url: 'https://storage.googleapis.com/vitessce-demo-data/scmd-analysis-october-2023/lake_et_al.2.h5ad.zarr',
    options: {
      path: 'obs/donor_id'
    },
    coordinationValues: {
      sampleType: 'sample',
      obsType: 'cell',
    },
  });

  const scatterplot = vc.addView(dataset, 'scatterplot');
  const obsSets = vc.addView(dataset, 'obsSets');
  const obsSetSizes = vc.addView(dataset, 'obsSetSizes');
  const featureList = vc.addView(dataset, 'featureList');
  const violinPlots = vc.addView(dataset, 'obsSetFeatureValueDistribution');
  const dotPlot = vc.addView(dataset, 'dotPlot');


  vc.linkViews([scatterplot], ['embeddingType'], ['UMAP']);
  vc.linkViews([scatterplot, obsSets, obsSetSizes, featureList, violinPlots, dotPlot], ['sampleType', 'sampleSetSelection'], ['sample', [
    ['Tissue Type', 'Healthy Reference'],
    ['Tissue Type', 'CKD'],
  ]]);

  vc.linkViewsByObject([scatterplot, violinPlots, featureList, dotPlot], {
    featureSelection: ['ENSG00000169344'],
    obsColorEncoding: 'geneSelection',
    featureValueColormapRange: [0, 0.25],
  }, { meta: false });

  vc.layout(hconcat(
    vconcat(
      scatterplot,
      hconcat(
        obsSets,
        obsSetSizes,
      ),
    ),
    vconcat(
      vconcat(featureList, dotPlot),
      violinPlots,
    ),
  ));
  const configJSON = vc.toJSON();
  return configJSON;
}


export const lake2023 = generateLake2023Config();
