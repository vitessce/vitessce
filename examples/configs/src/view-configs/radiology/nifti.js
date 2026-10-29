// Reference viewer: https://niivue.github.io/niivue/ (switch to the radiological convention to compare).
function generateNiftiConfig(name, url) {
  return {
    version: '1.0.16',
    name,
    datasets: [
      {
        uid: 'volume',
        name,
        files: [{ fileType: 'image.nifti', url }],
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
}

export const niftiCtAbdomen = generateNiftiConfig(
  'NIfTI - abdominal CT',
  'https://niivue.github.io/niivue-demo-images/CT_Abdo.nii.gz',
);
export const niftiMni152 = generateNiftiConfig(
  'NIfTI - MNI152 template',
  'https://niivue.github.io/niivue-demo-images/mni152.nii.gz',
);
