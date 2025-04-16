import { z } from 'zod';
import { PluginViewType, PluginCoordinationType, PluginFileType, PluginJointFileType } from '@vitessce/plugins';
/**
 * Build a Zod schema for the latest Vitessce config,
 * which is specific to any registered plugins.
 * The builder pattern allows the returned
 * Zod schema to be typed despite not knowing
 * the plugin names or sub-schemas in advance.
 * @param pluginFileTypes
 * @param pluginJointFileTypes
 * @param pluginCoordinationTypes
 * @param pluginViewTypes
 * @returns The Zod schema.
 */
export declare function buildConfigSchema<T1 extends PluginFileType<any, any, z.ZodTypeAny>, T2 extends PluginJointFileType<z.ZodTypeAny>, T3 extends PluginCoordinationType<z.ZodTypeAny>>(pluginFileTypes: Array<T1>, pluginJointFileTypes: Array<T2>, pluginCoordinationTypes: Array<T3>, pluginViewTypes: Array<PluginViewType>): z.ZodObject<{
    version: z.ZodLiteral<string>;
    uid: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    public: z.ZodOptional<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    datasets: z.ZodArray<z.ZodObject<{
        uid: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        files: z.ZodArray<z.ZodNull | z.ZodObject<{
            fileType: z.ZodLiteral<string>;
            options: z.ZodOptional<z.ZodTypeAny>;
            url: z.ZodOptional<z.ZodString>;
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
        }> | z.ZodDiscriminatedUnion<"fileType", [z.ZodObject<{
            fileType: z.ZodLiteral<string>;
            options: z.ZodOptional<z.ZodTypeAny>;
            url: z.ZodOptional<z.ZodString>;
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
        }>, z.ZodObject<{
            fileType: z.ZodLiteral<string>;
            options: z.ZodOptional<z.ZodTypeAny>;
            url: z.ZodOptional<z.ZodString>;
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
        }>, ...z.ZodObject<{
            fileType: z.ZodLiteral<string>;
            options: z.ZodOptional<z.ZodTypeAny>;
            url: z.ZodOptional<z.ZodString>;
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
        }>[]]>, "many">;
    }, "strip", z.ZodTypeAny, {
        uid: string;
        files: ({
            fileType: string;
            options?: any;
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
        } | null)[];
        name?: string | undefined;
        description?: string | undefined;
    }, {
        uid: string;
        files: ({
            fileType: string;
            options?: any;
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
        } | null)[];
        name?: string | undefined;
        description?: string | undefined;
    }>, "many">;
    coordinationSpace: z.ZodOptional<z.ZodObject<{
        [k: string]: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodTypeAny>>>;
    }, "strict", z.ZodTypeAny, {
        [x: string]: Record<string, any> | undefined;
    }, {
        [x: string]: Record<string, any> | undefined;
    }>>;
    layout: z.ZodArray<z.ZodObject<{
        uid: z.ZodOptional<z.ZodString>;
        component: z.ZodNull | z.ZodLiteral<string> | z.ZodEnum<[string, ...string[]]>;
        props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
        coordinationScopes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>>;
        coordinationScopesBy: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>>>>;
    }, "strip", z.ZodTypeAny, {
        component: string | null;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[]> | undefined;
        uid?: string | undefined;
        coordinationScopesBy?: Record<string, Record<string, Record<string, string | string[]>>> | undefined;
    }, {
        component: string | null;
        x: number;
        y: number;
        props?: Record<string, any> | undefined;
        w?: number | undefined;
        h?: number | undefined;
        coordinationScopes?: Record<string, string | string[]> | undefined;
        uid?: string | undefined;
        coordinationScopesBy?: Record<string, Record<string, Record<string, string | string[]>>> | undefined;
    }>, "many">;
    initStrategy: z.ZodEnum<["none", "auto"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: string;
    datasets: {
        uid: string;
        files: ({
            fileType: string;
            options?: any;
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
        } | null)[];
        name?: string | undefined;
        description?: string | undefined;
    }[];
    layout: {
        component: string | null;
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
    coordinationSpace?: {
        [x: string]: Record<string, any> | undefined;
    } | undefined;
}, {
    name: string;
    version: string;
    datasets: {
        uid: string;
        files: ({
            fileType: string;
            options?: any;
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
        } | null)[];
        name?: string | undefined;
        description?: string | undefined;
    }[];
    layout: {
        component: string | null;
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
    coordinationSpace?: {
        [x: string]: Record<string, any> | undefined;
    } | undefined;
}>;
//# sourceMappingURL=schema-builders.d.ts.map