// Reference viewer: https://niivue.github.io/niivue/ (switch to the radiological convention to compare).
import { makeRadiologyConfig } from '../../utils.js';

export const niftiCtAbdomen = makeRadiologyConfig('NIfTI - abdominal CT', {
  fileType: 'image.nifti',
  url: 'https://niivue.github.io/niivue-demo-images/CT_Abdo.nii.gz',
});
export const niftiMni152 = makeRadiologyConfig('NIfTI - MNI152 template', {
  fileType: 'image.nifti',
  url: 'https://niivue.github.io/niivue-demo-images/mni152.nii.gz',
});
