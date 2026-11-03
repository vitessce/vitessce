// Synthetic brain MRIs from the Synthea Coherent Data Set (The MITRE Corporation, CC BY 4.0).
// Each patient has one multi-frame .dcm file (256 x 256 x 256, 1 mm voxels), taken when a
// silent micro-hemorrhage of the brain was diagnosed. Patient histories are from the
// data set's CSV tables.
// Reference: https://registry.opendata.aws/synthea-coherent-data/
const DICOM_URL = 'https://synthea-open-data.s3.amazonaws.com/coherent/unzipped/dicom';
const ATTRIBUTION = 'Data: Synthea Coherent Data Set, The MITRE Corporation (CC BY 4.0).';

const PATIENTS = {
  meredith: {
    name: 'Meredith572 Legros616',
    url: `${DICOM_URL}/Meredith572_Legros616_fd83348f-f088-3a44-b8cc-faa955eca3a11.2.840.99999999.80134157.865577055769.dcm`,
    description: `Female, age 74 at this MRI (1997), taken when a silent micro-hemorrhage of the brain was diagnosed. She was diagnosed with Alzheimer's disease six years later (2003). Other conditions include type 2 diabetes with neuropathy and retinopathy, and hypertension. ${ATTRIBUTION}`,
  },
  betty: {
    name: 'Betty470 Feeney44',
    url: `${DICOM_URL}/Betty470_Feeney44_af7d5693-35b4-2ea1-fba8-fb43ca2551ed1.2.840.99999999.35693892.1388913518675.dcm`,
    description: `Female, age 74 at this MRI (2014), taken when a silent micro-hemorrhage of the brain was diagnosed. Her record has no Alzheimer's disease or stroke. ${ATTRIBUTION}`,
  },
};

function makeDataset(uid) {
  const { name, url, description } = PATIENTS[uid];
  return {
    uid,
    name,
    description,
    files: [{
      fileType: 'image.dicom',
      // The files have placeholder series descriptions ("UNKNOWN").
      options: { urls: [url], name: `${name.split(' ')[0]} - brain MRI` },
    }],
  };
}

export const syntheaBrainMri = {
  version: '1.0.16',
  name: 'Synthea - brain MRI',
  description: PATIENTS.meredith.description,
  datasets: [makeDataset('meredith')],
  initStrategy: 'auto',
  coordinationSpace: {},
  layout: [
    {
      component: 'spatialBeta', x: 0, y: 0, w: 8, h: 12,
    },
    {
      component: 'description', x: 8, y: 0, w: 4, h: 3,
    },
    {
      component: 'layerControllerBeta', x: 8, y: 3, w: 4, h: 9,
    },
  ],
};

// Two patients side by side. The slice, camera, and 2D/3D mode are linked.
// They are linked with a meta-coordination scope, which takes precedence over
// the values that the image loaders initialize for each view (such as spatialTargetZ).
const LINKED = { metaCoordinationScopes: ['linked'] };

export const syntheaBrainMriComparison = {
  version: '1.0.16',
  name: 'Synthea - brain MRI comparison',
  description: 'Brain MRIs of two patients, taken when a silent micro-hemorrhage of the brain was diagnosed. One was later diagnosed with Alzheimer\'s disease.',
  datasets: [makeDataset('meredith'), makeDataset('betty')],
  initStrategy: 'auto',
  coordinationSpace: {
    dataset: { A: 'meredith', B: 'betty' },
    metaCoordinationScopes: {
      linked: {
        spatialZoom: 'shared',
        spatialTargetX: 'shared',
        spatialTargetY: 'shared',
        spatialTargetZ: 'shared',
        spatialRenderingMode: 'shared',
      },
    },
    spatialZoom: { shared: null },
    spatialTargetX: { shared: null },
    spatialTargetY: { shared: null },
    // The middle slice.
    spatialTargetZ: { shared: 128 },
    spatialRenderingMode: { shared: '2D' },
  },
  layout: ['A', 'B'].flatMap((dataset, i) => [
    {
      component: 'spatialBeta',
      coordinationScopes: { dataset, ...LINKED },
      x: 6 * i,
      y: 0,
      w: 6,
      h: 8,
    },
    {
      component: 'description',
      coordinationScopes: { dataset },
      x: 6 * i,
      y: 8,
      w: 3,
      h: 4,
    },
    {
      component: 'layerControllerBeta',
      coordinationScopes: { dataset, ...LINKED },
      x: 6 * i + 3,
      y: 8,
      w: 3,
      h: 4,
    },
  ]),
};
