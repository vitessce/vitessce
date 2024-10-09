/* eslint-disable max-len */
import {
  VitessceConfig,
  hconcat,
  vconcat,
} from '@vitessce/config';
import { usePageModeView } from '@vitessce/vit-s';
import { BiomarkerSelectSubscriber } from '@vitessce/biomarker-select';

function generateLake2023Config() {
  const vc = new VitessceConfig({ schemaVersion: '1.0.16', name: 'Lake et al.' });
  const dataset = vc.addDataset('lake_et_al').addFile({
    fileType: 'anndata.zarr',
    url: 'https://storage.googleapis.com/vitessce-demo-data/scmd-analysis-october-2023/lake_et_al.2.h5ad.zarr',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
      sampleType: 'sample',
    },
    options: {
      obsFeatureMatrix: {
        // "path": "layers_temp/normalize_pearson_residuals_rechunked",
        path: 'layers/normalize_pearson_residuals',
        // "path": "layers/counts"
      },
      obsEmbedding: [
        {
          path: 'obsm/X_densmap',
          embeddingType: 'densMAP',
        },
      ],
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
      sampleEdges: {
        path: 'obs/donor_id',
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
  });

  const biomarkerSelect = vc.addView(dataset, 'biomarkerSelect', { uid: 'biomarker-select' });
  const scatterplot = vc.addView(dataset, 'scatterplot', { uid: 'scatterplot-case' }).setProps({ title: 'CKD' });
  const scatterplot2 = vc.addView(dataset, 'scatterplot', { uid: 'scatterplot-control' }).setProps({ title: 'Healthy Reference' });
  const obsSets = vc.addView(dataset, 'obsSets', { uid: 'cell-sets' });
  const obsSetSizes = vc.addView(dataset, 'obsSetSizes');
  const featureList = vc.addView(dataset, 'featureList');
  const violinPlots = vc.addView(dataset, 'obsSetFeatureValueDistribution', { uid: 'violin-plot' });
  const dotPlot = vc.addView(dataset, 'dotPlot', { uid: 'dot-plot'});


  vc.linkViewsByObject([scatterplot], {
    embeddingType: 'densMAP',
    embeddingContoursVisible: true,
    embeddingPointsVisible: false,
    sampleType: 'sample',
    sampleSetSelection: [['Tissue Type', 'CKD']],
  }, { meta: false });
  vc.linkViewsByObject([scatterplot2], {
    embeddingType: 'densMAP',
    embeddingContoursVisible: true,
    embeddingPointsVisible: false,
    sampleType: 'sample',
    sampleSetSelection: [['Tissue Type', 'Healthy Reference']],
  }, { meta: false });

  vc.linkViews([obsSets, obsSetSizes, featureList, violinPlots, dotPlot], ['sampleType', 'sampleSetSelection'], ['sample', [
    ['Tissue Type', 'CKD'],
    ['Tissue Type', 'Healthy Reference'],
  ]]);
  vc.linkViewsByObject([scatterplot, scatterplot2, violinPlots, featureList, dotPlot], {
    featureSelection: ['ENSG00000169344'], // , 'ENSG00000074803', 'ENSG00000164825'],
    obsColorEncoding: 'geneSelection',
    featureValueColormapRange: [0, 0.25],
  }, { meta: false });
  vc.linkViewsByObject([scatterplot, scatterplot2], {
    embeddingZoom: null,
    embeddingTargetX: null,
    embeddingTargetY: null,
  }, { meta: false });

  vc.layout(hconcat(
    vconcat(
      hconcat(scatterplot2, biomarkerSelect),
      vconcat(
        hconcat(
          obsSets,
          obsSetSizes,
        ),
        featureList,
      ),
    ),
    vconcat(
      scatterplot,
      vconcat(violinPlots, dotPlot),
    ),
  ));
  const configJSON = vc.toJSON();
  return configJSON;
}

function PageComponent() {
  const BiomarkerSelect = usePageModeView('biomarker-select');
  const ScatterplotCase = usePageModeView('scatterplot-case');
  const ScatterplotControl = usePageModeView('scatterplot-control');
  const CellSets = usePageModeView('cell-sets');
  const ViolinPlot = usePageModeView('violin-plot');
  const DotPlot = usePageModeView('dot-plot');

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
      `}</style>
      <div style={{ width: '100%' }}>
        <div style={{ width: '70%', marginLeft: '15%', height: '1200px' }}>
        <h1>Comparative visualization of single-cell atlas data</h1>
          <BiomarkerSelect />
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: '70%', marginLeft: '15%' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '45%' }}><h2>Chronic Kidney Disease</h2></div>
            <div style={{ width: '5%' }}><h2 style={{ textAlign: 'right' }}>vs.&nbsp;</h2></div>
            <div style={{ width: '50%' }}><h2>Healthy Reference</h2></div>
          </div>
          <h3>Cell type-level representations</h3>
          <div style={{ width: '100%', height: '800px', display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '50%' }}>
              <ScatterplotCase />
            </div>
            <div style={{ width: '50%' }}>
              <ScatterplotControl />
            </div>
          </div>
          <div style={{ width: '100%', height: '500px' }}>
            <ViolinPlot />
          </div>
          <div style={{ width: '100%', height: '500px' }}>
            <DotPlot />
          </div>
          <h3>Neighborhood-level representations</h3>
          <h1>TODO</h1>
          <h3>Segmented instance-level representations</h3>
          <h1>TODO</h1>
          <h3>Image-level representations</h3>
          <h1>TODO</h1>
          <h3>Participant-level representations</h3>
          <h1>TODO</h1>
        </div>
        <div style={{ width: '14%', height: '500px', marginTop: '213px' }}>
          <CellSets />
        </div>
      </div>
      
    </>
  );
}


export const lake2023 = generateLake2023Config();
export const lake2023component = PageComponent;
