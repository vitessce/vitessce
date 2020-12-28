import { urlPrefix } from '../utils';

const vanderbiltDescription = 'High bit depth (uint16) multiplex immunofluorescence images of the kidney by the BIOmolecular Multimodal Imaging Center (BIOMIC) at Vanderbilt University';
const vanderbiltBase = {
  description: vanderbiltDescription,
  layers: [
    {
      name: 'raster',
      type: 'RASTER',
      fileType: 'raster.json',
      url: `${urlPrefix}/spraggins/spraggins.raster.json`,
    },
  ],
};

export const spraggins2020 = {
  ...vanderbiltBase,
  version: '0.1.0',
  name: 'Spraggins',
  public: true,
  staticLayout: [
    {
      component: 'spatial',
      props: {
        view: {
          zoom: -6.5,
          target: [20000, 20000, 0],
        },
      },
      x: 0,
      y: 0,
      w: 9,
      h: 2,
    },
    {
      component: 'layerController',
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
  ],
};
