/* eslint-disable */
import {
    COORDINATION_TYPES, DEFAULT_COORDINATION_VALUES,
    COMPONENT_COORDINATION_TYPES
} from './state/coordination';

/**
 * Generate a new scope name which does not
 * conflict / overlap with a previous scope name.
 * @param {string[]} prevScopes Previous scope names.
 * @returns {string} The new scope name.
 */
export function getNextScope(prevScopes) {
    // Keep an ordered list of valid characters.
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // Store the value of the next character for each position
    // in the new string.
    // For example, [0] -> "A", [1] -> "B", [0, 1] -> "AB"
    const nextCharIndex = [0];

    // Generate a new scope name,
    // potentially conflicting with an existing name.
    // Reference: https://stackoverflow.com/a/12504061
    function next() {
        const r = [];
        for (const char of nextCharIndex) {
            r.unshift(chars[char]);
        }
        let increment = true;
        for (let i = 0; i < nextCharIndex.length; i++) {
            const val = ++nextCharIndex[i];
            if (val >= chars.length) {
                nextCharIndex[i] = 0;
            } else {
              increment = false;
              break;
            }
        }
        if(increment) {
            nextCharIndex.push(0);
        }
        return r.join('');
    }

    let nextScope;
    do {
        nextScope = next();
    } while(prevScopes.includes(nextScope));
    return nextScope;
}

/**
 * Get a list of all unique scope names for a
 * particular coordination type, which exist in
 * a particular view config.
 * @param {object} config A view config object.
 * @param {string} coordinationType A coordination type,
 * for example 'spatialZoom' or 'dataset'.
 * @returns {string[]} Array of existing coordination scope names.
 */
export function getExistingScopesForCoordinationType(config, coordinationType) {
    const spaceScopes = Object.keys(config.coordinationSpace[coordinationType] || {});
    const componentScopes = config.layout.map(c => c.coordinationScopes?.[coordinationType]);
    return Array.from(new Set([...spaceScopes, ...componentScopes]));
}

/**
 * Give each component the same scope name for this coordination type.
 * @param {object} config A view config object.
 * @param {string} coordinationType A coordination type,
 * for example 'spatialZoom' or 'dataset'.
 * @param {*} scopeValue The initial value for the coordination scope,
 * to set in the coordination space.
 * @returns {object} The new view config.
 */
function coordinateComponentsTogether(config, coordinationType, scopeValue) {
    const scopeName = getNextScope(getExistingScopesForCoordinationType(config, coordinationType));
    const newConfig = {
        ...config,
        coordinationSpace: {
            ...config.coordinationSpace,
            [coordinationType]: {
                ...config.coordinationSpace[coordinationType],
                // Add the new scope name and value to the coordination space.
                [scopeName]: scopeValue,
            },
        },
        layout: config.layout.map(component => ({
            ...component,
            coordinationScopes: {
                ...component.coordinationScopes,
                // Only set the coordination scope if this component uses this coordination type,
                // and the component is missing a coordination scope for this coordination type.
                ...(COMPONENT_COORDINATION_TYPES[component.component].includes(coordinationType) && !component.coordinationScopes?.[coordinationType] ? {
                    // Only set the new scope name if the scope name
                    // for this component and coordination type is currently undefined.
                    [coordinationType]: scopeName,
                } : {}),
            },
        })),
    };
    return newConfig;
}

/**
 * Give each component a different scope name for this coordination type.
 * @param {object} config A view config object.
 * @param {string} coordinationType A coordination type,
 * for example 'spatialZoom' or 'dataset'.
 * @param {*} scopeValue The initial value for the coordination scope,
 * to set in the coordination space.
 * @returns {object} The new view config.
 */
function coordinateComponentsIndependent(config, coordinationType, scopeValue) {
    const newConfig = {
        ...config,
        layout: [...config.layout],
    };
    const newScopes = {};
    newConfig.layout.forEach((component, i) => {
        // Only set the coordination scope if this component uses this coordination type,
        // and the component is missing a coordination scope for this coordination type.
        if(COMPONENT_COORDINATION_TYPES[component.component].includes(coordinationType) && !component.coordinationScopes?.[coordinationType]) {
            const scopeName = getNextScope([...getExistingScopesForCoordinationType(config, coordinationType), ...Object.keys(newScopes)]);
            newScopes[scopeName] = scopeValue;
            newConfig.layout[i] = {
                ...component,
                coordinationScopes: {
                    ...component.coordinationScopes,
                    [coordinationType]: scopeName,
                }
            };
        }
    });
    newConfig.coordinationSpace = {
        ...newConfig.coordinationSpace,
        [coordinationType]: {
            ...newConfig.coordinationSpace[coordinationType],
            // Add the new scope name and value to the coordination space.
            ...newScopes
        },
    }
    return newConfig;
}

