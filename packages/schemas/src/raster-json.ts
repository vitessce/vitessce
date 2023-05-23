import { z } from 'zod';
import { requestInit } from './shared.js';

const image = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
  metadata: z.object({
    dimensions: z.array(z.object({
      field: z.string(),
      type: z.enum(['quantitative', 'nominal', 'ordinal', 'temporal']),
      values: z.array(z.string()).nullable(),
    })).optional(),
    isPyramid: z.boolean().optional(),
    transform: z.union([
      z.object({
        scale: z.number(),
        translate: z.object({
          y: z.number(),
          x: z.number(),
        }),
      }),
      z.object({
        matrix: z.array(z.number()).length(16),
      }),
    ]).optional(),
    isBitmask: z.boolean().optional(),
    omeTiffOffsetsUrl: z.string().optional(),
  }).optional(),
  requestInit: requestInit.optional(),
});

export const rasterJsonSchema = z.object({
  schemaVersion: z.literal('0.0.2'),
  usePhysicalSizeScaling: z.boolean().optional(),
  renderLayers: z.array(z.string()).optional(),
  images: z.array(image),
});
