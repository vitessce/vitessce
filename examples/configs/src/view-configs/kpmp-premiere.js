/* eslint-disable max-len */
/* eslint-disable camelcase */
import {
  VitessceConfig,
  hconcat,
  vconcat,
} from '@vitessce/config';
import { usePageModeView } from '@vitessce/vit-s';

function generateKpmpPremiereConfig() {
  const vc = new VitessceConfig({ schemaVersion: '1.0.16', name: 'Lake et al.' });
  const dataset = vc.addDataset('lake_et_al').addFile({
    fileType: 'anndata.zarr',
    url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-jan-2025/kpmp_premiere.adata.zarr',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
      sampleType: 'sample',
    },
    options: {
      obsFeatureMatrix: {
        "path": "layers/counts",
        "path": "layers/logcounts",
        //path: 'layers/pearson_residuals',
      },
      obsEmbedding: [
        {
          // TODO: fix the densmap embedding
          path: 'obsm/X_umap',
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
        },
      ],
      /*featureLabels: {
        path: 'var/features',
      },*/
      sampleEdges: {
        path: 'obs/SampleID',
      },
    },
  }).addFile({
    fileType: 'sampleSets.anndata.zarr',
    url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-jan-2025/kpmp_premiere.adata.zarr/uns/__all__.samples',
    options: {
      sampleSets: [
        {
          name: 'Disease Type',
          path: 'diseasetype',
        },
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

  const biomarkerSelect = vc.addView(dataset, 'biomarkerSelect', { uid: 'biomarker-select' }).setProps({
    stratificationOptions: [
      {
        stratificationId: 'aki-vs-hr',
        name: 'Acute kidney injury (AKI) vs. Healthy reference',
        stratificationType: 'sampleSet', // key changed from 'groupType'. value changed from 'clinical'
        sampleSets: [
          ['Disease Type', 'AKI'],
          ['Disease Type', 'Reference'],
        ],
      },
      {
        stratificationId: 'aki-vs-hckd',
        name: 'Acute kidney injury (AKI) vs. Chronic kidney disease attributed to hypertension (H-CKD)',
        stratificationType: 'sampleSet',
        sampleSets: [
          ['Disease Type', 'AKI'],
          ['Disease Type', 'CKD'],
        ],
      },
      {
        stratificationId: 'dckd-vs-hr',
        name: 'Chronic kidney disease attributed to diabetes (D-CKD) vs. Healthy reference',
        stratificationType: 'sampleSet',
        sampleSets: [
          ['Disease Type', 'CKD'],
          ['Disease Type', 'Reference'],
        ],
      },
      /*
      {
        stratificationId: 'dckd-vs-hckd',
        name: 'Chronic kidney disease attributed to diabetes (D-CKD) vs. Chronic kidney disease attributed to hypertension (H-CKD)',
        groupType: 'clinical',
      },
      {
        stratificationId: 'dckd-vs-dkdr',
        name: 'Chronic kidney disease attributed to diabetes (D-CKD) vs. Diabetic kidney disease "resisters"',
        groupType: 'clinical',
      },
      {
        stratificationId: 'sglt2-vs-no-sglt2',
        name: 'Chronic kidney disease attributed to diabetes (D-CKD) with SGLT2 inhibitor vs. D-CKD without SGLT2 inhibitor',
        groupType: 'clinical',
      },
      {
        stratificationId: 'ati-vs-hr',
        name: 'Acute tubular injury vs. Healthy reference',
        groupType: 'clinical',
      },
      {
        stratificationId: 'ain-vs-hr',
        name: 'Acute interstitial injury vs. Healthy reference',
        groupType: 'clinical',
      },
      {
        stratificationId: 'ati-vs-ain',
        name: 'Acute tubular injury vs. Acute interstitial nephritis',
        groupType: 'clinical',
      },
      {
        stratificationId: 'raki-vs-waki',
        name: 'Recovering AKI vs. Worsening AKI',
        groupType: 'clinical',
      },
      {
        stratificationId: 'ifta-vs-non-ifta-presence',
        name: 'Interstitial fibrosis and tubular atrophy (IFTA) vs. non-IFTA',
        groupType: 'structural-presence',
      },
      {
        stratificationId: 'gsg-vs-ngsg-presence',
        name: 'Globally sclerotic glomeruli (GSG) vs. non-GSG',
        groupType: 'structural-presence',
      },
      {
        stratificationId: 'ifta-vs-non-ifta-region',
        name: 'Interstitial fibrosis and tubular atrophy (IFTA) vs. non-IFTA',
        groupType: 'structural-region',
      },
      {
        stratificationId: 'gsg-vs-ngsg-region',
        name: 'Globally sclerotic glomeruli (GSG) vs. non-GSG',
        groupType: 'structural-region',
      },
      */
    ],
  });

  const dualScatterplot = vc.addView(dataset, 'dualScatterplot', { uid: 'scatterplot' });
  const obsSets = vc.addView(dataset, 'obsSets', { uid: 'cell-sets' });
  const obsSetSizes = vc.addView(dataset, 'obsSetSizes');
  const featureList = vc.addView(dataset, 'featureList');
  const violinPlots = vc.addView(dataset, 'obsSetFeatureValueDistribution', { uid: 'violin-plot' });
  const dotPlot = vc.addView(dataset, 'dotPlot', { uid: 'dot-plot' });
  const treemap = vc.addView(dataset, 'treemap', { uid: 'treemap' });

  // TODO: construct coordination scopes for sampleSetSelection with names:
  // - case
  // - control
  // - case-control

  const [sampleSetScope_caseControl] = vc.addCoordination(
    {
      cType: 'sampleSetSelection',
      cScope: 'case-control',
      cValue: [['Disease Type', 'CKD'], ['Disease Type', 'Reference']],
    },
  );

  vc.linkViewsByObject([dualScatterplot], {
    embeddingType: 'densMAP',
    embeddingContoursVisible: true,
    embeddingPointsVisible: false,
  }, { meta: false });

  vc.linkViews([dualScatterplot, obsSets, obsSetSizes, featureList, violinPlots, dotPlot, treemap], ['sampleType'], ['sample']);
  vc.linkViewsByObject([dualScatterplot, obsSets, obsSetSizes, featureList, violinPlots, dotPlot, treemap], {
    sampleSetSelection: sampleSetScope_caseControl,
  }, { meta: false });
  vc.linkViewsByObject([dualScatterplot, violinPlots, featureList, dotPlot], {
    featureSelection: ['UMOD'], // , 'ENSG00000074803', 'ENSG00000164825'],
    obsColorEncoding: 'geneSelection',
    featureValueColormapRange: [0, 0.25],
  }, { meta: false });

  /*
  const [donorSelectionScope, cellTypeSelectionScope] = vc.addCoordination(
    { cType: 'obsSetSelection', cScope: 'donor', cValue: [['Donor ID', '3593'], ['Donor ID', '3535']] },
    { cType: 'obsSetSelection', cScope: 'cellType', cValue: [['Cell Type', 'leukocyte'], ['Cell Type', 'kidney collecting duct intercalated cell']] },
  );
  */

  vc.layout(hconcat(
    vconcat(
      hconcat(dualScatterplot, biomarkerSelect),
      vconcat(
        hconcat(
          obsSets,
          obsSetSizes,
        ),
        hconcat(
          featureList,
          treemap
        ),
      ),
    ),
    vconcat(violinPlots, dotPlot),
  ));
  const configJSON = vc.toJSON();
  return configJSON;
}

function PageComponent() {
  const BiomarkerSelect = usePageModeView('biomarker-select');
  const DualScatterplot = usePageModeView('scatterplot');
  const CellSets = usePageModeView('cell-sets');
  const ViolinPlot = usePageModeView('violin-plot');
  const DotPlot = usePageModeView('dot-plot');
  const Treemap = usePageModeView('treemap');

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
      `}
      </style>
      <div style={{ width: '100%' }}>
        <div style={{ width: '70%', marginLeft: '15%' }}>
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
          <div style={{ width: '100%', height: '300px' }}>
            <Treemap />
          </div>
          <div style={{ width: '100%', height: '500px' }}>
            <DualScatterplot />
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


export const kpmpPremiere = generateKpmpPremiereConfig();
export const kpmpPremiereComponent = PageComponent;
