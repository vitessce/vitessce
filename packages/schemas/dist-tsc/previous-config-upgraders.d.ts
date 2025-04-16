import { z } from 'zod';
import { configSchema0_1_0, configSchema1_0_0, configSchema1_0_1, configSchema1_0_2, configSchema1_0_3, configSchema1_0_4, configSchema1_0_5, configSchema1_0_6, configSchema1_0_7, configSchema1_0_8, configSchema1_0_9, configSchema1_0_10, configSchema1_0_11, configSchema1_0_12, configSchema1_0_13, configSchema1_0_14, configSchema1_0_15, configSchema1_0_16 } from './previous-config-schemas.js';
/**
 * Convert an older view config to a newer view config.
 * @param {object} config A v0.1.0 "legacy" view config.
 * @returns {object} A v1.0.0 "upgraded" view config.
 */
export declare function upgradeFrom0_1_0(config: z.infer<typeof configSchema0_1_0>, datasetUid?: string | null): z.infer<typeof configSchema1_0_0>;
export declare function upgradeFrom1_0_0(config: z.infer<typeof configSchema1_0_0>): z.infer<typeof configSchema1_0_1>;
export declare function upgradeFrom1_0_1(config: z.infer<typeof configSchema1_0_1>): z.infer<typeof configSchema1_0_2>;
export declare function upgradeFrom1_0_2(config: z.infer<typeof configSchema1_0_2>): z.infer<typeof configSchema1_0_3>;
export declare function upgradeFrom1_0_3(config: z.infer<typeof configSchema1_0_3>): z.infer<typeof configSchema1_0_4>;
export declare function upgradeFrom1_0_4(config: z.infer<typeof configSchema1_0_4>): z.infer<typeof configSchema1_0_5>;
export declare function upgradeFrom1_0_5(config: z.infer<typeof configSchema1_0_5>): z.infer<typeof configSchema1_0_6>;
export declare function upgradeFrom1_0_6(config: z.infer<typeof configSchema1_0_6>): z.infer<typeof configSchema1_0_7>;
export declare function upgradeFrom1_0_7(config: z.infer<typeof configSchema1_0_7>): z.infer<typeof configSchema1_0_8>;
export declare function upgradeFrom1_0_8(config: z.infer<typeof configSchema1_0_8>): z.infer<typeof configSchema1_0_9>;
export declare function upgradeFrom1_0_9(config: z.infer<typeof configSchema1_0_9>): z.infer<typeof configSchema1_0_10>;
export declare function upgradeFrom1_0_10(config: z.infer<typeof configSchema1_0_10>): z.infer<typeof configSchema1_0_11>;
export declare function upgradeFrom1_0_11(config: z.infer<typeof configSchema1_0_11>): z.infer<typeof configSchema1_0_12>;
export declare function upgradeFrom1_0_12(config: z.infer<typeof configSchema1_0_12>): z.infer<typeof configSchema1_0_13>;
export declare function upgradeFrom1_0_13(config: z.infer<typeof configSchema1_0_13>): z.infer<typeof configSchema1_0_14>;
export declare function upgradeFrom1_0_14(config: z.infer<typeof configSchema1_0_14>): z.infer<typeof configSchema1_0_15>;
export declare function upgradeFrom1_0_15(config: z.infer<typeof configSchema1_0_15>): z.infer<typeof configSchema1_0_16>;
//# sourceMappingURL=previous-config-upgraders.d.ts.map