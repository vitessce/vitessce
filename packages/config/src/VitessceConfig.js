/* eslint-disable react-hooks/rules-of-hooks */
import { CoordinationType } from '@vitessce/constants-internal';
import { fromEntries, getNextScope } from '@vitessce/utils';

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
  constructor(url, fileType, coordinationValues, options) {
    this.file = {
      url,
      fileType,
      ...(coordinationValues ? { coordinationValues } : {}),
      ...(options ? { options } : {}),
    };
  }

  /**
   * @returns {object} This dataset file as a JSON object.
   */
  toJSON() {
    return this.file;
  }
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
  constructor(uid, name, description) {
    this.dataset = {
      uid,
      name,
      description,
      files: [],
    };
  }

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
  addFile(params, ...args) {
    let url;
    let fileType;
    let coordinationValues;
    let options;
    if (args.length > 0) {
      // Old behavior.
      url = params;
      // eslint-disable-next-line no-unused-vars
      let dataType;
      if (args.length === 2) {
        [dataType, fileType] = args;
      } else if (args.length === 3) {
        // eslint-disable-next-line no-unused-vars
        [dataType, fileType, options] = args;
      }
    } else if (typeof params === 'object') {
      ({
        url, fileType, options, coordinationValues,
      } = params);
    } else {
      throw new Error('Expected addFile argument to be an object.');
    }
    this.dataset.files.push(
      new VitessceConfigDatasetFile(url, fileType, coordinationValues, options),
    );
    return this;
  }

  /**
   * @returns {object} This dataset as a JSON object.
   */
  toJSON() {
    return {
      ...this.dataset,
      files: this.dataset.files.map(f => f.toJSON()),
    };
  }
}

