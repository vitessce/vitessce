import {
  configSchema0_1_0,
  configSchema1_0_0,
  configSchema1_0_1,
  configSchema1_0_2,
  configSchema1_0_3,
  configSchema1_0_4,
  configSchema1_0_5,
  configSchema1_0_6,
  configSchema1_0_7,
  configSchema1_0_8,
  configSchema1_0_9,
  configSchema1_0_10,
  configSchema1_0_11,
  configSchema1_0_12,
  configSchema1_0_13,
  configSchema1_0_14,
  configSchema1_0_15,
  configSchema1_0_16,
} from './previous-config-schemas.js';

export type AnyVersionConfig =
  z.infer<typeof configSchema0_1_0> |
  z.infer<typeof configSchema1_0_0> |
  z.infer<typeof configSchema1_0_1> |
  z.infer<typeof configSchema1_0_2> |
  z.infer<typeof configSchema1_0_3> |
  z.infer<typeof configSchema1_0_4> |
  z.infer<typeof configSchema1_0_5> |
  z.infer<typeof configSchema1_0_6> |
  z.infer<typeof configSchema1_0_7> |
  z.infer<typeof configSchema1_0_8> |
  z.infer<typeof configSchema1_0_9> |
  z.infer<typeof configSchema1_0_10> |
  z.infer<typeof configSchema1_0_11> |
  z.infer<typeof configSchema1_0_12> |
  z.infer<typeof configSchema1_0_13> |
  z.infer<typeof configSchema1_0_14> |
  z.infer<typeof configSchema1_0_15> |
  z.infer<typeof configSchema1_0_16>;

export type UpgradeFunction = (config: any) => AnyVersionConfig;
