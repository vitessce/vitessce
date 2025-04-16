/**
 * A helper function to create a horizontal concatenation of views.
 * @param  {...(VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat)} views A
 * variable number of views or view concatenations.
 * @returns {VitessceConfigViewHConcat} A new horizontal view concatenation instance.
 */
export function hconcat(...views: (VitessceConfigView | VitessceConfigViewHConcat | VitessceConfigViewVConcat)[]): VitessceConfigViewHConcat;
/**
 * A helper function to create a vertical concatenation of views.
 * @param  {...(VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat)} views A
 * variable number of views or view concatenations.
 * @returns {VitessceConfigViewVConcat} A new vertical view concatenation instance.
 */
export function vconcat(...views: (VitessceConfigView | VitessceConfigViewHConcat | VitessceConfigViewVConcat)[]): VitessceConfigViewVConcat;
export function CL(value: any): CoordinationLevel;
export function getCoordinationSpaceAndScopes(partialCoordinationValues: any, scopePrefix: any): {
    coordinationSpace: any;
    coordinationScopes: any;
    coordinationScopesBy: any;
};
/**
 * Class representing a file within a Vitessce config dataset.
 */
export class VitessceConfigDatasetFile {
    /**
     * Construct a new file definition instance.
     * @param {string} url The URL to the file.
     * @param {string} dataType The type of data contained in the file.
     * @param {string} fileType The file type.
     * @param {object|array|null} options An optional object or array
     * which may provide additional parameters to the loader class
     * corresponding to the specified fileType.
     */
    constructor(url: string, fileType: string, coordinationValues: any, options: object | array | null);
    file: {
        options?: any;
        coordinationValues?: any;
        url: string;
        fileType: string;
    };
    /**
     * @returns {object} This dataset file as a JSON object.
     */
    toJSON(): object;
}
/**
 * Class representing a dataset within a Vitessce config.
 */
export class VitessceConfigDataset {
    /**
     * Construct a new dataset definition instance.
     * @param {string} uid The unique ID for the dataset.
     * @param {string} name The name of the dataset.
     * @param {string} description A description for the dataset.
     */
    constructor(uid: string, name: string, description: string);
    dataset: {
        uid: string;
        name: string;
        description: string;
        files: never[];
    };
    /**
     * Add a file definition to the dataset.
     * @param {object} params An object with named arguments.
     * @param {string|undefined} params.url The URL to the file.
     * @param {string} params.fileType The file type.
     * @param {object|undefined} params.coordinationValues The coordination values.
     * @param {object|array|undefined} params.options An optional object or array
     * which may provide additional parameters to the loader class
     * corresponding to the specified fileType.
     * @returns {VitessceConfigDataset} This, to allow chaining.
     */
    addFile(params: {
        url: string | undefined;
        fileType: string;
        coordinationValues: object | undefined;
        options: object | array | undefined;
    }, ...args: any[]): VitessceConfigDataset;
    /**
     * @returns {object} This dataset as a JSON object.
     */
    toJSON(): object;
}
/**
 * Class representing a view within a Vitessce layout.
 */
