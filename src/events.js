const ADD = '.add';

export const CLEAR_PLEASE_WAIT = 'clear_please_wait';

export const VIEW_INFO = 'view.info';

export const CELLS = 'cells';
export const CELLS_ADD = CELLS + ADD;
// Selection by the user via rectangle or polygon tool.
export const CELLS_SELECTION = `${CELLS}.selection`;
export const CELLS_COLOR = `${CELLS}.color`;
export const CELLS_HOVER = `${CELLS}.hover`;

export const CELL_SETS = `${CELLS}.sets`;
export const CELL_SETS_ADD = CELL_SETS + ADD;
// Modifications to the cell set tree structure.
export const CELL_SETS_MODIFY = `${CELL_SETS}.modify`;
// Viewing a previously-defined set or group of sets.
export const CELL_SETS_VIEW = `${CELL_SETS}.view`;

export const CLUSTERS = 'clusters';
export const CLUSTERS_ADD = CLUSTERS + ADD;

export const FACTORS = 'factors';
export const FACTORS_ADD = FACTORS + ADD;

export const GENES = 'genes';
export const GENES_ADD = GENES + ADD;

export const MOLECULES = 'molecules';
export const MOLECULES_ADD = MOLECULES + ADD;

export const NEIGHBORHOODS = 'neighborhoods';
export const NEIGHBORHOODS_ADD = NEIGHBORHOODS + ADD;

export const STATUS = 'status';
export const STATUS_WARN = `${STATUS}.warn`;
export const STATUS_INFO = `${STATUS}.info`;

export const RASTER = 'raster';
export const RASTER_ADD = RASTER + ADD;

export const LAYER = 'layer';
export const LAYER_ADD = LAYER + ADD;
export const LAYER_REMOVE = `${LAYER}.remove`;
export const LAYER_CHANGE = `${LAYER}.change`;
