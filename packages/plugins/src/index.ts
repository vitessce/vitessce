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

interface FileDef<OptionsType> {
  fileType: string,
  url: string,
  requestInit: object,
  coordinationValues: Record<string, any>,
  options: OptionsType,
}

type ExpandFunction<InOptionsType> = (a: FileDef<InOptionsType>) => Array<FileDef<any>>;

export class PluginJointFileType<T1 extends z.ZodTypeAny> {
  name: string;

  expandFunction: ExpandFunction<z.infer<T1>>;

  optionsSchema: T1;

  constructor(name: string, expandFunction: ExpandFunction<z.infer<T1>>, optionsSchema: T1) {
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
