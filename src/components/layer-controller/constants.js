export const GLOBAL_SLIDER_DIMENSION_FIELDS = ['z', 'time'];

export const DTYPE_VALUES = {
  '<u1': {
    max: (2 ** 8) - 1,
  },
  '<u2': {
    max: (2 ** 16) - 1,
  },
  '<u4': {
    max: (2 ** 32) - 1,
  },
  '<f4': {
    max: (2 ** 31) - 1,
  },
};

export const DEFAULT_LAYER_PROPS = {
  colormap: '',
  opacity: 1,
  colors: [],
  sliders: [],
  visibilities: [],
  selections: [],
};

export const MAX_CHANNELS = 6;
