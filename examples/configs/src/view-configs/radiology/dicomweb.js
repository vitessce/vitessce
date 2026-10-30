function makeDicomWebConfig(name, seriesUrl) {
  return {
    version: '1.0.16',
    name,
    datasets: [
      {
        uid: 'series',
        name,
        files: [{ fileType: 'image.dicomweb', url: seriesUrl }],
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

// Imaging Data Commons (IDC) public DICOMweb proxy. It has a daily per-IP quota.
// It transcodes frames to uncompressed data.
// Reference viewer: https://viewer.imaging.datacommons.cancer.gov/v3/viewer/?StudyInstanceUIDs=1.2.840.113654.2.55.8191733375219125995341921872104648622
const IDC_DICOMWEB = 'https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb';

export const dicomwebNlstCt = makeDicomWebConfig(
  'DICOMweb - NLST chest CT (IDC)',
  `${IDC_DICOMWEB}/studies/1.2.840.113654.2.55.8191733375219125995341921872104648622/series/1.2.840.113654.2.55.217316767140664106406491929674685667044`,
);

// OHIF's public demo DICOMweb server. It stores frames as JPEG-LS and does not transcode.
// Reference viewer: https://viewer.ohif.org/viewer?StudyInstanceUIDs=1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463
const OHIF_DICOMWEB = 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb';

export const dicomwebJpegLsCt = makeDicomWebConfig(
  'DICOMweb - JPEG-LS chest CT (OHIF demo server)',
  `${OHIF_DICOMWEB}/studies/1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463/series/1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561`,
);
