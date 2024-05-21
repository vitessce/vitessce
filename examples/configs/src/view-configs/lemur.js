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
        embeddingType: 'UMAP',
      },
      options: {
        obsFeatureMatrix: {
          "path": "layers/DE",
          //path: 'layers/normalize_pearson_residuals',
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
      fileType: 'featureStats.anndata.zarr',
      url: 'https://storage.googleapis.com/vitessce-demo-data/scmd-analysis-october-2023/lake_et_al.small.h5ad.zarr',
      options: {
        path: 'uns/diffexp',
      },
    });
  
    const scatterplot = vc.addView(dataset, 'scatterplot');
    const obsSets = vc.addView(dataset, 'obsSets');
    const obsSetSizes = vc.addView(dataset, 'obsSetSizes');
    const featureList = vc.addView(dataset, 'featureList');
    const volcanoPlot = vc.addView(dataset, 'volcanoPlot');
  
    vc.linkViews([scatterplot], ['embeddingType'], ['UMAP']);
  
    vc.linkViewsByObject([scatterplot, volcanoPlot, featureList], {
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
        featureList,
        volcanoPlot,
      ),
    ));
    const configJSON = vc.toJSON();
    return configJSON;
  }
  
  
  export const lemur2023 = generateLemur2023Config();
  