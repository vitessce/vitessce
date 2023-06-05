import type { ComponentType } from 'react';
import { z } from 'zod';


export class PluginViewType {
  name: string;

  component: ComponentType;

  coordinationTypes: string[];

  constructor(name: string, component: ComponentType, coordinationTypes: string[]) {
    this.name = name;
    this.component = component;
    this.coordinationTypes = coordinationTypes;
  }
}

export interface DataLoader {
  load: () => Promise<any>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DataSource {

}

export class PluginFileType<
  T1 extends DataLoader, T2 extends DataSource, T3 extends z.ZodTypeAny,
> {
  name: string;

  dataType: string;

  dataLoaderClass: DataLoader;

  dataSourceClass: DataSource;

  optionsSchema: T3;

  constructor(
    name: string, dataType: string, dataLoaderClass: T1, dataSourceClass: T2, optionsSchema: T3,
  ) {
    this.name = name;
    this.dataType = dataType;
    this.dataLoaderClass = dataLoaderClass;
    this.dataSourceClass = dataSourceClass;
    this.optionsSchema = optionsSchema;
  }

  getSourceAndLoader(): [DataSource, DataLoader] {
    return [this.dataSourceClass, this.dataLoaderClass];
  }
}

// TODO: cleaning up any type requires refactoring
// latestFileDefSchema out of @vitessce/schemas to avoid circular dependency
// eslint-disable-next-line no-unused-vars
type ExpandFunction = (a: any) => Array<any>;

export class PluginJointFileType<T1 extends z.ZodTypeAny> {
  name: string;

  expandFunction: ExpandFunction;

  optionsSchema: T1;

  constructor(name: string, expandFunction: ExpandFunction, optionsSchema: T1) {
    this.name = name;
    this.expandFunction = expandFunction;
    this.optionsSchema = optionsSchema;
  }
}

export class PluginCoordinationType<T1 extends z.ZodTypeAny> {
  name: string;

  defaultValue: z.infer<T1>;

  valueSchema: T1;

  constructor(name: string, defaultValue: z.infer<T1>, valueSchema: T1) {
    this.name = name;
    this.defaultValue = defaultValue;
    this.valueSchema = valueSchema;
  }
}