function useCoordinationByObjectHelper(scopes, coordinationScopes, coordinationScopesBy) {
  // Set this.coordinationScopes and this.coordinationScopesBy by recursion on `scopes`.
  /*
    // Destructured, `scopes` might look like:
    const {
      [CoordinationType.SPATIAL_IMAGE_LAYER]: [
        {
          scope: imageLayerScope,
          children: {
            [CoordinationType.FILE_UID]: { scope: imageScope },
            [CoordinationType.SPATIAL_LAYER_VISIBLE]: { scope: imageVisibleScope },
            [CoordinationType.SPATIAL_LAYER_OPACITY]: { scope: imageOpacityScope },
            [CoordinationType.SPATIAL_IMAGE_CHANNEL]: [
              {
                scope: imageChannelScopeR,
                children: {
                  [CoordinationType.SPATIAL_TARGET_C]: { scope: rTargetScope },
                  [CoordinationType.SPATIAL_CHANNEL_COLOR]: { scope: rColorScope },
                },
              },
              {
                scope: imageChannelScopeG,
                children: {
                  [CoordinationType.SPATIAL_TARGET_C]: { scope: gTargetScope },
                  [CoordinationType.SPATIAL_CHANNEL_COLOR]: { scope: gColorScope },
                },
              },
            ],
          },
        },
      ],
      // ...
    } = scopes;

    // This would set the values to:
    this.coordinationScopes = {
      // Add the top-level coordination types to `coordinationScopes`.
      [CoordinationType.SPATIAL_IMAGE_LAYER]: [imageLayerScope.cScope],
    };
    this.coordinationScopesBy = {
      [CoordinationType.SPATIAL_IMAGE_LAYER]: {
        [CoordinationType.FILE_UID]: {
          [imageLayerScope.cScope]: imageScope.cScope,
        },
        [CoordinationType.SPATIAL_LAYER_VISIBLE]: {
          [imageLayerScope.cScope]: imageVisibleScope.cScope,
        },
        [CoordinationType.SPATIAL_LAYER_OPACITY]: {
          [imageLayerScope.cScope]: imageOpacityScope.cScope,
        },
        [CoordinationType.SPATIAL_IMAGE_CHANNEL]: {
          [imageLayerScope.cScope]: [imageChannelScopeR.cScope, imageChannelScopeG.cScope],
        },
      },
      [CoordinationType.SPATIAL_IMAGE_CHANNEL]: {
        [CoordinationType.SPATIAL_TARGET_C]: {
          [imageChannelScopeR.cScope]: rTargetScope.cScope,
          [imageChannelScopeG.cScope]: gTargetScope.cScope,
        },
        [CoordinationType.SPATIAL_CHANNEL_COLOR]: {
          [imageChannelScopeR.cScope]: rColorScope.cScope,
          [imageChannelScopeG.cScope]: gColorScope.cScope,
        },
      },
    };
   */

  // Recursive inner function.
  function processLevel(parentType, parentScope, levelType, levelVal) {
    if (Array.isArray(levelVal)) {
      // eslint-disable-next-line no-param-reassign
      coordinationScopesBy[parentType] = {
        ...(coordinationScopesBy[parentType] || {}),
        [levelType]: {
          ...(coordinationScopesBy[parentType]?.[levelType] || {}),
          [parentScope.cScope]: levelVal.map(childVal => childVal.scope.cScope),
        },
      };
      levelVal.forEach((childVal) => {
        if (childVal.children) {
          // Continue recursion.
          Object.entries(childVal.children)
            .forEach(([nextLevelType, nextLevelVal]) => processLevel(
              levelType, childVal.scope, nextLevelType, nextLevelVal,
            ));
        } // Else is the base case: no children
      });
    } else {
      // eslint-disable-next-line no-param-reassign
      coordinationScopesBy[parentType] = {
        ...(coordinationScopesBy[parentType] || {}),
        [levelType]: {
          ...(coordinationScopesBy[parentType]?.[levelType] || {}),
          [parentScope.cScope]: levelVal.scope.cScope,
        },
      };

      if (levelVal.children) {
        // Continue recursion.
        Object.entries(levelVal.children)
          .forEach(([nextLevelType, nextLevelVal]) => processLevel(
            levelType, levelVal.scope, nextLevelType, nextLevelVal,
          ));
      } // Else is the base case: no children
    }
  }

  Object.entries(scopes).forEach(([topLevelType, topLevelVal]) => {
    if (Array.isArray(topLevelVal)) {
      // eslint-disable-next-line no-param-reassign
      coordinationScopes[topLevelType] = topLevelVal.map(levelVal => levelVal.scope.cScope);

      topLevelVal.forEach((levelVal) => {
        if (levelVal.children) {
          // Begin recursion.
          Object.entries(levelVal.children)
            .forEach(([nextLevelType, nextLevelVal]) => processLevel(
              topLevelType, levelVal.scope, nextLevelType, nextLevelVal,
            ));
        }
      });
    } else {
      // eslint-disable-next-line no-param-reassign
      coordinationScopes[topLevelType] = topLevelVal.scope.cScope;
      if (topLevelVal.children) {
        // Begin recursion.
        Object.entries(topLevelVal.children)
          .forEach(([nextLevelType, nextLevelVal]) => processLevel(
            topLevelType, topLevelVal.scope, nextLevelType, nextLevelVal,
          ));
      }
    }
  });
  return [coordinationScopes, coordinationScopesBy];
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
  constructor(component, coordinationScopes, x, y, w, h) {
    this.view = {
      component,
      coordinationScopes,
      coordinationScopesBy: undefined, // TODO: initialize from parameter?
      x,
      y,
      w,
      h,
    };
  }

  /**
   * Attach coordination scopes to this view.
   * @param  {...VitessceConfigCoordinationScope} args A variable number of
   * coordination scope instances.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  useCoordination(...args) {
    const cScopes = args;
    cScopes.forEach((cScope) => {
      this.view.coordinationScopes[cScope.cType] = cScope.cScope;
    });
    return this;
  }

  /**
   * Attach potentially multi-level coordination scopes to this view.
   * @param {object} scopes A value returned by `VitessceConfig.addCoordinationByObject`.
   * Not intended to be a manually-constructed object.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  useCoordinationByObject(scopes) {
    if (!this.view.coordinationScopes) {
      this.view.coordinationScopes = {};
    }
    if (!this.view.coordinationScopesBy) {
      this.view.coordinationScopesBy = {};
    }
    const [nextCoordinationScopes, nextCoordinationScopesBy] = useCoordinationByObjectHelper(
      scopes,
      this.view.coordinationScopes,
      this.view.coordinationScopesBy,
    );
    this.view.coordinationScopes = nextCoordinationScopes;
    this.view.coordinationScopesBy = nextCoordinationScopesBy;
    return this;
  }

  /**
   * Attach meta coordination scopes to this view.
   * @param {VitessceConfigMetaCoordinationScope} metaScope A meta coordination scope instance.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  useMetaCoordination(metaScope) {
    if (!this.view.coordinationScopes) {
      this.view.coordinationScopes = {};
    }
    this.view.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES] = [
      ...(this.view.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES] || []),
      metaScope.metaScope.cScope,
    ];
    this.view.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES_BY] = [
      ...(this.view.coordinationScopes[CoordinationType.META_COORDINATION_SCOPES_BY] || []),
      metaScope.metaByScope.cScope,
    ];
    return this;
  }

  /**
    * Set the x, y, w, h values for this view.
    * @param {number} x The x-coordinate of the view in the layout.
    * @param {number} y The y-coordinate of the view in the layout.
    * @param {number} w The width of the view in the layout.
    * @param {number} h The height of the view in the layout.
    * @returns {VitessceConfigView} This, to allow chaining.
    */
  setXYWH(x, y, w, h) {
    this.view.x = x;
    this.view.y = y;
    this.view.w = w;
    this.view.h = h;

    return this;
  }

  /**
   * Set props for this view.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  setProps(props) {
    this.view.props = {
      ...(this.view.props || {}),
      ...props,
    };
    return this;
  }

  /**
   * @returns {object} This view as a JSON object.
   */
  toJSON() {
    return this.view;
  }
}

