/* eslint-disable */

const blinName = 'HuBMAP OBJ example';
const blinDescription = '';
export const hubmapObj2022 = {
  version: '1.0.6',
  name: blinName,
  description: blinDescription,
  public: true,
  datasets: [
    {
      uid: 'hubmap-obj-2022',
      name: 'HuBMAP OBJ file',
      files: [
        /*{
          type: 'cells',
          fileType: 'cells.obj',
          url: 'http://localhost:8000/hulls.obj',
        },*/
        {
          type: 'cells',
          fileType: 'cells.glb',
          url: 'http://localhost:8000/cubes.glb',
        },
      ],
    },
  ],
  initStrategy: 'auto',
  layout: [
    {
      component: 'glb',
      x: 0,
      y: 0,
      w: 8,
      h: 12,
    },
    {
      component: 'status',
      x: 8,
      y: 9,
      w: 4,
      h: 3,
    },
  ],
};
