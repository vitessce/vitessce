export class PluginViewType {
  constructor(name, component, coordinationTypes) {
    this.name = name;
    this.component = component;
    this.coordinationTypes = coordinationTypes;
  }
}

export class PluginFileType {
  constructor(name, dataType, dataLoaderClass, dataSourceClass, optionsSchema) {
    this.name = name;
    this.dataType = dataType;
    this.dataLoaderClass = dataLoaderClass;
    this.dataSourceClass = dataSourceClass;
    this.optionsSchema = optionsSchema;
  }
}

export class PluginJointFileType {
  constructor(name, expandFunction, optionsSchema) {
    this.name = name;
    this.expandFunction = expandFunction;
    this.optionsSchema = optionsSchema;
  }
}

export class PluginCoordinationType {
  constructor(name, defaultValue, valueSchema) {
    this.name = name;
    this.defaultValue = defaultValue;
    this.valueSchema = valueSchema;
  }
}
