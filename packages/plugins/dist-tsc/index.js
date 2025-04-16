export class PluginViewType {
    name;
    component;
    coordinationTypes;
    constructor(name, component, coordinationTypes) {
        this.name = name;
        this.component = component;
        this.coordinationTypes = coordinationTypes;
    }
}
export class PluginFileType {
    name;
    dataType;
    dataLoaderClass;
    dataSourceClass;
    optionsSchema;
    constructor(name, dataType, dataLoaderClass, dataSourceClass, optionsSchema) {
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
export class PluginJointFileType {
    name;
    expandFunction;
    optionsSchema;
    constructor(name, expandFunction, optionsSchema) {
        this.name = name;
        this.expandFunction = expandFunction;
        this.optionsSchema = optionsSchema;
    }
}
export class PluginCoordinationType {
    name;
    defaultValue;
    valueSchema;
    constructor(name, defaultValue, valueSchema) {
        this.name = name;
        this.defaultValue = defaultValue;
        this.valueSchema = valueSchema;
    }
}
