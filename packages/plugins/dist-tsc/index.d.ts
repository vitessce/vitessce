import type { ComponentType } from 'react';
import { z } from 'zod';
export declare class PluginViewType {
    name: string;
    component: ComponentType;
    coordinationTypes: string[];
    constructor(name: string, component: ComponentType, coordinationTypes: string[]);
}
export interface DataLoader {
    load: () => Promise<any>;
}
export interface DataSource {
}
export declare class PluginFileType<T1 extends DataLoader, T2 extends DataSource, T3 extends z.ZodTypeAny> {
    name: string;
    dataType: string;
    dataLoaderClass: DataLoader;
    dataSourceClass: DataSource;
    optionsSchema: T3;
    constructor(name: string, dataType: string, dataLoaderClass: T1, dataSourceClass: T2, optionsSchema: T3);
    getSourceAndLoader(): [DataSource, DataLoader];
}
type ExpandFunction = (a: any) => Array<any>;
export declare class PluginJointFileType<T1 extends z.ZodTypeAny> {
    name: string;
    expandFunction: ExpandFunction;
    optionsSchema: T1;
    constructor(name: string, expandFunction: ExpandFunction, optionsSchema: T1);
}
export declare class PluginCoordinationType<T1 extends z.ZodTypeAny> {
    name: string;
    defaultValue: z.infer<T1>;
    valueSchema: T1;
    constructor(name: string, defaultValue: z.infer<T1>, valueSchema: T1);
}
export {};
//# sourceMappingURL=index.d.ts.map