/* eslint-disable */

export function getNextScope(prevScopes) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Store the value of the next character for each position in the new string.
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

export function getExistingScopesForCoordinationType(config, coordinationType) {
    const spaceScopes = Object.keys(config.coordinationSpace[coordinationType] || {});
    const componentScopes = config.layout.map(c => c.coordinationScopes[coordinationType]);
    return Array.from(new Set([...spaceScopes, ...componentScopes]));
}


function initializeAuto(config) {
    // Initialize dataset coordination.
    // First, check whether any components are missing a dataset coordination.
    const requiresDatasetCoordination = !config.layout.every(c => c.coordinationScopes?.dataset);

    // Use the first dataset for all un-initialized components.
    if(requiresDatasetCoordination && config.datasets.length >= 1) {
        const firstDatasetId = config.datasets[0].uid;
        const datasetScopeName = getNextScope(getExistingScopesForCoordinationType(config, 'dataset'));
        const newConfig = {
            ...config,
            coordinationSpace: {
                ...config.coordinationSpace,
                dataset: {
                    ...config.coordinationSpace.dataset,
                    [datasetScopeName]: firstDatasetId,
                },
            },
            layout: config.layout.map(c => ({
                ...c,
                coordinationScopes: {
                    ...c.coordinationScopes,
                    dataset: (c.coordinationScopes?.dataset || datasetScopeName),
                },
            })),
        };
        return newConfig;
    }
    return config;
}

function initializeComparison(config) {
    return config;
}


/**
 * Initialize the view config:
 * - Fill in all missing coordination objects with default global values
 * - Fill in all missing component coordination scope mappings
 *   based on the initStrategy view config field.
 * Should be "stable": if run on the same view config twice, the return values should be equal.
 * @param {object} config The view config prop.
 */
export function initialize(config) {
    if(config.initStrategy === "comparison") {
        return initializeComparison(config);
    } else if(config.initStrategy === "auto") {
        return initializeAuto(config);
    } else {
        return config;
    }
}