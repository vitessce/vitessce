/* eslint-disable max-len */
/* eslint-disable camelcase */
import {
  VitessceConfig,
  hconcat,
  vconcat,
} from '@vitessce/config';
import { usePageModeView } from '@vitessce/vit-s';
import Sticky from 'react-sticky-el';
import clsx from 'clsx';

const baseUrl = 'https://data-2.vitessce.io/kpmp-atlas-v2/sn-rna-seq/processed/kpmp-aug-2025.adata.zarr';

function generateKpmpAug2025Config() {
  const vc = new VitessceConfig({ schemaVersion: '1.0.16', name: 'Lake et al.' });
  const dataset = vc.addDataset('lake_et_al').addFile({
    fileType: 'comparisonMetadata.anndata.zarr',
    url: baseUrl,
    options: {
      path: 'uns/comparison_metadata',
    },
    coordinationValues: {
      obsType: 'cell',
      sampleType: 'sample',
    },
    // TODO: remove the below once the biomarkerSelect view is capable of adding them based on the above comparisonMetadata.
  }).addFile({
    fileType: 'comparativeFeatureStats.anndata.zarr',
    url: baseUrl,
    options: {
      metadataPath: 'uns/comparison_metadata',
      indexColumn: 'names',
      pValueColumn: 'pvals_adj',
      foldChangeColumn: 'logfoldchanges',
      // pValueTransformation: 'minuslog10',
      pValueAdjusted: true,
      foldChangeTransformation: 'log2',
    },
    coordinationValues: {
      obsType: 'cell',
      sampleType: 'sample',
      featureType: 'gene',
    },
    // TODO: remove the below once the biomarkerSelect view is capable of adding them based on the above comparisonMetadata.
  }).addFile({
    fileType: 'comparativeObsSetStats.anndata.zarr',
    url: baseUrl,
    options: {
      metadataPath: 'uns/comparison_metadata',
      indexColumn: 'Cell Type',
      interceptExpectedSampleColumn: 'Expected Sample_intercept',
      effectExpectedSampleColumn: 'Expected Sample_effect',
      foldChangeColumn: 'log2-fold change',
      foldChangeTransformation: 'log2',
      isCredibleEffectColumn: 'is_credible_effect',
    },
    coordinationValues: {
      obsType: 'cell',
      sampleType: 'sample',
    },
    // TODO: remove the below once the biomarkerSelect view is capable of adding them based on the above comparisonMetadata.
  })
    .addFile({
      fileType: 'comparativeFeatureSetStats.anndata.zarr',
      url: baseUrl,
      options: {
        metadataPath: 'uns/comparison_metadata',
        indexColumn: 'pathway_name',
        termColumn: 'pathway_term',
        pValueColumn: 'pvals_adj',
        pValueAdjusted: true,
        analysisType: 'pertpy_hypergeometric',
        featureSetLibrary: 'Reactome_2022',
      },
      coordinationValues: {
        obsType: 'cell',
        featureType: 'gene',
        sampleType: 'sample',
      },
    // TODO: remove the below once the biomarkerSelect view is capable of adding them based on the above comparisonMetadata.
    })
    .addFile({
      fileType: 'anndata.zarr',
      url: baseUrl,
      coordinationValues: {
        obsType: 'cell',
        featureType: 'gene',
        featureValueType: 'expression',
        sampleType: 'sample',
      },
      options: {
        obsFeatureMatrix: {
        // "path": "layers/counts",
        // "path": "layers/logcounts",
          path: 'layers/pearson_residuals',
        },
        obsEmbedding: [
          {
            path: 'obsm/X_densmap',
            embeddingType: 'densMAP',
          },
        ],
        obsSets: [
          {
            name: 'Subclass L1',
            path: 'obs/subclass_l1',
          },
          {
            name: 'Subclass L2',
            path: 'obs/subclass_l2',
          },
          {
            name: 'Subclass L3',
            path: 'obs/subclass_l3',
          },
          /* {
            name: 'Donor ID',
            path: 'obs/patient',
          }, */
          /* {
            name: 'Disease',
            path: 'obs/disease',
          },
          {
            name: 'Disease Type',
            path: 'obs/diseasetype',
          },
          {
            name: 'Adjudicated Category',
            path: 'obs/AdjudicatedCategory',
          },
          {
            name: 'Enrollment Category',
            path: 'obs/EnrollmentCategory',
          }, */
        ],
        /* featureLabels: {
        path: 'var/features',
      }, */
        sampleEdges: {
          path: 'obs/specimen',
        },
      },
    })
    .addFile({
      fileType: 'sampleSets.anndata.zarr',
      url: `${baseUrl}/uns/__all__.samples`,
      options: {
        sampleSets: [
          {
            name: 'Adjudicated Category',
            path: 'AdjudicatedCategory',
          },
          {
            name: 'Enrollment Category',
            path: 'EnrollmentCategory',
          },
        ],
      },
      coordinationValues: {
        sampleType: 'sample',
      },
    });

  // const biomarkerSelect = vc.addView(dataset, 'biomarkerSelect', { uid: 'biomarker-select' });
  const comparativeHeading = vc.addView(dataset, 'comparativeHeading', { uid: 'comparative-heading' });
  const dualScatterplot = vc.addView(dataset, 'dualScatterplot', { uid: 'scatterplot' }).setProps({ circleScaleFactor: 0.5 });
  const obsSets = vc.addView(dataset, 'obsSets', { uid: 'cell-sets' });
  const sampleSets = vc.addView(dataset, 'sampleSetPairManager', { uid: 'sample-sets' });
  const obsSetSizes = vc.addView(dataset, 'obsSetSizes');
  const featureList = vc.addView(dataset, 'featureList');
  // const violinPlots = vc.addView(dataset, 'obsSetFeatureValueDistribution', { uid: 'violin-plot' });
  const dotPlot = vc.addView(dataset, 'dotPlot', { uid: 'dot-plot' });
  const treemap = vc.addView(dataset, 'treemap', { uid: 'treemap' });
  const volcanoPlot = vc.addView(dataset, 'volcanoPlot', { uid: 'volcano-plot' });
  const volcanoPlotTable = vc.addView(dataset, 'featureStatsTable', { uid: 'volcano-plot-table' });
  // const obsSetCompositionBarPlot = vc.addView(dataset, 'obsSetCompositionBarPlot', { uid: 'sccoda-plot' });
  // const featureSetEnrichmentBarPlot = vc.addView(dataset, 'featureSetEnrichmentBarPlot', { uid: 'pathways-plot' });

  const [sampleSetScope_caseControl] = vc.addCoordination(
    {
      cType: 'sampleSetSelection',
      cScope: '__comparison__',
      cValue: [['Enrollment Category', 'Healthy Reference'], ['Enrollment Category', 'AKI']],
    },
  );
  const [featureSelectionScope] = vc.addCoordination(
    {
      cType: 'featureSelection',
      cScope: '__comparison__',
      cValue: null,
    },
  );

  vc.linkViewsByObject([dualScatterplot], {
    embeddingType: 'densMAP',
    embeddingContoursVisible: true,
    embeddingPointsVisible: false,
    embeddingObsSetLabelsVisible: true,
  }, { meta: false });


  vc.linkViews([dualScatterplot, obsSets, obsSetSizes, featureList, dotPlot, treemap, volcanoPlot, volcanoPlotTable, comparativeHeading, sampleSets], ['sampleType'], ['sample']);
  vc.linkViewsByObject([dualScatterplot, obsSets, obsSetSizes, featureList, dotPlot, treemap, volcanoPlot, volcanoPlotTable, comparativeHeading, sampleSets], {
    sampleSetSelection: sampleSetScope_caseControl,
    featureSelection: featureSelectionScope,
  }, { meta: false });
  vc.linkViewsByObject([dualScatterplot, featureList, dotPlot], {
    // featureSelection: ['UMOD', 'NPHS2'], // , 'ENSG00000074803', 'ENSG00000164825'],
    obsColorEncoding: 'geneSelection',
    featureValueColormap: 'greys',
    featureValueColormapRange: [0, 0.25],
    featureAggregationStrategy: null,
  }, { meta: false });

  /*
  const [donorSelectionScope, cellTypeSelectionScope] = vc.addCoordination(
    { cType: 'obsSetSelection', cScope: 'donor', cValue: [['Donor ID', '3593'], ['Donor ID', '3535']] },
    { cType: 'obsSetSelection', cScope: 'cellType', cValue: [['Cell Type', 'leukocyte'], ['Cell Type', 'kidney collecting duct intercalated cell']] },
  );
  */

  vc.layout(hconcat(
    vconcat(dualScatterplot, comparativeHeading, obsSets, obsSetSizes),
    vconcat(treemap, dotPlot, sampleSets, featureList),
    volcanoPlotTable,
  ));
  const configJSON = vc.toJSON();
  return configJSON;
}

