/* eslint-disable camelcase */
import { z } from 'zod';
import {
  coordinationScopeName,
  requestInit,
  componentCoordinationScopes,
  componentCoordinationScopesBy,
} from './shared.js';

// Base schemas for previous config versions.
// These do not validate coordinationType, viewType, or fileType-related values;
// only the latest version validates these after merging with plugin schemas.

const nameSchema = z.string();
const publicFlagSchema = z.boolean().optional();
const descriptionSchema = z.string().optional();

export const configSchema0_1_0 = z.object({
  version: z.literal('0.1.0'),
  name: nameSchema,
  public: publicFlagSchema,
  description: descriptionSchema,
  layers: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      fileType: z.string(),
      url: z.string(),
    }),
  ),
  staticLayout: z.array(
    z.object({
      component: z.string(),
      props: z.record(z.any())
        .optional(),
      x: z.number().int(),
      y: z.number().int(),
      w: z.number().int().optional(),
      h: z.number().int().optional(),
    }),
  ),
});

const fileOptionsSchema = z.any();

// Cannot keep extending, so using composition instead.
// const nextVersionSchema = prevVersionSchema.extend(...)
// causes Typescript error after ~15 times.
// Reference: https://github.com/colinhacks/zod/issues/1990
export const coordinationSpaceSchema = z.object({})
  .catchall(z.record(coordinationScopeName, z.any()));

const initStrategySchema = z.enum(['none', 'auto']);

const layoutSchema1_0_0 = z.array(
  z.object({
    component: z.string(),
    props: z.record(z.any())
      .optional(),
    x: z.number().int(),
    y: z.number().int(),
    w: z.number().int().optional(),
    h: z.number().int().optional(),
    coordinationScopes: z.record(z.string())
      .optional(),
  }),
);

const datasetsSchema1_0_0 = z.array(
  z.object({
    uid: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    files: z.array(
      z.object({
        name: z.string().optional(),
        fileType: z.string(),
        url: z.string().optional(),
        options: fileOptionsSchema.optional(),
        requestInit: requestInit.optional(),
      }),
    ),
  }),
);

export const configSchema1_0_0 = z.object({
  version: z.literal('1.0.0'),
  name: nameSchema,
  public: publicFlagSchema,
  description: descriptionSchema,
  datasets: datasetsSchema1_0_0,
  coordinationSpace: coordinationSpaceSchema.optional(),
  layout: layoutSchema1_0_0,
  initStrategy: initStrategySchema,
});

// Only coordination type or behavioral changes.
export const configSchema1_0_1 = configSchema1_0_0.extend({
  version: z.literal('1.0.1'),
});

// Only coordination type or behavioral changes.
export const configSchema1_0_2 = configSchema1_0_0.extend({
  version: z.literal('1.0.2'),
});

// Only coordination type or behavioral changes.
export const configSchema1_0_3 = configSchema1_0_0.extend({
  version: z.literal('1.0.3'),
});

// Only coordination type or behavioral changes.
export const configSchema1_0_4 = configSchema1_0_0.extend({
  version: z.literal('1.0.4'),
});

// Only coordination type or behavioral changes.
export const configSchema1_0_5 = configSchema1_0_0.extend({
  version: z.literal('1.0.5'),
});

// Only coordination type or behavioral changes.
export const configSchema1_0_6 = configSchema1_0_0.extend({
  version: z.literal('1.0.6'),
});

// Only coordination type or behavioral changes.
export const configSchema1_0_7 = configSchema1_0_0.extend({
  version: z.literal('1.0.7'),
});

// Allow implicit per-dataset coordination scope mappings,
// (initially for Polyphony use case).

const polyphonyStyleCoordinationScopes = z.record(z.union([
  z.string(),
  z.array(z.string()),
  z.record(z.string()),
]));

const layoutSchema1_0_8 = z.array(
  z.object({
    component: z.string(),
    props: z.record(z.any())
      .optional(),
    x: z.number().int(),
    y: z.number().int(),
    w: z.number().int().optional(),
    h: z.number().int().optional(),
    // New: can be one of
    // - coordinationType: string
    // - dataset: string[]
    // - coordinationType: { datasetA: string, datasetB: string }
    coordinationScopes: polyphonyStyleCoordinationScopes
      .optional(),
  }),
);

export const configSchema1_0_8 = configSchema1_0_0.extend({
  version: z.literal('1.0.8'),
  layout: layoutSchema1_0_8,
});

// Only coordination type or behavioral changes.
export const configSchema1_0_9 = configSchema1_0_8.extend({
  version: z.literal('1.0.9'),
});

// Allow for each view to have a uid
const layoutSchema1_0_10 = z.array(
  z.object({
    // New: uid property allowed.
    uid: z.string()
      .optional(),
    component: z.string(),
    props: z.record(z.any())
      .optional(),
    x: z.number().int(),
    y: z.number().int(),
    w: z.number().int().optional(),
    h: z.number().int().optional(),
    coordinationScopes: polyphonyStyleCoordinationScopes
      .optional(),
  }),
);

export const configSchema1_0_10 = configSchema1_0_8.extend({
  version: z.literal('1.0.10'),
  layout: layoutSchema1_0_10,
});

// Only coordination type or behavioral changes.
export const configSchema1_0_11 = configSchema1_0_10.extend({
  version: z.literal('1.0.11'),
});

// Only coordination type or behavioral changes.
export const configSchema1_0_12 = configSchema1_0_10.extend({
  version: z.literal('1.0.12'),
});

export const latestFileDefSchema = z.object({
  name: z.string().optional(),
  fileType: z.string(),
  url: z.string().optional(),
  options: fileOptionsSchema.optional(),
  requestInit: requestInit.optional(),
  // New: file def can have coordinationValues.
  coordinationValues: z.record(z.string()).optional(),
});

// Allow file definitions to have coordinationValues.
const datasetsSchema1_0_13 = z.array(
  z.object({
    uid: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    files: z.array(
      latestFileDefSchema,
    ),
  }),
);
export const configSchema1_0_13 = configSchema1_0_10.extend({
  version: z.literal('1.0.13'),
  datasets: datasetsSchema1_0_13,
});

// Only coordination type or behavioral changes.
export const configSchema1_0_14 = configSchema1_0_13.extend({
  version: z.literal('1.0.14'),
});

// Only coordination type or behavioral changes.
export const configSchema1_0_15 = configSchema1_0_13.extend({
  version: z.literal('1.0.15'),
});

export const configSchema1_0_16 = configSchema1_0_13.extend({
  version: z.literal('1.0.16'),
  uid: z.string().optional(),
  layout: z.array(
    z.object({
      uid: z.string()
        .optional(),
      component: z.string(),
      props: z.record(z.any())
        .optional(),
      x: z.number().int(),
      y: z.number().int(),
      w: z.number().int().optional(),
      h: z.number().int().optional(),
      // Updates coordinationScopes and coordinationScopesBy
      coordinationScopes: componentCoordinationScopes
        .optional(),
      coordinationScopesBy: componentCoordinationScopesBy
        .optional(),
    }),
  ),
});