/**
 * Class representing a horizontal concatenation of views.
 */
export class VitessceConfigViewHConcat {
  constructor(views) {
    this.views = views;
  }
}

/**
 * Class representing a vertical concatenation of views.
 */
export class VitessceConfigViewVConcat {
  constructor(views) {
    this.views = views;
  }
}

/**
 * A helper function to create a horizontal concatenation of views.
 * @param  {...(VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat)} views A
 * variable number of views or view concatenations.
 * @returns {VitessceConfigViewHConcat} A new horizontal view concatenation instance.
 */
export function hconcat(...views) {
  const vcvhc = new VitessceConfigViewHConcat(views);
  return vcvhc;
}

/**
 * A helper function to create a vertical concatenation of views.
 * @param  {...(VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat)} views A
 * variable number of views or view concatenations.
 * @returns {VitessceConfigViewVConcat} A new vertical view concatenation instance.
 */
export function vconcat(...views) {
  const vcvvc = new VitessceConfigViewVConcat(views);
  return vcvvc;
}

// would import as CL for convenience
class CoordinationLevel {
  constructor(value) {
    this.value = value;
    this.cachedValue = null;
  }

  setCached(processedLevel) {
    this.cachedValue = processedLevel;
  }

  getCached() {
    return this.cachedValue;
  }

  isCached() {
    return this.cachedValue !== null;
  }
}

export function CL(value) {
  return new CoordinationLevel(value);
}

/**
 * Class representing a coordination scope in the coordination space.
 */
export class VitessceConfigCoordinationScope {
  /**
   * Construct a new coordination scope instance.
   * @param {string} cType The coordination type for this coordination scope.
   * @param {string} cScope The name of the coordination scope.
   */
  constructor(cType, cScope) {
    this.cType = cType;
    this.cScope = cScope;
    this.cValue = null;
  }

  /**
   * Set the coordination value of the coordination scope.
   * @param {any} cValue The value to set.
   * @returns {VitessceConfigCoordinationScope} This, to allow chaining.
   */
  setValue(cValue) {
    this.cValue = cValue;
    return this;
  }
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
  constructor(metaScope, metaByScope) {
    this.metaScope = new VitessceConfigCoordinationScope(
      CoordinationType.META_COORDINATION_SCOPES,
      metaScope,
    );
    this.metaByScope = new VitessceConfigCoordinationScope(
      CoordinationType.META_COORDINATION_SCOPES_BY,
      metaByScope,
    );
  }

