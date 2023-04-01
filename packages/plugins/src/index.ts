import React from 'react';
import { z } from 'zod';

export class PluginViewType {
  name: string;

  component: React.Component;

  coordinationTypes: string[];

  constructor(name: string, component: React.Component, coordinationTypes: string[]) {
    this.name = name;
    this.component = component;
    this.coordinationTypes = coordinationTypes;
  }
}

export interface IDataLoader {
  load: () => Promise<any>;
}

export interface IDataSource {

}

export class PluginFileType<
  T1 extends IDataLoader, T2 extends IDataSource, T3 extends z.ZodTypeAny,
> {
  name: string;

  dataType: string;

  dataLoaderClass: IDataLoader;

  dataSourceClass: IDataSource;

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

  getSourceAndLoader(): [IDataSource, IDataLoader] {
    return [this.dataSourceClass, this.dataLoaderClass];
  }
}

interface IFileDef<OptionsType> {
  fileType: string,
  url: string,
  requestInit: object,
  coordinationValues: Record<string, any>,
  options: OptionsType,
}

type ExpandFunction<InOptionsType> = (a: IFileDef<InOptionsType>) => Array<IFileDef<any>>;

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
