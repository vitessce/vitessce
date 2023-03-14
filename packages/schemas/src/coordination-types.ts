
import { z } from 'zod';
import { CoordinationType } from '@vitessce/constants-internal';
import { PluginCoordinationType } from '@vitessce/plugins';
import {
  imageLayerObj,
  cellsLayerObj,
  neighborhoodsLayerObj,
  moleculesLayerObj,
} from './spatial-layers';
import { obsSetPath, rgbArray, obsSets } from './shared';

export const COORDINATION_TYPE_SCHEMAS = [
  new PluginCoordinationType(CoordinationType.DATASET, null, z.string()),
  new PluginCoordinationType(CoordinationType.OBS_TYPE, 'cell', z.string()),
  new PluginCoordinationType(CoordinationType.FEATURE_TYPE, 'gene', z.string()),
  new PluginCoordinationType(CoordinationType.FEATURE_VALUE_TYPE, 'expression', z.string()),
  new PluginCoordinationType(CoordinationType.OBS_LABELS_TYPE, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_ZOOM, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_ROTATION, 0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_TARGET_X, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_TARGET_Y, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_TARGET_Z, 0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_TYPE, null, z.string()),
  new PluginCoordinationType(
    CoordinationType.EMBEDDING_OBS_SET_POLYGONS_VISIBLE,
    false,
    z.boolean(),
  ),
  new PluginCoordinationType(CoordinationType.EMBEDDING_OBS_SET_LABELS_VISIBLE, false, z.boolean()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_OBS_SET_LABEL_SIZE, 14, z.number()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_OBS_RADIUS, 1, z.number()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_OBS_OPACITY, 1, z.number()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_OBS_RADIUS_MODE, 'auto', z.enum(['manual', 'auto'])),
  new PluginCoordinationType(CoordinationType.EMBEDDING_OBS_OPACITY_MODE, 'auto', z.enum(['manual', 'auto'])),
  new PluginCoordinationType(CoordinationType.SPATIAL_ZOOM, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_ROTATION, 0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_TARGET_X, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_TARGET_Y, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_TARGET_Z, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_ROTATION_X, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_ROTATION_Y, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_ROTATION_Z, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_ROTATION_ORBIT, 0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_ORBIT_AXIS, 'Y', z.string().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_AXIS_FIXED, false, z.boolean().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_IMAGE_LAYER, null, imageLayerObj.nullable()),
  new PluginCoordinationType(
    CoordinationType.SPATIAL_SEGMENTATION_LAYER,
    null,
    z.union([
      cellsLayerObj, imageLayerObj,
    ]),
  ),
  new PluginCoordinationType(
    CoordinationType.SPATIAL_NEIGHBORHOOD_LAYER,
    null,
    neighborhoodsLayerObj.nullable(),
  ),
  new PluginCoordinationType(
    CoordinationType.SPATIAL_POINT_LAYER,
    null,
    moleculesLayerObj.nullable(),
  ),
  new PluginCoordinationType(CoordinationType.HEATMAP_ZOOM_X, 0, z.number()),
  new PluginCoordinationType(CoordinationType.HEATMAP_ZOOM_Y, 0, z.number()),
  new PluginCoordinationType(CoordinationType.HEATMAP_TARGET_X, 0, z.number()),
  new PluginCoordinationType(CoordinationType.HEATMAP_TARGET_Y, 0, z.number()),
  new PluginCoordinationType(CoordinationType.OBS_FILTER, null, z.array(z.string()).nullable()),
  new PluginCoordinationType(CoordinationType.OBS_HIGHLIGHT, null, z.string().nullable()),
  new PluginCoordinationType(
    CoordinationType.OBS_SET_SELECTION,
    null,
    z.array(obsSetPath).nullable(),
  ),
  new PluginCoordinationType(CoordinationType.OBS_SET_HIGHLIGHT, null, obsSetPath.nullable()),
  new PluginCoordinationType(
    CoordinationType.OBS_SET_COLOR,
    null,
    z.array(z.object({
      path: obsSetPath,
      color: rgbArray,
    })).nullable(),
  ),
  new PluginCoordinationType(
    CoordinationType.OBS_COLOR_ENCODING,
    'cellSetSelection',
    z.enum(['geneSelection', 'cellSetSelection']),
  ),
  new PluginCoordinationType(CoordinationType.FEATURE_FILTER, null, z.array(z.string()).nullable()),
  new PluginCoordinationType(CoordinationType.FEATURE_HIGHLIGHT, null, z.string().nullable()),
  new PluginCoordinationType(
    CoordinationType.FEATURE_SELECTION,
    null,
    z.array(z.string()).nullable(),
  ),
  new PluginCoordinationType(
    CoordinationType.FEATURE_VALUE_TRANSFORM,
    null,
    z.enum(['log1p', 'arcsinh']).nullable(),
  ),
  new PluginCoordinationType(
    CoordinationType.FEATURE_VALUE_TRANSFORM_COEFFICIENT,
    1,
    z.number(),
  ),
  new PluginCoordinationType(
    CoordinationType.FEATURE_VALUE_COLORMAP,
    'plasma',
    z.string().nullable(),
  ),
  new PluginCoordinationType(
    CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    [0.0, 1.0],
    z.array(z.number()).length(2),
  ),
  new PluginCoordinationType(
    CoordinationType.GATING_FEATURE_SELECTION_X,
    null,
    z.string().nullable(),
  ),
  new PluginCoordinationType(
    CoordinationType.GATING_FEATURE_SELECTION_Y,
    null,
    z.string().nullable(),
  ),
  new PluginCoordinationType(CoordinationType.GENOMIC_ZOOM_X, 0, z.number()),
  new PluginCoordinationType(CoordinationType.GENOMIC_ZOOM_Y, 0, z.number()),
  new PluginCoordinationType(CoordinationType.GENOMIC_TARGET_X, 1549999999.5, z.number()),
  new PluginCoordinationType(CoordinationType.GENOMIC_TARGET_Y, 1549999999.5, z.number()),
  new PluginCoordinationType(CoordinationType.ADDITIONAL_OBS_SETS, null, obsSets.nullable()),
  new PluginCoordinationType(CoordinationType.MOLECULE_HIGHLIGHT, null, z.string().nullable()),
];