  /**
   * Attach coordination scopes to this meta scope.
   * @param  {...VitessceConfigCoordinationScope} args A variable number of
   * coordination scope instances.
   * @returns {VitessceConfigMetaCoordinationScope} This, to allow chaining.
   */
  useCoordination(...args) {
    const cScopes = args;
    const metaScopesVal = this.metaScope.cValue;
    cScopes.forEach((cScope) => {
      metaScopesVal[cScope.cType] = cScope.cScope;
    });
    this.metaScope.setValue(metaScopesVal);
    return this;
  }

  /**
   * Attach potentially multi-level coordination scopes to this meta coordination
   * scope instance.
   * @param {object} scopes A value returned by `VitessceConfig.addCoordinationByObject`.
   * Not intended to be a manually-constructed object.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  useCoordinationByObject(scopes) {
    if (!this.metaScope.cValue) {
      this.metaScope.setValue({});
    }
    if (!this.metaByScope.cValue) {
      this.metaByScope.setValue({});
    }
    const [metaScopesVal, metaByScopesVal] = useCoordinationByObjectHelper(
      scopes,
      this.metaScope.cValue,
      this.metaByScope.cValue,
    );
    this.metaScope.setValue(metaScopesVal);
    this.metaByScope.setValue(metaByScopesVal);
    return this;
  }
}

/**
 * Class representing a Vitessce view config.
 */
export class VitessceConfig {
  /**
   * Construct a new view config instance.
   * @param {object} params An object with named arguments.
   * @param {string} params.schemaVersion The view config schema version. Required.
   * @param {string} params.name A name for the config. Optional.
   * @param {string|undefined} params.description A description for the config. Optional.
   */
  constructor(params, ...args) {
    let name;
    let description;
    let schemaVersion;
    if (typeof params === 'string') {
      // Old behavior for backwards compatibility.
      schemaVersion = '1.0.7';
      name = params || '';
      if (args.length === 1) {
        [description] = args;
      } else if (args.length > 1) {
        throw new Error('Expected only one VitessceConfig constructor argument.');
      }
    } else if (typeof params === 'object') {
      ({ schemaVersion, name, description } = params);
      if (!name) {
        throw new Error('Expected params.name argument in VitessceConfig constructor');
      }
      if (!schemaVersion) {
        throw new Error('Expected params.schemaVersion argument in VitessceConfig constructor');
      }
    } else {
      throw new Error('Expected VitessceConfig constructor argument to be an object.');
    }
    this.config = {
      version: schemaVersion,
      name,
      description,
      datasets: [],
      coordinationSpace: {},
      layout: [],
      initStrategy: 'auto',
    };
  }

  /**
   * Add a new dataset to the config.
   * @param {string} name A name for the dataset. Optional.
   * @param {string} description A description for the dataset. Optional.
   * @param {object} options Extra parameters to be used internally. Optional.
   * @param {string} options.uid Override the automatically-generated dataset ID.
   * Intended for internal usage by the VitessceConfig.fromJSON code.
   * @returns {VitessceConfigDataset} A new dataset instance.
   */
  addDataset(name = undefined, description = undefined, options = undefined) {
    const { uid } = options || {};
    const prevDatasetUids = this.config.datasets.map(d => d.dataset.uid);
    const nextUid = (uid || getNextScope(prevDatasetUids));
    const newDataset = new VitessceConfigDataset(nextUid, name, description);
    this.config.datasets.push(newDataset);
    const [newScope] = this.addCoordination(CoordinationType.DATASET);
    newScope.setValue(nextUid);
    return newDataset;
  }

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
  addView(dataset, component, options) {
    const {
      x = 0,
      y = 0,
      w = 1,
      h = 1,
      mapping = null,
    } = options || {};
    const datasetMatches = (
      this.config.coordinationSpace[CoordinationType.DATASET]
        ? Object.entries(this.config.coordinationSpace[CoordinationType.DATASET])
        // eslint-disable-next-line no-unused-vars
          .filter(([scopeName, datasetScope]) => datasetScope.cValue === dataset.dataset.uid)
          .map(([scopeName]) => scopeName)
        : []
    );
    let datasetScope;
    if (datasetMatches.length === 1) {
      [datasetScope] = datasetMatches;
    } else {
      throw new Error('No coordination scope matching the dataset parameter could be found in the coordination space.');
    }
    const coordinationScopes = {
      [CoordinationType.DATASET]: datasetScope,
    };
    const newView = new VitessceConfigView(component, coordinationScopes, x, y, w, h);
    if (mapping) {
      const [etScope] = this.addCoordination(CoordinationType.EMBEDDING_TYPE);
      etScope.setValue(mapping);
      newView.useCoordination(etScope);
    }
    this.config.layout.push(newView);
    return newView;
  }

