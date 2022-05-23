/**
 * Old constant values with deprecation log messages.
 * Values should be tuples like [oldValue, deprecationMessage].
 */
export const Component = {};

export const DataType = {};

export const FileType = {};

export const CoordinationType = {
  SPATIAL_LAYERS: [
    'spatialLayers',
    'The spatialLayers coordination type was split into multiple coordination types in view config schema version 1.0.1',
  ],
  SPATIAL_RASTER_LAYERS: [
    'spatialRasterLayers',
    'The spatialRasterLayers coordination type was changed to spatialRasterLayer (singular) in view config schema version 1.0.11',
  ],
  SPATIAL_CELLS_LAYER: [
    'spatialCellsLayer',
    'The spatialCellsLayer coordination type was changed to spatialSegmentationLayer in view config schema version 1.0.11',
  ],
  SPATIAL_MOLECULES_LAYER: [
    'spatialMoleculesLayer',
    'The spatialCellsLayer coordination type was changed to spatialPointLayer in view config schema version 1.0.11',
  ],
  SPATIAL_NEIGHBORHOODS_LAYER: [
    'spatialNeighborhoodsLayer',
    'The spatialNeighborhoodsLayer coordination type was changed to spatialNeighborhoodLayer in view config schema version 1.0.11',
  ],
};
