import { z } from 'zod';
import { latestConfigSchema } from './previous-config-meta.js';
export declare function configSchemaToVersion<T extends z.ZodTypeAny>(zodSchema: T): string;
export declare const VERSIONED_CONFIG_SCHEMAS: Record<string, z.ZodTypeAny>;
export declare function upgradeAndParse(config: any, onConfigUpgrade?: ((a: any, b: any) => void) | null): z.infer<typeof latestConfigSchema>;
//# sourceMappingURL=view-config-versions.d.ts.map