  /**
   * Get an array of new coordination scope instances corresponding to coordination types
   * of interest.
   * @param {...string} args A variable number of coordination type names.
   * @returns {VitessceConfigCoordinationScope[]} An array of coordination scope instances.
   */
  addCoordination(...args) {
    const cTypes = args;
    const result = [];
    cTypes.forEach((cType) => {
      const prevScopes = (
        this.config.coordinationSpace[cType]
          ? Object.keys(this.config.coordinationSpace[cType])
          : []
      );
      const scope = new VitessceConfigCoordinationScope(cType, getNextScope(prevScopes));
      if (!this.config.coordinationSpace[scope.cType]) {
        this.config.coordinationSpace[scope.cType] = {};
      }
      this.config.coordinationSpace[scope.cType][scope.cScope] = scope;
      result.push(scope);
    });
    return result;
  }

  /**
   * Initialize a new meta coordination scope in the coordination space,
   * and get a reference to it in the form of a meta coordination scope instance.
   * @returns {VitessceConfigMetaCoordinationScope} A new meta coordination scope instance.
   */
  addMetaCoordination() {
    const prevMetaScopes = (
      this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES]
        ? Object.keys(this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES])
        : []
    );
    const prevMetaByScopes = (
      this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY]
        ? Object.keys(this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY])
        : []
    );
    const metaContainer = new VitessceConfigMetaCoordinationScope(
      getNextScope(prevMetaScopes),
      getNextScope(prevMetaByScopes),
    );
    if (!this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES]) {
      this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES] = {};
    }
    if (!this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY]) {
      this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY] = {};
    }
    // eslint-disable-next-line max-len
    this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES][metaContainer.metaScope.cScope] = metaContainer.metaScope;
    // eslint-disable-next-line max-len
    this.config.coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY][metaContainer.metaByScope.cScope] = metaContainer.metaByScope;
    return metaContainer;
  }

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
  addCoordinationByObject(input) {
    /*
      // The value for `input` might look like:
      {
        [CoordinationType.SPATIAL_IMAGE_LAYER]: CL([
          {
            [CoordinationType.FILE_UID]: 'S-1905-017737_bf',
            [CoordinationType.SPATIAL_LAYER_VISIBLE]: true,
            [CoordinationType.SPATIAL_LAYER_OPACITY]: 1,
            [CoordinationType.SPATIAL_IMAGE_CHANNEL]: CL([
              {
                [CoordinationType.SPATIAL_TARGET_C]: 0,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [255, 0, 0],
              },
              {
                [CoordinationType.SPATIAL_TARGET_C]: 1,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [0, 255, 0],
              },
            ]),
          },
        ]),
        [CoordinationType.SPATIAL_SEGMENTATION_LAYER]: CL([
          {
            [CoordinationType.FILE_UID]: 'S-1905-017737',
            [CoordinationType.SPATIAL_LAYER_VISIBLE]: true,
            [CoordinationType.SPATIAL_LAYER_OPACITY]: 1,
            [CoordinationType.SPATIAL_SEGMENTATION_CHANNEL]: CL([
              {
                [CoordinationType.OBS_TYPE]: 'Cortical Interstitia',
                [CoordinationType.SPATIAL_TARGET_C]: 0,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [255, 0, 0],
              },
              {
                [CoordinationType.OBS_TYPE]: 'Non-Globally Sclerotic Glomeruli',
                [CoordinationType.SPATIAL_TARGET_C]: 1,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [255, 0, 0],
              },
              {
                [CoordinationType.OBS_TYPE]: 'Globally Sclerotic Glomeruli',
                [CoordinationType.SPATIAL_TARGET_C]: 2,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [255, 0, 0],
              },
            ]),
          },
        ]),
      }
      // Which would correspond to this `output`,
      // a valid input for `VitessceConfigMetaCoordinationScope.useCoordinationByObject()`:
      {
        [CoordinationType.SPATIAL_IMAGE_LAYER]: [
          {
            scope: imageLayerScope,
            children: {
              [CoordinationType.FILE_UID]: { scope: imageScope },
              [CoordinationType.SPATIAL_LAYER_VISIBLE]: { scope: imageVisibleScope },
              [CoordinationType.SPATIAL_LAYER_OPACITY]: { scope: imageOpacityScope },
              [CoordinationType.SPATIAL_IMAGE_CHANNEL]: [
                {
                  scope: imageChannelScopeR,
                  children: {
                    [CoordinationType.SPATIAL_TARGET_C]: { scope: rTargetScope },
                    [CoordinationType.SPATIAL_CHANNEL_COLOR]: { scope: rColorScope },
                  },
                },
                {
                  scope: imageChannelScopeG,
                  children: {
                    [CoordinationType.SPATIAL_TARGET_C]: { scope: gTargetScope },
                    [CoordinationType.SPATIAL_CHANNEL_COLOR]: { scope: gColorScope },
                  },
                },
              ],
            },
          },
        ],
        // ...
      }
    */
    const processLevel = (level) => {
      const result = {};
      Object.entries(level).forEach(([cType, nextLevelOrInitialValue]) => {
        // Check if value of object is instanceof CoordinationLevel
        // (otherwise assume it is the coordination value).
        if (nextLevelOrInitialValue instanceof CoordinationLevel) {
          const nextLevel = nextLevelOrInitialValue.value;
          if (nextLevelOrInitialValue.isCached()) {
            result[cType] = nextLevelOrInitialValue.getCached();
          } else if (Array.isArray(nextLevel)) {
            const processedLevel = nextLevel.map((nextEl) => {
              const [dummyScope] = this.addCoordination(cType);
              // TODO: set a better initial value for dummy cases.
              dummyScope.setValue('__dummy__');
              return {
                scope: dummyScope,
                children: processLevel(nextEl),
              };
            });
            nextLevelOrInitialValue.setCached(processedLevel);
            result[cType] = processedLevel;
          } else {
            const nextEl = nextLevel;
            const [dummyScope] = this.addCoordination(cType);
            // TODO: set a better initial value for dummy cases.
            dummyScope.setValue('__dummy__');
            const processedLevel = {
              scope: dummyScope,
              children: processLevel(nextEl),
            };
            nextLevelOrInitialValue.setCached(processedLevel);
            result[cType] = processedLevel;
          }
        } else {
          // Base case.
          const initialValue = nextLevelOrInitialValue;
          if (initialValue instanceof VitessceConfigCoordinationScope) {
            result[cType] = { scope: initialValue };
          } else {
            const [scope] = this.addCoordination(cType);
            scope.setValue(initialValue);
            result[cType] = { scope };
          }
        }
      });
      return result;
    };
    // Begin recursion.
    const output = processLevel(input);
    return output;
  }

  /**
   * A convenience function for setting up new coordination scopes across a set of views.
   * @param {VitessceConfigView[]} views An array of view objects to link together.
   * @param {string[]} cTypes The coordination types on which to coordinate the views.
   * @param {any[]} cValues Initial values corresponding to each coordination type.
   * Should have the same length as the cTypes array. Optional.
   * @returns {VitessceConfig} This, to allow chaining.
   */
  linkViews(views, cTypes, cValues = null) {
    const cScopes = this.addCoordination(...cTypes);
    views.forEach((view) => {
      cScopes.forEach((cScope) => {
        view.useCoordination(cScope);
      });
    });
    if (Array.isArray(cValues) && cValues.length === cTypes.length) {
      cScopes.forEach((cScope, i) => {
        cScope.setValue(cValues[i]);
      });
    }
    return this;
  }

  /**
   * A convenience function for setting up multi-level and meta-coordination scopes
   * across a set of views.
   * @param {VitessceConfigView[]} views An array of view objects to link together.
   * @param {object} input A (potentially nested) object with coordination types as keys
   * and values being either the initial coordination value, a `VitessceConfigCoordinationScope`
   * instance, or a `CoordinationLevel` instance.
   * The CL function takes an array of objects as its argument, and returns a CoordinationLevel
   * instance, to support nesting.
   * @param {boolean} meta Should meta-coordination be used? Optional. By default, true.
   * @returns {VitessceConfig} This, to allow chaining.
   */
  linkViewsByObject(views, input, meta = true) {
    const scopes = this.addCoordinationByObject(input);
    if (meta) {
      const metaScope = this.addMetaCoordination();
      metaScope.useCoordinationByObject(scopes);

      views.forEach((view) => {
        view.useMetaCoordination(metaScope);
      });
    } else {
      views.forEach((view) => {
        view.useCoordinationByObject(scopes);
      });
    }
    return this;
  }

  /**
   * Set the layout of views.
   * @param {VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat} viewConcat A
   * view or a concatenation of views.
   * @returns {VitessceConfig} This, to allow chaining.
   */
  layout(viewConcat) {
    function layoutAux(obj, xMin, xMax, yMin, yMax) {
      const w = xMax - xMin;
      const h = yMax - yMin;
      if (obj instanceof VitessceConfigView) {
        obj.setXYWH(xMin, yMin, w, h);
      } else if (obj instanceof VitessceConfigViewHConcat) {
        const { views } = obj;
        const numViews = views.length;
        views.forEach((view, i) => {
          layoutAux(view, xMin + (w / numViews) * i, xMin + (w / numViews) * (i + 1), yMin, yMax);
        });
      } else if (obj instanceof VitessceConfigViewVConcat) {
        const { views } = obj;
        const numViews = views.length;
        views.forEach((view, i) => {
          layoutAux(view, xMin, xMax, yMin + (h / numViews) * i, yMin + (h / numViews) * (i + 1));
        });
      }
    }

    layoutAux(viewConcat, 0, 12, 0, 12);

    return this;
  }

  /**
   * Convert this instance to a JSON object that can be passed to the Vitessce component.
   * @returns {object} The view config as a JSON object.
   */
  toJSON() {
    return {
      ...this.config,
      datasets: this.config.datasets.map(d => d.toJSON()),
      coordinationSpace: fromEntries(
        Object.entries(this.config.coordinationSpace).map(([cType, cScopes]) => ([
          cType,
          fromEntries(
            Object.entries(cScopes).map(([cScopeName, cScope]) => ([
              cScopeName,
              cScope.cValue,
            ])),
          ),
        ])),
      ),
      layout: this.config.layout.map(c => c.toJSON()),
    };
  }

  /**
   * Create a VitessceConfig instance from an existing view config, to enable
   * manipulation with the JavaScript API.
   * @param {object} config An existing Vitessce view config as a JSON object.
   * @returns {VitessceConfig} A new config instance, with values set to match
   * the config parameter.
   */
  static fromJSON(config) {
    const { name, description, version: schemaVersion } = config;
    const vc = new VitessceConfig({ schemaVersion, name, description });
    config.datasets.forEach((d) => {
      const newDataset = vc.addDataset(d.name, d.description, { uid: d.uid });
      d.files.forEach((f) => {
        newDataset.addFile({
          url: f.url,
          fileType: f.fileType,
          coordinationValues: f.coordinationValues,
          options: f.options,
        });
      });
    });
    Object.keys(config.coordinationSpace).forEach((cType) => {
      if (cType !== CoordinationType.DATASET) {
        const cObj = config.coordinationSpace[cType];
        vc.config.coordinationSpace[cType] = {};
        Object.entries(cObj).forEach(([cScopeName, cScopeValue]) => {
          const scope = new VitessceConfigCoordinationScope(cType, cScopeName);
          scope.setValue(cScopeValue);
          vc.config.coordinationSpace[cType][cScopeName] = scope;
        });
      }
    });
    config.layout.forEach((c) => {
      const newView = new VitessceConfigView(c.component, c.coordinationScopes, c.x, c.y, c.w, c.h);
      vc.config.layout.push(newView);
    });
    return vc;
  }
}
