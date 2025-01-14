
export const GLOBAL_LABELS = ['z', 't'];

export const DEFAULT_RASTER_DOMAIN_TYPE = 'Min/Max';

export const DEFAULT_MOLECULES_LAYER = {
  opacity: 1, radius: 20, visible: true,
};
export const DEFAULT_CELLS_LAYER = {
  opacity: 1, radius: 50, visible: true, stroked: false,
};
export const DEFAULT_NEIGHBORHOODS_LAYER = {
  visible: false,
};

export const DEFAULT_LAYER_TYPE_ORDERING = [
  'molecules',
  'cells',
  'neighborhoods',
  'raster',
];

export const DEFAULT_RASTER_LAYER_PROPS = {
  visible: true,
  colormap: null,
  opacity: 1,
  domainType: DEFAULT_RASTER_DOMAIN_TYPE,
  transparentColor: [0, 0, 0],
  // Importing the full viv package here would add a lot of weight to the bundle
  renderingMode: 'Additive', // viv.RENDERING_MODES.ADDITIVE,
  use3d: false,
};
