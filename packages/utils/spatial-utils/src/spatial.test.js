import { describe, it, expect } from 'vitest';
import {
  coordinateTransformationsToMatrix,
  normalizeCoordinateTransformations,
  getSwapAxesMatrix,
  coordinateTransformationsToMatrixForSpatialData,
} from './spatial.js';

const defaultAxes = [
  { type: 'time', name: 't' },
  { type: 'channel', name: 'c' },
  { type: 'space', name: 'z' },
  { type: 'space', name: 'y' },
  { type: 'space', name: 'x' },
];

describe('Spatial.js', () => {
  describe('coordinateTransformationsToMatrix', () => {
    it('returns an Array instance', () => {
      const transformations = [
        {
          type: 'translation',
          translation: [0, 0, 0, 1, 1],
        },
        {
          type: 'scale',
          scale: [1, 1, 0.5, 0.5, 0.5],
        },
      ];
      expect(coordinateTransformationsToMatrix(transformations, defaultAxes)).toEqual([
        0.5, 0, 0, 0,
        0, 0.5, 0, 0,
        0, 0, 0.5, 0,
        0.5, 0.5, 0, 1,
      ]);
    });
    it('returns Identity matrix when coordinateTransformations is null', () => {
      expect(coordinateTransformationsToMatrix(null, defaultAxes)).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    });

    it('swap axes works for 2D', () => {
      const inputAxes = ['x', 'y'];
      const outputAxes = ['y', 'x'];
      const swapMatrix = getSwapAxesMatrix(inputAxes, outputAxes);
      expect(swapMatrix.flat()).toEqual([
        0, 1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    });
    it('swap axes works for 3D', () => {
      const inputAxes = ['x', 'y', 'z'];
      const outputAxes = ['z', 'y', 'x'];
      const swapMatrix = getSwapAxesMatrix(inputAxes, outputAxes);
      expect(swapMatrix.flat()).toEqual([
        0, 0, 1, 0,
        0, 1, 0, 0,
        1, 0, 0, 0,
        0, 0, 0, 1,
      ]);
    });
    it('swap axes works for 3D, different order', () => {
      const inputAxes = ['x', 'z', 'y'];
      const outputAxes = ['x', 'y', 'z'];
      const swapMatrix = getSwapAxesMatrix(inputAxes, outputAxes);
      expect(swapMatrix.flat()).toEqual([
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 1, 0, 0,
        0, 0, 0, 1,
      ]);
    });

    it('supports 3D affine transformation, for coordinate system with C axis', () => {
      const coordinateTransformations = [
        { type: 'scale', scale: [1, 1, 1, 1] },
        {
          type: 'affine',
          affine: [
            [1, 0, 0, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 13.76, 0, 0, -13.76],
          ],
          input: {
            name: 'czyx',
            axes: [
              { type: 'channel', name: 'c' },
              { type: 'space', name: 'x' },
              { type: 'space', name: 'y' },
              { type: 'space', name: 'z' },
            ],
          },
          output: {
            name: 'global',
            axes: [
              // Notice: swap-axes (CXYZ to CZYX).
              { type: 'channel', name: 'c' },
              { type: 'space', name: 'z' },
              { type: 'space', name: 'y' },
              { type: 'space', name: 'x' },
            ],
          },
        },
      ];
      const axes = [
        { type: 'channel', name: 'c' },
        { type: 'space', name: 'x' },
        { type: 'space', name: 'y' },
        { type: 'space', name: 'z' },
      ];
      expect(coordinateTransformationsToMatrix(coordinateTransformations, axes)).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 13.76, -13.76, // scale in Z by 13.76; translate in Z by -13.76 after scaling.
        0, 0, 0, 1,
      ]);
    });
    it('supports 3D affine transformation, for coordinate system without C axis', () => {
      const coordinateTransformations = [
        { type: 'scale', scale: [1, 1, 1] },
        {
          type: 'affine',
          affine: [
            [0, 0, 1, 0],
            [0, 1, 0, 0],
            [13.76, 0, 0, -13.76],
          ],
          input: {
            name: 'zyx',
            axes: [
              { type: 'space', name: 'z' },
              { type: 'space', name: 'y' },
              { type: 'space', name: 'x' },
            ],
          },
          output: {
            name: 'global',
            axes: [
              // Notice: swap-axes (ZYX to XYZ).
              { type: 'space', name: 'x' },
              { type: 'space', name: 'y' },
              { type: 'space', name: 'z' },
            ],
          },
        },
      ];
      const axes = [
        { type: 'space', name: 'z' },
        { type: 'space', name: 'y' },
        { type: 'space', name: 'x' },
      ];
      expect(coordinateTransformationsToMatrix(coordinateTransformations, axes)).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 13.76, -13.76, // scale in Z by 13.76; translate in Z by -13.76 after scaling.
        0, 0, 0, 1,
      ]);
    });
  });
  describe('normalizeCoordinateTransformations', () => {
    it('does nothing for OME-NGFF v0.4 input', () => {
      const datasets = [
        {
          coordinateTransformations: [
            {
              scale: [
                1,
                0.5002025531914894,
                0.3603981534640209,
                0.3603981534640209,
              ],
              type: 'scale',
            },
          ],
          path: '0',
        },
        {
          coordinateTransformations: [
            {
              scale: [
                1,
                0.5002025531914894,
                0.7207963069280418,
                0.7207963069280418,
              ],
              type: 'scale',
            },
          ],
          path: '1',
        },
        {
          coordinateTransformations: [
            {
              scale: [
                1,
                0.5002025531914894,
                1.4415926138560835,
                1.4415926138560835,
              ],
              type: 'scale',
            },
          ],
          path: '2',
        },
      ];
      expect(normalizeCoordinateTransformations(undefined, datasets)).toEqual([
        // Here, we expect only the first dataset to be used.
        // However, we should eventually support transforms
        // specified for each dataset individually,
        // since there could in theory be irregular ways of downsampling.
        {
          scale: [
            1,
            0.5002025531914894,
            0.3603981534640209,
            0.3603981534640209,
          ],
          type: 'scale',
        },
      ]);
    });
    it('transforms SpatialData input', () => {
      const newCoordinateTransformations = [
        {
          input: {
            axes: [
              {
                name: 'c',
                type: 'channel',
              },
              {
                name: 'y',
                type: 'space',
                unit: 'unit',
              },
              {
                name: 'x',
                type: 'space',
                unit: 'unit',
              },
            ],
            name: 'cyx',
          },
          output: {
            axes: [
              {
                name: 'c',
                type: 'channel',
              },
              {
                name: 'y',
                type: 'space',
                unit: 'unit',
              },
              {
                name: 'x',
                type: 'space',
                unit: 'unit',
              },
            ],
            name: 'ST8059048',
          },
          scale: [
            1.0,
            8.670500183814605,
            8.670500183814605,
          ],
          type: 'scale',
        },
      ];
      const datasets = [
        {
          coordinateTransformations: [
            {
              scale: [
                1.0,
                1.0,
                1.0,
              ],
              type: 'scale',
            },
          ],
          path: '0',
        },
      ];
      expect(normalizeCoordinateTransformations(newCoordinateTransformations, datasets)).toEqual([
        // Here, we expect only the first dataset to be used.
        // However, we should eventually support transforms
        // specified for each dataset individually,
        // since there could in theory be irregular ways of downsampling.
        {
          scale: [
            1.0,
            1.0,
            1.0,
          ],
          type: 'scale',
        },
        // We expect the dataset transform to be prepended
        // to the newCoordinateTransformations items.
        // We do not check the input/output coordinate systems, but we should eventually allow
        // the user to specify this somehow and use that information to filter which transforms
        // are included here.
        {
          input: {
            axes: [
              {
                name: 'c',
                type: 'channel',
              },
              {
                name: 'y',
                type: 'space',
                unit: 'unit',
              },
              {
                name: 'x',
                type: 'space',
                unit: 'unit',
              },
            ],
            name: 'cyx',
          },
          output: {
            axes: [
              {
                name: 'c',
                type: 'channel',
              },
              {
                name: 'y',
                type: 'space',
                unit: 'unit',
              },
              {
                name: 'x',
                type: 'space',
                unit: 'unit',
              },
            ],
            name: 'ST8059048',
          },
          scale: [
            1.0,
            8.670500183814605,
            8.670500183814605,
          ],
          type: 'scale',
        },
      ]);
    });
  });
  describe('coordinateTransformationsToMatrixForSpatialData', () => {
    it('supports transformations from visium_hd_3.0.0_io.zip labels/rasterized_016um element', () => {
      const zattrs = {
        'image-label': {
          version: '0.4-dev-spatialdata',
        },
        multiscales: [
          {
            axes: [
              {
                name: 'y',
                type: 'space',
              },
              {
                name: 'x',
                type: 'space',
              },
            ],
            coordinateTransformations: [
              {
                input: {
                  axes: [
                    {
                      name: 'y',
                      type: 'space',
                      unit: 'unit',
                    },
                    {
                      name: 'x',
                      type: 'space',
                      unit: 'unit',
                    },
                  ],
                  name: 'yx',
                },
                output: {
                  axes: [
                    {
                      name: 'x',
                      type: 'space',
                      unit: 'unit',
                    },
                    {
                      name: 'y',
                      type: 'space',
                      unit: 'unit',
                    },
                  ],
                  name: 'Visium_HD_Mouse_Small_Intestine',
                },
                transformations: [
                  {
                    input: {
                      axes: [
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'yx',
                    },
                    output: {
                      axes: [
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'global',
                    },
                    transformations: [
                      {
                        affine: [
                          [
                            -0.38,
                            58.43,
                            257.07,
                          ],
                          [
                            -58.42,
                            -0.38,
                            24102.79,
                          ],
                        ],
                        input: {
                          axes: [
                            {
                              name: 'y',
                              type: 'space',
                              unit: 'unit',
                            },
                            {
                              name: 'x',
                              type: 'space',
                              unit: 'unit',
                            },
                          ],
                          name: 'yx',
                        },
                        output: {
                          axes: [
                            {
                              name: 'x',
                              type: 'space',
                              unit: 'unit',
                            },
                            {
                              name: 'y',
                              type: 'space',
                              unit: 'unit',
                            },
                          ],
                          name: 'global',
                        },
                        type: 'affine',
                      },
                    ],
                    type: 'sequence',
                  },
                  {
                    input: {
                      axes: [
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'xy',
                    },
                    output: {
                      axes: [
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'global',
                    },
                    type: 'identity',
                  },
                ],
                type: 'sequence',
              },
              {
                input: {
                  axes: [
                    {
                      name: 'y',
                      type: 'space',
                      unit: 'unit',
                    },
                    {
                      name: 'x',
                      type: 'space',
                      unit: 'unit',
                    },
                  ],
                  name: 'yx',
                },
                output: {
                  axes: [
                    {
                      name: 'x',
                      type: 'space',
                      unit: 'unit',
                    },
                    {
                      name: 'y',
                      type: 'space',
                      unit: 'unit',
                    },
                  ],
                  name: 'Visium_HD_Mouse_Small_Intestine_downscaled_hires',
                },
                transformations: [
                  {
                    input: {
                      axes: [
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'yx',
                    },
                    output: {
                      axes: [
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'global',
                    },
                    transformations: [
                      {
                        affine: [
                          [
                            -0.38,
                            58.43,
                            257.07,
                          ],
                          [
                            -58.42,
                            -0.38,
                            24102.79,
                          ],
                        ],
                        input: {
                          axes: [
                            {
                              name: 'y',
                              type: 'space',
                              unit: 'unit',
                            },
                            {
                              name: 'x',
                              type: 'space',
                              unit: 'unit',
                            },
                          ],
                          name: 'yx',
                        },
                        output: {
                          axes: [
                            {
                              name: 'x',
                              type: 'space',
                              unit: 'unit',
                            },
                            {
                              name: 'y',
                              type: 'space',
                              unit: 'unit',
                            },
                          ],
                          name: 'global',
                        },
                        type: 'affine',
                      },
                    ],
                    type: 'sequence',
                  },
                  {
                    input: {
                      axes: [
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'xy',
                    },
                    output: {
                      axes: [
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'global',
                    },
                    scale: [
                      0.25,
                      0.25,
                    ],
                    type: 'scale',
                  },
                ],
                type: 'sequence',
              },
              {
                input: {
                  axes: [
                    {
                      name: 'y',
                      type: 'space',
                      unit: 'unit',
                    },
                    {
                      name: 'x',
                      type: 'space',
                      unit: 'unit',
                    },
                  ],
                  name: 'yx',
                },
                output: {
                  axes: [
                    {
                      name: 'x',
                      type: 'space',
                      unit: 'unit',
                    },
                    {
                      name: 'y',
                      type: 'space',
                      unit: 'unit',
                    },
                  ],
                  name: 'Visium_HD_Mouse_Small_Intestine_downscaled_lowres',
                },
                transformations: [
                  {
                    input: {
                      axes: [
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'yx',
                    },
                    output: {
                      axes: [
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'global',
                    },
                    transformations: [
                      {
                        affine: [
                          [
                            -0.38,
                            58.43,
                            257.07,
                          ],
                          [
                            -58.42,
                            -0.38,
                            24102.79,
                          ],
                        ],
                        input: {
                          axes: [
                            {
                              name: 'y',
                              type: 'space',
                              unit: 'unit',
                            },
                            {
                              name: 'x',
                              type: 'space',
                              unit: 'unit',
                            },
                          ],
                          name: 'yx',
                        },
                        output: {
                          axes: [
                            {
                              name: 'x',
                              type: 'space',
                              unit: 'unit',
                            },
                            {
                              name: 'y',
                              type: 'space',
                              unit: 'unit',
                            },
                          ],
                          name: 'global',
                        },
                        type: 'affine',
                      },
                    ],
                    type: 'sequence',
                  },
                  {
                    input: {
                      axes: [
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'xy',
                    },
                    output: {
                      axes: [
                        {
                          name: 'x',
                          type: 'space',
                          unit: 'unit',
                        },
                        {
                          name: 'y',
                          type: 'space',
                          unit: 'unit',
                        },
                      ],
                      name: 'global',
                    },
                    scale: [
                      0.025,
                      0.025,
                    ],
                    type: 'scale',
                  },
                ],
                type: 'sequence',
              },
            ],
            datasets: [
              {
                coordinateTransformations: [
                  {
                    scale: [
                      1.0,
                      1.0,
                    ],
                    type: 'scale',
                  },
                ],
                path: '0',
              },
            ],
            name: 'rasterized_016um',
            version: '0.4-dev-spatialdata',
          },
        ],
        spatialdata_attrs: {
          version: '0.2',
        },
      };
      const firstMultiscales = zattrs.multiscales[0];
      const targetCoordinateSystem = 'Visium_HD_Mouse_Small_Intestine';
      const matrix = coordinateTransformationsToMatrixForSpatialData(
        firstMultiscales,
        targetCoordinateSystem,
      );
      expect(matrix).toEqual([
        58.43, -0.38, 0, 0,
        -0.38, -58.42, 0, 0,
        0, 0, 1, 0,
        257.07, 24102.79, 0, 1,
      ]);
    });
  });
});
