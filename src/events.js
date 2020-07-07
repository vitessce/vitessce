const ADD = '.add';
const CHANGE = '.change';
const REMOVE = '.remove';

export const RESET = 'reset';
export const CLEAR_PLEASE_WAIT = 'clear_please_wait';

export const VIEW_INFO = 'view.info';
export const GRID_RESIZE = 'grid.resize';

export const CELLS = 'cells';
export const CELLS_ADD = CELLS + ADD;
// Selection by the user via rectangle or polygon tool.
export const CELLS_SELECTION = `${CELLS}.selection`;
export const CELLS_COLOR = `${CELLS}.color`;
export const CELLS_HOVER = `${CELLS}.hover`;
export const CELLS_OPACITY = `${CELLS}.opacity`;

export const CELL_SETS = `${CELLS}.sets`;
export const CELL_SETS_ADD = CELL_SETS + ADD;
export const CELL_SETS_CHANGE = CELL_SETS + CHANGE;
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
export const LAYER_REMOVE = LAYER + REMOVE;
export const LAYER_CHANGE = LAYER + CHANGE;

export const METADATA = 'metadata';
export const METADATA_ADD = METADATA + ADD;
export const METADATA_REMOVE = METADATA + REMOVE;
