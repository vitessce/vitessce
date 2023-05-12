// @ts-check

/** @typedef {import('react').ComponentType} ComponentType */
/** @typedef {import('zod').ZodTypeAny} ZodTypeAny */

/** @typedef {import('./types').DataLoader} DataLoader */
/** @typedef {import('./types').DataSource} DataSource */

export class PluginViewType {
  /** @type {string} */
  name;

  /** @type {ComponentType} */
  component;

  /** @type {string[]} */
  coordinationTypes;

  /**
   * @param {string} name
   * @param {ComponentType} component
   * @param {string[]} coordinationTypes
   */
  constructor(name, component, coordinationTypes) {
    this.name = name;
    this.component = component;
    this.coordinationTypes = coordinationTypes;
  }
}

/**
 * @class
 * @template {DataLoader} T1
 * @template {DataSource} T2
 * @template {ZodTypeAny} T3
 */
export class PluginFileType{
  /** @type {string} */
  name;
  /** @type {string} */
  dataType;
  /** @type {DataLoader} */
  dataLoaderClass;
  /** @type {DataSource} */
  dataSourceClass;
  /** @type {T3} */
  optionsSchema;

  /**
   * 
   * @param {string} name 
   * @param {string} dataType 
   * @param {T1} dataLoaderClass 
   * @param {T2} dataSourceClass 
   * @param {T3} optionsSchema 
   */
  constructor(
    name, dataType, dataLoaderClass, dataSourceClass, optionsSchema,
  ) {
    this.name = name;
    this.dataType = dataType;
    this.dataLoaderClass = dataLoaderClass;
    this.dataSourceClass = dataSourceClass;
    this.optionsSchema = optionsSchema;
  }

  /**
   * 
   * @returns {[DataSource, DataLoader]}
   */
  getSourceAndLoader() {
    return [this.dataSourceClass, this.dataLoaderClass];
  }
}

// TODO: cleaning up any type requires refactoring
// latestFileDefSchema out of @vitessce/schemas to avoid circular dependency
// eslint-disable-next-line no-unused-vars

/** @typedef {(a: any) => Array<any>} ExpandFunction */

/**
 * @class
 * @template {ZodTypeAny} T1
 */
export class PluginJointFileType {
  /** @type {string} */
  name;

  /** @type {ExpandFunction} */
  expandFunction;
  /** @type {T1} */
  optionsSchema;

  /**
   * 
   * @param {string} name 
   * @param {ExpandFunction} expandFunction 
   * @param {T1} optionsSchema 
   */
  constructor(name, expandFunction, optionsSchema) {
    this.name = name;
    this.expandFunction = expandFunction;
    this.optionsSchema = optionsSchema;
  }
}

/**
 * @class
 * @template {ZodTypeAny} T1
 */
export class PluginCoordinationType {
  /** @type {string} */
  name;
  /** @type {import('zod').z.infer<T1>} */
  defaultValue;

  /** @type {T1} */
  valueSchema;

  /**
   * 
   * @param {string} name 
   * @param {import('zod').z.infer<T1>} defaultValue 
   * @param {T1} valueSchema 
   */
  constructor(name, defaultValue, valueSchema) {
    this.name = name;
    this.defaultValue = defaultValue;
    this.valueSchema = valueSchema;
  }
}
