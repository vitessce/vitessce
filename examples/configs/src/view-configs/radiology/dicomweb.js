// Imaging Data Commons (IDC) public DICOMweb proxy. It has a daily per-IP quota.
// Reference viewer: https://viewer.imaging.datacommons.cancer.gov/v3/viewer/?StudyInstanceUIDs=1.2.840.113654.2.55.8191733375219125995341921872104648622
const IDC_DICOMWEB = 'https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb';

const name = 'DICOMweb - NLST chest CT (IDC)';

export const dicomwebNlstCt = {
  version: '1.0.16',
  name,
  datasets: [
    {
      uid: 'nlst-ct',
      name,
      files: [
        {
          fileType: 'image.dicomweb',
          url: `${IDC_DICOMWEB}/studies/1.2.840.113654.2.55.8191733375219125995341921872104648622/series/1.2.840.113654.2.55.217316767140664106406491929674685667044`,
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {},
  layout: [
    {
      component: 'spatialBeta', x: 0, y: 0, w: 8, h: 12,
    },
    {
      component: 'layerControllerBeta', x: 8, y: 0, w: 4, h: 12,
    },
  ],
};