function initializeAuto(config) {
    let newConfig = config;

    // The following coordination types should be
    // initialized to independent scopes when
    // initialized automatically.
    const AUTO_INDEPENDENT_COORDINATION_TYPES = [
        COORDINATION_TYPES.SPATIAL_ZOOM,
        COORDINATION_TYPES.SPATIAL_TARGET_X,
        COORDINATION_TYPES.SPATIAL_TARGET_Y,
        COORDINATION_TYPES.SPATIAL_TARGET_Z,
        COORDINATION_TYPES.HEATMAP_ZOOM_X,
        COORDINATION_TYPES.HEATMAP_ZOOM_Y,
        COORDINATION_TYPES.HEATMAP_TARGET_X,
        COORDINATION_TYPES.HEATMAP_TARGET_Y,
        COORDINATION_TYPES.EMBEDDING_ZOOM,
        COORDINATION_TYPES.EMBEDDING_TARGET_X,
        COORDINATION_TYPES.EMBEDDING_TARGET_Y,
        COORDINATION_TYPES.EMBEDDING_TARGET_Z,
    ];

    // For each coordination type, check whether it requires initialization.
    Object.values(COORDINATION_TYPES).forEach((coordinationType) => {
        // A coordination type requires coordination if at least one component is missing 
        const requiresCoordination = !newConfig.layout.every(c => !COMPONENT_COORDINATION_TYPES[c.component].includes(coordinationType) || c.coordinationScopes?.[coordinationType]);
        if(requiresCoordination) {
            // Note that the default value may be undefined.
            let defaultValue = DEFAULT_COORDINATION_VALUES[coordinationType];
            // Check whether this is the special 'dataset' coordination type.
            if(coordinationType === 'dataset' && newConfig.datasets.length >= 1) {
                // Use the first dataset ID as the default
                // if there is at least one dataset.
                defaultValue = newConfig.datasets[0].uid;
            }
            if(AUTO_INDEPENDENT_COORDINATION_TYPES.includes(coordinationType)) {
                newConfig = coordinateComponentsIndependent(newConfig, coordinationType, defaultValue);
            } else {
                newConfig = coordinateComponentsTogether(newConfig, coordinationType, defaultValue);
            }
        }
    });

    return newConfig;
}

function initializeDatasetComparison(config) {
    return config;
}


/**
 * Initialize the view config:
 * - Fill in missing coordination objects with default values.
 * - Fill in missing component coordination scope mappings.
 *   based on the `initStrategy` specified in the view config.
 * Should be "stable": if run on the same view config twice, the return value the second
 * time should be identical to the return value the first time.
 * @param {object} config The view config prop.
 */
export function initialize(config) {
    if(config.initStrategy === "auto") {
        return initializeAuto(config);
    } else if(config.initStrategy === "dataset-comparison") {
        return initializeDatasetComparison(config);
    } else {
        return config;
    }
}

export function upgrade(config) {
    const coordinationSpace = {
        embeddingType: {},
        embeddingZoom: {},
        embeddingTargetX: {},
        embeddingTargetY: {},
        spatialZoom: {},
        spatialTargetX: {},
        spatialTargetY: {},
    };
    
    config.staticLayout.forEach((component, i) => {
        if(component.component === "scatterplot") {
            // Need to set up the coordinationSpace
            // with embeddingType to replace scatterplot
            // component prop "mapping".
            if(component.props.mapping) {
                coordinationSpace.embeddingType[component.props.mapping] = component.props.mapping;
                config.staticLayout[i] = {
                    ...component,
                    coordinationScopes: {
                        embeddingType: component.props.mapping,
                    },
                };
            }
            // Need to set up the coordinationSpace
            // with embeddingZoom / embeddingTargetX/Y to replace scatterplot
            // component prop "view" ({ zoom, target }).
            if(component.props.view) {
                // TODO
            }
        }
        if(component.component === "spatial") {
            // Need to set up the coordinationSpace
            // with spatialZoom / spatialTargetX/Y to replace spatial
            // component prop "view" ({ zoom, target }).
            if(component.props.view) {
                // TODO
            }
        }
    });

    return {
        version: '1.0.0',
        name: config.name,
        description: config.description,
        public: config.public,
        datasets: [
            {
                uid: 'A',
                name: 'A',
                files: config.layers.map(layer => ({
                    type: layer.type.toLowerCase(),
                    fileType: layer.fileType,
                    url: layer.url,
                })),
            }
        ],
        initStrategy: "auto",
        coordinationSpace,
        layout: config.staticLayout,
    };
}
