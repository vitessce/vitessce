import { z } from 'zod';
import { configSchema0_1_0, configSchema1_0_0, configSchema1_0_1, configSchema1_0_2, configSchema1_0_3, configSchema1_0_4, configSchema1_0_5, configSchema1_0_6, configSchema1_0_7, configSchema1_0_8, configSchema1_0_9, configSchema1_0_10, configSchema1_0_11, configSchema1_0_12, configSchema1_0_13, configSchema1_0_14, configSchema1_0_15, configSchema1_0_16 } from './previous-config-schemas.js';
export declare const latestConfigSchema: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    version: z.ZodLiteral<"1.0.0">;
    name: z.ZodString;
    public: z.ZodOptional<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    datasets: z.ZodArray<z.ZodObject<{
        uid: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        files: z.ZodArray<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            fileType: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodAny>;
            requestInit: z.ZodOptional<z.ZodObject<{
                method: z.ZodOptional<z.ZodString>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                body: z.ZodOptional<z.ZodString>;
                mode: z.ZodOptional<z.ZodString>;
                credentials: z.ZodOptional<z.ZodString>;
                cache: z.ZodOptional<z.ZodString>;
                redirect: z.ZodOptional<z.ZodString>;
                referrer: z.ZodOptional<z.ZodString>;
                integrity: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            }, {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
        }, {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        uid: string;
        files: {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
        }[];
        name?: string | undefined;
        description?: string | undefined;
    }, {
        uid: string;
        files: {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
        }[];
        name?: string | undefined;
        description?: string | undefined;
    }>, "many">;
    coordinationSpace: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodRecord<z.ZodString, z.ZodAny>, z.objectOutputType<{}, z.ZodRecord<z.ZodString, z.ZodAny>, "strip">, z.objectInputType<{}, z.ZodRecord<z.ZodString, z.ZodAny>, "strip">>>;
    layout: z.ZodArray<z.ZodObject<{
        component: z.ZodString;
        props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
        coordinationScopes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string> | undefined;
    }, {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string> | undefined;
    }>, "many">;
    initStrategy: z.ZodEnum<["none", "auto"]>;
}, {
    version: z.ZodLiteral<"1.0.8">;
    layout: z.ZodArray<z.ZodObject<{
        component: z.ZodString;
        props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
        coordinationScopes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodRecord<z.ZodString, z.ZodString>]>>>;
    }, "strip", z.ZodTypeAny, {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[] | Record<string, string>> | undefined;
    }, {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[] | Record<string, string>> | undefined;
    }>, "many">;
}>, {
    version: z.ZodLiteral<"1.0.10">;
    layout: z.ZodArray<z.ZodObject<{
        uid: z.ZodOptional<z.ZodString>;
        component: z.ZodString;
        props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
        coordinationScopes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodRecord<z.ZodString, z.ZodString>]>>>;
    }, "strip", z.ZodTypeAny, {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[] | Record<string, string>> | undefined;
        uid?: string | undefined;
    }, {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[] | Record<string, string>> | undefined;
        uid?: string | undefined;
    }>, "many">;
}>, {
    version: z.ZodLiteral<"1.0.13">;
    datasets: z.ZodArray<z.ZodObject<{
        uid: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        files: z.ZodArray<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            fileType: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodAny>;
            requestInit: z.ZodOptional<z.ZodObject<{
                method: z.ZodOptional<z.ZodString>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                body: z.ZodOptional<z.ZodString>;
                mode: z.ZodOptional<z.ZodString>;
                credentials: z.ZodOptional<z.ZodString>;
                cache: z.ZodOptional<z.ZodString>;
                redirect: z.ZodOptional<z.ZodString>;
                referrer: z.ZodOptional<z.ZodString>;
                integrity: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            }, {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            }>>;
            coordinationValues: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
            coordinationValues?: Record<string, string> | undefined;
        }, {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
            coordinationValues?: Record<string, string> | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        uid: string;
        files: {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
            coordinationValues?: Record<string, string> | undefined;
        }[];
        name?: string | undefined;
        description?: string | undefined;
    }, {
        uid: string;
        files: {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
            coordinationValues?: Record<string, string> | undefined;
        }[];
        name?: string | undefined;
        description?: string | undefined;
    }>, "many">;
}>, {
    version: z.ZodLiteral<"1.0.16">;
    uid: z.ZodOptional<z.ZodString>;
    layout: z.ZodArray<z.ZodObject<{
        uid: z.ZodOptional<z.ZodString>;
        component: z.ZodString;
        props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
        coordinationScopes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>>;
        coordinationScopesBy: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>>>>;
    }, "strip", z.ZodTypeAny, {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[]> | undefined;
        uid?: string | undefined;
        coordinationScopesBy?: Record<string, Record<string, Record<string, string | string[]>>> | undefined;
    }, {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[]> | undefined;
        uid?: string | undefined;
        coordinationScopesBy?: Record<string, Record<string, Record<string, string | string[]>>> | undefined;
    }>, "many">;
}>, "strip", z.ZodTypeAny, {
    name: string;
    version: "1.0.16";
    datasets: {
        uid: string;
        files: {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
            coordinationValues?: Record<string, string> | undefined;
        }[];
        name?: string | undefined;
        description?: string | undefined;
    }[];
    layout: {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[]> | undefined;
        uid?: string | undefined;
        coordinationScopesBy?: Record<string, Record<string, Record<string, string | string[]>>> | undefined;
    }[];
    initStrategy: "none" | "auto";
    public?: boolean | undefined;
    description?: string | undefined;
    uid?: string | undefined;
    coordinationSpace?: z.objectOutputType<{}, z.ZodRecord<z.ZodString, z.ZodAny>, "strip"> | undefined;
}, {
    name: string;
    version: "1.0.16";
    datasets: {
        uid: string;
        files: {
            fileType: string;
            options?: any;
            name?: string | undefined;
            url?: string | undefined;
            requestInit?: {
                method?: string | undefined;
                headers?: Record<string, any> | undefined;
                body?: string | undefined;
                mode?: string | undefined;
                credentials?: string | undefined;
                cache?: string | undefined;
                redirect?: string | undefined;
                referrer?: string | undefined;
                integrity?: string | undefined;
            } | undefined;
            coordinationValues?: Record<string, string> | undefined;
        }[];
        name?: string | undefined;
        description?: string | undefined;
    }[];
    layout: {
        component: string;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[]> | undefined;
        uid?: string | undefined;
        coordinationScopesBy?: Record<string, Record<string, Record<string, string | string[]>>> | undefined;
    }[];
    initStrategy: "none" | "auto";
    public?: boolean | undefined;
    description?: string | undefined;
    uid?: string | undefined;
    coordinationSpace?: z.objectInputType<{}, z.ZodRecord<z.ZodString, z.ZodAny>, "strip"> | undefined;
}>;
export type AnyVersionConfig = z.infer<typeof configSchema0_1_0> | z.infer<typeof configSchema1_0_0> | z.infer<typeof configSchema1_0_1> | z.infer<typeof configSchema1_0_2> | z.infer<typeof configSchema1_0_3> | z.infer<typeof configSchema1_0_4> | z.infer<typeof configSchema1_0_5> | z.infer<typeof configSchema1_0_6> | z.infer<typeof configSchema1_0_7> | z.infer<typeof configSchema1_0_8> | z.infer<typeof configSchema1_0_9> | z.infer<typeof configSchema1_0_10> | z.infer<typeof configSchema1_0_11> | z.infer<typeof configSchema1_0_12> | z.infer<typeof configSchema1_0_13> | z.infer<typeof configSchema1_0_14> | z.infer<typeof configSchema1_0_15> | z.infer<typeof configSchema1_0_16>;
export type UpgradeFunction = (config: any) => AnyVersionConfig;
export declare const SCHEMA_HANDLERS: [z.ZodTypeAny, UpgradeFunction][];
//# sourceMappingURL=previous-config-meta.d.ts.map