import { z } from 'zod';

export const imageLayerObj = z.array(
  z.object({
    channels: z.array(
      z.object({
        color: z.array(z.number())
          .describe(
            'The color to use when rendering this channel under the null colormap.',
          )
          .optional(),
        selection: z.record(z.any())
          .describe(
            'Determines the channel selection, e.g. some Z and time slice.',
          ),
        slider: z.array(z.number())
          .describe('Determines the range for color mapping.')
          .optional(),
        visible: z.boolean()
          .describe(
            'Determines whether this channel of the layer will be rendered in the spatial component.',
          )
          .optional(),
      })
        .strict(),
    ),
    colormap: z.string()
      .nullable(),
    transparentColor: z.array(z.number().describe('One of R G or B (0 - 255).'))
      .length(3)
      .describe('Determines the color to be set to opacity 0')
      .nullable()
      .optional(),
    index: z
      .number()
      .describe(
        'The index of the layer among the array of layers available in the image file.',
      ),
    opacity: z.number(),
    modelMatrix: z.array(z.number())
      .length(16)
      .describe('transformation matrix for this layer')
      .optional(),
    domainType: z.enum(['Full', 'Min/Max'])
      .describe(
        'Determines the extent of the channel slider input element in the layer controller.',
      )
      .optional(),
    resolution: z.number()
      .describe('Resolution of 3D volumetric rendering')
      .optional(),
    xSlice: z.array(z.any())
      .length(2)
      .describe('Slice bounds')
      .nullable()
      .optional(),
    renderingMode: z
      .string()
      .describe('Rendering mode of 3D volumetric rendering')
      .optional(),
    ySlice: z.array(z.any())
      .length(2)
      .describe('Slice bounds')
      .nullable()
      .optional(),
    zSlice: z.array(z.any())
      .length(2)
      .describe('Slice bounds')
      .nullable()
      .optional(),
    type: z.enum(['raster', 'bitmask'])
      .optional(),
    use3d: z.boolean()
      .optional(),
    visible: z
      .boolean()
      .describe(
        'Determines whether this entire layer will be rendered in the spatial component.',
      )
      .optional(),
  })
    .strict()
    .describe(
      'The properties of this object are the rendering settings for the raster layer.',
    ),
);

export const cellsLayerObj = z.object({
  visible: z.boolean(),
  stroked: z.boolean(),
  radius: z.number(),
  opacity: z.number(),
});

export const neighborhoodsLayerObj = z.object({
  visible: z.boolean(),
});

export const moleculesLayerObj = z.object({
  visible: z.boolean(),
  radius: z.number(),
  opacity: z.number(),
});
