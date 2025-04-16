var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class PluginViewType {
  constructor(name, component, coordinationTypes) {
    __publicField(this, "name");
    __publicField(this, "component");
    __publicField(this, "coordinationTypes");
    this.name = name;
    this.component = component;
    this.coordinationTypes = coordinationTypes;
  }
}
class PluginFileType {
  constructor(name, dataType, dataLoaderClass, dataSourceClass, optionsSchema) {
    __publicField(this, "name");
    __publicField(this, "dataType");
    __publicField(this, "dataLoaderClass");
    __publicField(this, "dataSourceClass");
    __publicField(this, "optionsSchema");
    this.name = name;
    this.dataType = dataType;
    this.dataLoaderClass = dataLoaderClass;
    this.dataSourceClass = dataSourceClass;
    this.optionsSchema = optionsSchema;
  }
  getSourceAndLoader() {
    return [this.dataSourceClass, this.dataLoaderClass];
  }
}
class PluginJointFileType {
  constructor(name, expandFunction, optionsSchema) {
    __publicField(this, "name");
    __publicField(this, "expandFunction");
    __publicField(this, "optionsSchema");
    this.name = name;
    this.expandFunction = expandFunction;
    this.optionsSchema = optionsSchema;
  }
}
class PluginCoordinationType {
  constructor(name, defaultValue, valueSchema) {
    __publicField(this, "name");
    __publicField(this, "defaultValue");
    __publicField(this, "valueSchema");
    this.name = name;
    this.defaultValue = defaultValue;
    this.valueSchema = valueSchema;
  }
}
export {
  PluginCoordinationType,
  PluginFileType,
  PluginJointFileType,
  PluginViewType
};
