// Conversion factors from physical length units to meters.
// 'µm' can be either of these: U+00B5 (micro sign), U+03BC (Greek small letter mu).
export const UNIT_TO_METERS: Record<string, number> = {
  m: 1,
  meter: 1,
  mm: 1e-3,
  millimeter: 1e-3,
  um: 1e-6,
  µm: 1e-6,
  μm: 1e-6,
  micrometer: 1e-6,
  micron: 1e-6,
  nm: 1e-9,
  nanometer: 1e-9,
};