function PageComponent() {
  const ComparativeHeading = usePageModeView('comparative-heading');
  const CellSets = usePageModeView('cell-sets');
  const SampleSets = usePageModeView('sample-sets');
  const DualScatterplot = usePageModeView('scatterplot');
  const DotPlot = usePageModeView('dot-plot');
  const Treemap = usePageModeView('treemap');
  const VolcanoPlot = usePageModeView('volcano-plot');
  const VolcanoPlotTable = usePageModeView('volcano-plot-table');

  return (
    <>
      <style>{`
      h1, h2, h3, h4, h5, h6 {
        font-family: sans-serif;
      }
      h1 {
        font-weight: normal;
      }
      h2 {
        font-size: 36px;
      }
      h3 {
        font-size: 28px;
      }
      .stuck-comparative-heading {
        background-color: rgba(255, 255, 255, 0.7);
      }
      .stuck-comparative-heading h2 {
        font-size: 16px;
      }
      .stuck-comparative-heading h3 {
        font-size: 14px;
      }
      .view-row {
        width: 100%;
        display: flex;
        flex-direction: row;
      }
      .view-row-short {
        height: 300px;
      }
      .view-row-tall {
        height: 500px;
      }
      .view-row-left {
        width: ${(15 / 85) * 100}%;
        padding: 10px;
      }
      .view-row-left p {
        font-size: 12px;
        margin-top: 20px;
      }
      .view-row-center {
        width: ${(70 / 85) * 100}%;
      }
      .view-row-right > div {
        max-height: 50vh;
      }
      `}
      </style>
      <div style={{ width: '100%' }}>
        <div style={{ width: '70%', marginLeft: '15%' }}>
          <h1>Comparative visualization of single-cell atlas data</h1>
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: '85%' }}>
          <div style={{ width: `${(70 / 85) * 100}%`, marginLeft: `${(15 / 85) * 100}%` }}>
            <Sticky stickyStyle={{ zIndex: 1 }} stickyClassName="stuck-comparative-heading">
              <ComparativeHeading />
            </Sticky>
          </div>
          <div className={clsx('view-row', 'view-row-short')}>
            <div className="view-row-left">
              <p>This view contains a treemap visualization to communicate cell type composition in each of the selected sample groups.</p>
            </div>
            <div className="view-row-center">
              <Treemap />
            </div>
          </div>
          <div className={clsx('view-row', 'view-row-tall')}>
            <div className="view-row-left">
              <p>This view contains contour scatterplots which display the results of a density-preserving dimensionality reduction (Narayan et al. 2021). Contour opacities correspond to the shown percentile thresholds.</p>
            </div>
            <div className="view-row-center">
              <DualScatterplot />
            </div>
          </div>
          <div className={clsx('view-row', 'view-row-tall')}>
            <div className="view-row-left">
              <p>This view displays differential expression test results, performed using the rank_genes_groups function from Scanpy (Wolf et al. 2018) with method &quot;wilcoxon&quot;. <br /><br />The arrows on the bottom left and bottom right denote the direction of the effect. Click a point in the plot to select the corresponding gene. <br /><br />Note that differential expression tests have been run for each cell type separately, so the each gene can appear multiple times (once per cell type). If there are too many points on the plot, cell types can be selected to filter the points.</p>
            </div>
            <div className="view-row-center">
              <VolcanoPlot />
            </div>
          </div>
          <div className={clsx('view-row', 'view-row-tall')}>
            <div className="view-row-left">
              <p>This view displays differential expression test results in tabular form. Click a row in the table to select the corresponding gene.</p>
            </div>
            <div className="view-row-center">
              <VolcanoPlotTable />
            </div>
          </div>
          <div className={clsx('view-row', 'view-row-tall')}>
            <div className="view-row-left">
              <p>This dot plot view displays gene expression values per cell type and sample group for the selected biomarkers.</p>
            </div>
            <div className="view-row-center">
              <DotPlot />
            </div>
          </div>
        </div>
        <div style={{ width: '14%', marginTop: '114px', marginBottom: '100px' }}>
          <Sticky>
            <div className="view-row-right">
              <CellSets />
            </div>
            <div className="view-row-right">
              <SampleSets />
            </div>
          </Sticky>
        </div>

      </div>

    </>
  );
}


export const kpmpAug2025 = generateKpmpAug2025Config();
export const kpmpAug2025Component = PageComponent;