export class VitessceConfigView {
    /**
     * Construct a new view instance.
     * @param {string} component The name of the Vitessce component type.
     * @param {object} coordinationScopes A mapping from coordination type
     * names to coordination scope names.
     * @param {number} x The x-coordinate of the view in the layout.
     * @param {number} y The y-coordinate of the view in the layout.
     * @param {number} w The width of the view in the layout.
     * @param {number} h The height of the view in the layout.
     */
    constructor(component: string, coordinationScopes: object, x: number, y: number, w: number, h: number);
    view: {
        component: string;
        coordinationScopes: object;
        coordinationScopesBy: undefined;
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /**
     * Attach coordination scopes to this view.
     * @param  {...VitessceConfigCoordinationScope} args A variable number of
     * coordination scope instances.
     * @returns {VitessceConfigView} This, to allow chaining.
     */
    useCoordination(...args: VitessceConfigCoordinationScope[]): VitessceConfigView;
    /**
     * Attach potentially multi-level coordination scopes to this view.
     * @param {object} scopes A value returned by `VitessceConfig.addCoordinationByObject`.
     * Not intended to be a manually-constructed object.
     * @returns {VitessceConfigView} This, to allow chaining.
     */
    useCoordinationByObject(scopes: object): VitessceConfigView;
    /**
     * Attach meta coordination scopes to this view.
     * @param {VitessceConfigMetaCoordinationScope} metaScope A meta coordination scope instance.
     * @returns {VitessceConfigView} This, to allow chaining.
     */
    useMetaCoordination(metaScope: VitessceConfigMetaCoordinationScope): VitessceConfigView;
    /**
      * Set the x, y, w, h values for this view.
      * @param {number} x The x-coordinate of the view in the layout.
      * @param {number} y The y-coordinate of the view in the layout.
      * @param {number} w The width of the view in the layout.
      * @param {number} h The height of the view in the layout.
      * @returns {VitessceConfigView} This, to allow chaining.
      */
    setXYWH(x: number, y: number, w: number, h: number): VitessceConfigView;
    /**
     * Set props for this view.
     * @returns {VitessceConfigView} This, to allow chaining.
     */
    setProps(props: any): VitessceConfigView;
    /**
     * @returns {object} This view as a JSON object.
     */
    toJSON(): object;
}
/**
 * Class representing a horizontal concatenation of views.
 */
export class VitessceConfigViewHConcat {
    constructor(views: any);
    views: any;
}
/**
 * Class representing a vertical concatenation of views.
 */
export class VitessceConfigViewVConcat {
    constructor(views: any);
    views: any;
}
/**
 * Class representing a coordination scope in the coordination space.
 */
export class VitessceConfigCoordinationScope {
    /**
     * Construct a new coordination scope instance.
     * @param {string} cType The coordination type for this coordination scope.
     * @param {string} cScope The name of the coordination scope.
     * @param {[any]} cValue Optional. The coordination value of the coordination scope.
     */
    constructor(cType: string, cScope: string, cValue?: [any]);
    cType: string;
    cScope: string;
    cValue: [any];
    /**
     * Set the coordination value of the coordination scope.
     * @param {any} cValue The value to set.
     * @returns {VitessceConfigCoordinationScope} This, to allow chaining.
     */
    setValue(cValue: any): VitessceConfigCoordinationScope;
}
/**
 * Class representing a pair of coordination scopes,
 * for metaCoordinationScopes and metaCoordinationScopesBy,
 * respectively, in the coordination space.
 */
export class VitessceConfigMetaCoordinationScope {
    /**
     * Construct a new coordination scope instance.
     * @param {string} metaScope The name of the coordination scope for metaCoordinationScopes.
     * @param {string} metaByScope The name of the coordination scope for metaCoordinationScopesBy.
     */
    constructor(metaScope: string, metaByScope: string);
    metaScope: VitessceConfigCoordinationScope;
    metaByScope: VitessceConfigCoordinationScope;
    /**
     * Attach coordination scopes to this meta scope.
     * @param  {...VitessceConfigCoordinationScope} args A variable number of
     * coordination scope instances.
     * @returns {VitessceConfigMetaCoordinationScope} This, to allow chaining.
     */
    useCoordination(...args: VitessceConfigCoordinationScope[]): VitessceConfigMetaCoordinationScope;
    /**
     * Attach potentially multi-level coordination scopes to this meta coordination
     * scope instance.
     * @param {object} scopes A value returned by `VitessceConfig.addCoordinationByObject`.
     * Not intended to be a manually-constructed object.
     * @returns {VitessceConfigView} This, to allow chaining.
     */
    useCoordinationByObject(scopes: object): VitessceConfigView;
}
/**
 * Class representing a Vitessce view config.
 */
export class VitessceConfig {
    /**
     * Create a VitessceConfig instance from an existing view config, to enable
     * manipulation with the JavaScript API.
     * @param {object} config An existing Vitessce view config as a JSON object.
     * @returns {VitessceConfig} A new config instance, with values set to match
     * the config parameter.
     */
    static fromJSON(config: object): VitessceConfig;
    /**
     * Construct a new view config instance.
     * @param {object} params An object with named arguments.
     * @param {string} params.schemaVersion The view config schema version. Required.
     * @param {string} params.name A name for the config. Optional.
     * @param {string|undefined} params.description A description for the config. Optional.
     */
    constructor(params: {
        schemaVersion: string;
        name: string;
        description: string | undefined;
    }, ...args: any[]);
    config: {
        version: string;
        name: string;
        description: any;
        datasets: never[];
        coordinationSpace: {};
        layout: never[];
        initStrategy: string;
    };
    getNextScope: any;
    /**
     * Add a new dataset to the config.
     * @param {string} name A name for the dataset. Optional.
     * @param {string} description A description for the dataset. Optional.
     * @param {object} options Extra parameters to be used internally. Optional.
     * @param {string} options.uid Override the automatically-generated dataset ID.
     * Intended for internal usage by the VitessceConfig.fromJSON code.
     * @returns {VitessceConfigDataset} A new dataset instance.
     */
    addDataset(name?: string, description?: string, options?: {
        uid: string;
    }): VitessceConfigDataset;
    /**
     * Add a new view to the config.
     * @param {VitessceConfigDataset} dataset The dataset instance which defines the data
     * that will be displayed in the view.
     * @param {string} component A component name, such as "scatterplot" or "spatial".
     * @param {object} options Extra options for the component.
     * @param {number} options.x The x-coordinate for the view in the grid layout.
     * @param {number} options.y The y-coordinate for the view in the grid layout.
     * @param {number} options.w The width for the view in the grid layout.
     * @param {number} options.h The height for the view in the grid layout.
     * @param {number} options.mapping A convenience parameter for setting the EMBEDDING_TYPE
     * coordination value. Only applicable if the component is "scatterplot".
     * @returns {VitessceConfigView} A new view instance.
     */
    addView(dataset: VitessceConfigDataset, component: string, options: {
        x: number;
        y: number;
        w: number;
        h: number;
        mapping: number;
    }): VitessceConfigView;
    /**
     * Get an array of new coordination scope instances corresponding to coordination types
     * of interest.
     * @param {...string} args A variable number of coordination type names.
     * @returns {VitessceConfigCoordinationScope[]} An array of coordination scope instances.
     */
    addCoordination(...args: string[]): VitessceConfigCoordinationScope[];
    /**
     * Initialize a new meta coordination scope in the coordination space,
     * and get a reference to it in the form of a meta coordination scope instance.
     * @returns {VitessceConfigMetaCoordinationScope} A new meta coordination scope instance.
     */
    addMetaCoordination(): VitessceConfigMetaCoordinationScope;
    /**
     * Set up the initial values for multi-level coordination in the coordination space.
     * Get a reference to these values to pass to the `useCoordinationByObject` method
     * of either view or meta coordination scope instances.
     * @param {object} input A (potentially nested) object with coordination types as keys
     * and values being either the initial coordination value, a `VitessceConfigCoordinationScope`
     * instance, or a `CoordinationLevel` instance.
     * The CL function takes an array of objects as its argument, and returns a CoordinationLevel
     * instance, to support nesting.
     * @returns {object} A (potentially nested) object with coordination types as keys and values
     * being either { scope }, { scope, children }, or an array of these. Not intended to be
     * manipulated before being passed to a `useCoordinationByObject` function.
     */
    addCoordinationByObject(input: object): object;
    /**
     * A convenience function for setting up new coordination scopes across a set of views.
     * @param {VitessceConfigView[]} views An array of view objects to link together.
     * @param {string[]} cTypes The coordination types on which to coordinate the views.
     * @param {any[]} cValues Initial values corresponding to each coordination type.
     * Should have the same length as the cTypes array. Optional.
     * @returns {VitessceConfig} This, to allow chaining.
     */
    linkViews(views: VitessceConfigView[], cTypes: string[], cValues?: any[]): VitessceConfig;
    /**
     * A convenience function for setting up multi-level and meta-coordination scopes
     * across a set of views.
     * @param {VitessceConfigView[]} views An array of view objects to link together.
     * @param {object} input A (potentially nested) object with coordination types as keys
     * and values being either the initial coordination value, a `VitessceConfigCoordinationScope`
     * instance, or a `CoordinationLevel` instance.
     * The CL function takes an array of objects as its argument, and returns a CoordinationLevel
     * instance, to support nesting.
     * @param {object|null} options
     * @param {bool} options.meta Should meta-coordination be used? Optional.
     * By default, true.
     * @param {string|null} options.scopePrefix A prefix to add to all
     * coordination scope names. Optional.
     * @returns {VitessceConfig} This, to allow chaining.
     */
    linkViewsByObject(views: VitessceConfigView[], input: object, options?: object | null): VitessceConfig;
    /**
     * Set the value for a coordination scope.
     * If a coordination object for the coordination type does not yet exist
     * in the coordination space, it will be created.
     * @param {string} cType The coordination type.
     * @param {string} cScope The coordination scope.
     * @param {any} cValue The initial value for the coordination scope.
     * @returns {VitessceConfigCoordinationScope} A coordination scope instance.
     */
    setCoordinationValue(cType: string, cScope: string, cValue: any): VitessceConfigCoordinationScope;
    /**
     * Set the layout of views.
     * @param {VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat} viewConcat A
     * view or a concatenation of views.
     * @returns {VitessceConfig} This, to allow chaining.
     */
    layout(viewConcat: VitessceConfigView | VitessceConfigViewHConcat | VitessceConfigViewVConcat): VitessceConfig;
    /**
     * Convert this instance to a JSON object that can be passed to the Vitessce component.
     * @returns {object} The view config as a JSON object.
     */
    toJSON(): object;
}
declare class CoordinationLevel {
    constructor(value: any);
    value: any;
    cachedValue: any;
    setCached(processedLevel: any): void;
    getCached(): any;
    isCached(): boolean;
}
export {};
//# sourceMappingURL=VitessceConfig.d.ts.map