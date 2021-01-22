export const GLOBAL_SLIDER_DIMENSION_FIELDS = ['z', 'time'];

export const DEFAULT_RASTER_DOMAIN_TYPE = 'Min/Max';

export const DEFAULT_RASTER_LAYER_PROPS = {
  colormap: null,
  opacity: 1,
  domainType: DEFAULT_RASTER_DOMAIN_TYPE,
  transparentColor: [0, 0, 0],
};

export const DEFAULT_MOLECULES_LAYER = {
  type: 'molecules', opacity: 1, radius: 20, visible: true,
};
export const DEFAULT_CELLS_LAYER = {
  type: 'cells', opacity: 1, radius: 50, visible: true, stroked: false,
};
export const DEFAULT_NEIGHBORHOODS_LAYER = {
  type: 'neighborhoods', visible: false,
};

export const DEFAULT_LAYER_TYPE_ORDERING = [
  'molecules',
  'cells',
  'neighborhoods',
  'raster',
];
