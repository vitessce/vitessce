/**
 * Mapping from file types to data types. Each file type
 * should correspond to one data type. Multiple file types
 * can map onto the same data type.
 */
export declare const FILE_TYPE_DATA_TYPE_MAPPING: {
    [x: string]: string;
};
/**
 * Store a mapping from data types to the coordination types used
 * for matching using the coordinationValues field of file definitions.
 * This enables inferring default values, simplifying view config writing.
 */
export declare const DATA_TYPE_COORDINATION_VALUE_USAGE: {
    [x: string]: string[];
};
export declare const ALT_ZARR_STORE_TYPES: {
    [x: string]: {
        zip: string;
    };
};
//# sourceMappingURL=constant-relationships.d.ts.map