/* eslint-disable max-len */
import type { ComponentType } from 'react';
import {
  FileType,
  DataType,
  ViewType,
  CoordinationType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import {
  PluginFileType,
  PluginJointFileType,
  PluginViewType,
  PluginCoordinationType,
  DataLoader,
  DataSource,
} from '@vitessce/plugins';
import {
  z,
  obsEmbeddingCsvSchema,
  obsSetsCsvSchema,
  obsLocationsCsvSchema,
  obsLabelsCsvSchema,
  featureLabelsCsvSchema,
  obsSetsAnndataSchema,
  obsEmbeddingAnndataSchema,
  obsLocationsAnndataSchema,
  obsLabelsAnndataSchema,
  obsFeatureMatrixAnndataSchema,
  obsSegmentationsAnndataSchema,
  featureLabelsAnndataSchema,
  rasterJsonSchema,
  anndataZarrSchema,
  anndataCellsZarrSchema,
  anndataCellSetsZarrSchema,
  anndataExpressionMatrixZarrSchema,
  cellsJsonSchema,
  imageOmeZarrSchema,
  imageOmeTiffSchema,
  obsSetPath,
  rgbArray,
  obsSetsSchema,
  imageLayerObj,
  cellsLayerObj,
  neighborhoodsLayerObj,
  moleculesLayerObj,
} from '@vitessce/schemas';

// Register view type plugins
import { DescriptionSubscriber } from '@vitessce/description';
import { ObsSetsManagerSubscriber } from '@vitessce/obs-sets-manager';
import { EmbeddingScatterplotSubscriber } from '@vitessce/scatterplot-embedding';
import { GatingSubscriber } from '@vitessce/scatterplot-gating';
import { SpatialSubscriber } from '@vitessce/spatial';
import { HeatmapSubscriber } from '@vitessce/heatmap';
import { FeatureListSubscriber } from '@vitessce/feature-list';
import { LayerControllerSubscriber } from '@vitessce/layer-controller';
import { StatusSubscriber } from '@vitessce/status';
import { HiGlassSubscriber, GenomicProfilesSubscriber } from '@vitessce/genomic-profiles';
import {
  CellSetExpressionPlotSubscriber,
  CellSetSizesPlotSubscriber,
  ExpressionHistogramSubscriber,
} from '@vitessce/statistical-plots';

// Register file type plugins
import {
  // CSV
  CsvSource,
  ObsSetsCsvLoader,
  ObsEmbeddingCsvLoader,
  ObsLocationsCsvLoader,
  ObsLabelsCsvLoader,
  ObsFeatureMatrixCsvLoader,
  FeatureLabelsCsvLoader,
} from '@vitessce/csv';
import {
  // JSON
  JsonSource,
  JsonLoader,
  ObsSegmentationsJsonLoader,
  ObsSetsJsonLoader,
  // Legacy
  RasterJsonAsImageLoader,
  RasterJsonAsObsSegmentationsLoader,
  ClustersJsonAsObsFeatureMatrixLoader,
  GenesJsonAsObsFeatureMatrixLoader,
  CellsJsonAsObsLabelsLoader,
  CellsJsonAsObsEmbeddingLoader,
  CellsJsonAsObsLocationsLoader,
  CellsJsonAsObsSegmentationsLoader,
  MoleculesJsonAsObsLocationsLoader,
  MoleculesJsonAsObsLabelsLoader,
} from '@vitessce/json';
import {
  // AnnData
  AnnDataSource,
  ObsFeatureMatrixAnndataLoader,
  ObsEmbeddingAnndataLoader,
  ObsLocationsAnndataLoader,
  ObsSegmentationsAnndataLoader,
  ObsSetsAnndataLoader,
  ObsLabelsAnndataLoader,
  FeatureLabelsAnndataLoader,
  // MuData
  MuDataSource,
  // OME
  OmeZarrLoader,
  // Legacy
  ZarrDataSource,
  MatrixZarrAsObsFeatureMatrixLoader,
  GenomicProfilesZarrLoader,
} from '@vitessce/zarr';
import {
  OmeTiffAsObsSegmentationsLoader,
  OmeTiffLoader,
  OmeTiffSource,
} from '@vitessce/ome-tiff';

// Joint file types
import {
  expandAnndataZarr,
} from './joint-file-types';
import {
  expandAnndataCellSetsZarr,
  expandAnndataCellsZarr,
  expandAnndataExpressionMatrixZarr,
  expandCellSetsJson,
  expandCellsJson,
  expandClustersJson,
  expandExpressionMatrixZarr,
  expandGenesJson,
  expandMoleculesJson,
  expandRasterJson,
  expandRasterOmeZarr,
} from './joint-file-types-legacy';

// Helper function to use COMPONENT_COORDINATION_TYPES.
function makeViewType(name: string, component: any) {
  return new PluginViewType(name, component as ComponentType, COMPONENT_COORDINATION_TYPES[name]);
}

function makeFileType(name: string, dataType: string, dataLoaderClass: any, dataSourceClass: any, optionsSchema: z.ZodTypeAny) {
  return new PluginFileType(name, dataType, dataLoaderClass as DataLoader, dataSourceClass as DataSource, optionsSchema);
}

export const baseViewTypes = [
  makeViewType(ViewType.DESCRIPTION, DescriptionSubscriber),
  makeViewType(ViewType.OBS_SETS, ObsSetsManagerSubscriber),
  makeViewType(ViewType.SCATTERPLOT, EmbeddingScatterplotSubscriber),
  makeViewType(ViewType.GATING, GatingSubscriber),
  makeViewType(ViewType.SPATIAL, SpatialSubscriber),
  makeViewType(ViewType.HEATMAP, HeatmapSubscriber),
  makeViewType(ViewType.FEATURE_LIST, FeatureListSubscriber),
  makeViewType(ViewType.LAYER_CONTROLLER, LayerControllerSubscriber),
  makeViewType(ViewType.STATUS, StatusSubscriber),
  makeViewType(ViewType.OBS_SET_FEATURE_VALUE_DISTRIBUTION, CellSetExpressionPlotSubscriber),
  makeViewType(ViewType.OBS_SET_SIZES, CellSetSizesPlotSubscriber),
  makeViewType(ViewType.FEATURE_VALUE_HISTOGRAM, ExpressionHistogramSubscriber),
  makeViewType('higlass', HiGlassSubscriber),
  makeViewType(ViewType.GENOMIC_PROFILES, GenomicProfilesSubscriber),
];

export const baseFileTypes = [
  // All CSV file types
  makeFileType(FileType.OBS_SETS_CSV, DataType.OBS_SETS, ObsSetsCsvLoader, CsvSource, obsSetsCsvSchema),
  makeFileType(FileType.OBS_EMBEDDING_CSV, DataType.OBS_EMBEDDING, ObsEmbeddingCsvLoader, CsvSource, obsEmbeddingCsvSchema),
  makeFileType(FileType.OBS_LOCATIONS_CSV, DataType.OBS_LOCATIONS, ObsLocationsCsvLoader, CsvSource, obsLocationsCsvSchema),
  makeFileType(FileType.OBS_LABELS_CSV, DataType.OBS_LABELS, ObsLabelsCsvLoader, CsvSource, obsLabelsCsvSchema),
  makeFileType(FileType.OBS_FEATURE_MATRIX_CSV, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixCsvLoader, CsvSource, z.null()),
  makeFileType(FileType.FEATURE_LABELS_CSV, DataType.FEATURE_LABELS, FeatureLabelsCsvLoader, CsvSource, featureLabelsCsvSchema),
  // All JSON file types
  makeFileType(FileType.OBS_SEGMENTATIONS_JSON, DataType.OBS_SEGMENTATIONS, ObsSegmentationsJsonLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_SETS_JSON, DataType.OBS_SETS, ObsSetsJsonLoader, JsonSource, z.null()),
  // All AnnData file types
  makeFileType(FileType.OBS_SETS_ANNDATA_ZARR, DataType.OBS_SETS, ObsSetsAnndataLoader, AnnDataSource, obsSetsAnndataSchema),
  makeFileType(FileType.OBS_EMBEDDING_ANNDATA_ZARR, DataType.OBS_EMBEDDING, ObsEmbeddingAnndataLoader, AnnDataSource, obsEmbeddingAnndataSchema),
  makeFileType(FileType.OBS_LOCATIONS_ANNDATA_ZARR, DataType.OBS_LOCATIONS, ObsLocationsAnndataLoader, AnnDataSource, obsLocationsAnndataSchema),
  makeFileType(FileType.OBS_LABELS_ANNDATA_ZARR, DataType.OBS_LABELS, ObsLabelsAnndataLoader, AnnDataSource, obsLabelsAnndataSchema),
  makeFileType(FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixAnndataLoader, AnnDataSource, obsFeatureMatrixAnndataSchema),
  makeFileType(FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR, DataType.OBS_SEGMENTATIONS, ObsSegmentationsAnndataLoader, AnnDataSource, obsSegmentationsAnndataSchema),
  makeFileType(FileType.FEATURE_LABELS_ANNDATA_ZARR, DataType.FEATURE_LABELS, FeatureLabelsAnndataLoader, AnnDataSource, featureLabelsAnndataSchema),
  // All MuData file types
  makeFileType(FileType.OBS_SETS_MUDATA_ZARR, DataType.OBS_SETS, ObsSetsAnndataLoader, MuDataSource, obsSetsAnndataSchema),
  makeFileType(FileType.OBS_EMBEDDING_MUDATA_ZARR, DataType.OBS_EMBEDDING, ObsEmbeddingAnndataLoader, MuDataSource, obsEmbeddingAnndataSchema),
  makeFileType(FileType.OBS_LOCATIONS_MUDATA_ZARR, DataType.OBS_LOCATIONS, ObsLocationsAnndataLoader, MuDataSource, obsLocationsAnndataSchema),
  makeFileType(FileType.OBS_LABELS_MUDATA_ZARR, DataType.OBS_LABELS, ObsLabelsAnndataLoader, MuDataSource, obsLabelsAnndataSchema),
  makeFileType(FileType.OBS_FEATURE_MATRIX_MUDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixAnndataLoader, MuDataSource, obsFeatureMatrixAnndataSchema),
  makeFileType(FileType.OBS_SEGMENTATIONS_MUDATA_ZARR, DataType.OBS_SEGMENTATIONS, ObsSegmentationsAnndataLoader, MuDataSource, obsSegmentationsAnndataSchema),
  makeFileType(FileType.FEATURE_LABELS_MUDATA_ZARR, DataType.FEATURE_LABELS, FeatureLabelsAnndataLoader, MuDataSource, featureLabelsAnndataSchema),
  // All OME file types
  makeFileType(FileType.IMAGE_OME_ZARR, DataType.IMAGE, OmeZarrLoader, ZarrDataSource, imageOmeZarrSchema),
  makeFileType(FileType.IMAGE_OME_TIFF, DataType.IMAGE, OmeTiffLoader, OmeTiffSource, imageOmeTiffSchema),
  makeFileType(FileType.OBS_SEGMENTATIONS_OME_TIFF, DataType.OBS_SEGMENTATIONS, OmeTiffAsObsSegmentationsLoader, OmeTiffSource, imageOmeZarrSchema),
  // All legacy file types
  makeFileType(FileType.OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR, DataType.OBS_FEATURE_MATRIX, MatrixZarrAsObsFeatureMatrixLoader, ZarrDataSource, z.null()),
  makeFileType(FileType.IMAGE_RASTER_JSON, DataType.IMAGE, RasterJsonAsImageLoader, JsonSource, rasterJsonSchema),
  makeFileType(FileType.OBS_SEGMENTATIONS_RASTER_JSON, DataType.OBS_SEGMENTATIONS, RasterJsonAsObsSegmentationsLoader, JsonSource, rasterJsonSchema),
  makeFileType(FileType.OBS_SETS_CELL_SETS_JSON, DataType.OBS_SETS, ObsSetsJsonLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_FEATURE_MATRIX_CLUSTERS_JSON, DataType.OBS_FEATURE_MATRIX, ClustersJsonAsObsFeatureMatrixLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_FEATURE_MATRIX_GENES_JSON, DataType.OBS_FEATURE_MATRIX, GenesJsonAsObsFeatureMatrixLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_LABELS_CELLS_JSON, DataType.OBS_LABELS, CellsJsonAsObsLabelsLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_EMBEDDING_CELLS_JSON, DataType.OBS_EMBEDDING, CellsJsonAsObsEmbeddingLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_LOCATIONS_CELLS_JSON, DataType.OBS_LOCATIONS, CellsJsonAsObsLocationsLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_SEGMENTATIONS_CELLS_JSON, DataType.OBS_SEGMENTATIONS, CellsJsonAsObsSegmentationsLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_LOCATIONS_MOLECULES_JSON, DataType.OBS_LOCATIONS, MoleculesJsonAsObsLocationsLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_LABELS_MOLECULES_JSON, DataType.OBS_LABELS, MoleculesJsonAsObsLabelsLoader, JsonSource, z.null()),
  makeFileType(FileType.NEIGHBORHOODS_JSON, DataType.NEIGHBORHOODS, JsonLoader, JsonSource, z.null()),
  makeFileType(FileType.GENOMIC_PROFILES_ZARR, DataType.GENOMIC_PROFILES, GenomicProfilesZarrLoader, ZarrDataSource, z.null()),
];

export const baseJointFileTypes = [
  new PluginJointFileType(FileType.ANNDATA_ZARR, expandAnndataZarr, anndataZarrSchema),
  // For legacy file types:
  new PluginJointFileType(FileType.ANNDATA_CELLS_ZARR, expandAnndataCellsZarr, anndataCellsZarrSchema),
  new PluginJointFileType(FileType.ANNDATA_CELL_SETS_ZARR, expandAnndataCellSetsZarr, anndataCellSetsZarrSchema),
  new PluginJointFileType(FileType.ANNDATA_EXPRESSION_MATRIX_ZARR, expandAnndataExpressionMatrixZarr, anndataExpressionMatrixZarrSchema),
  new PluginJointFileType(FileType.EXPRESSION_MATRIX_ZARR, expandExpressionMatrixZarr, z.null()),
  new PluginJointFileType(FileType.RASTER_JSON, expandRasterJson, rasterJsonSchema),
  new PluginJointFileType(FileType.RASTER_OME_ZARR, expandRasterOmeZarr, z.null()),
  new PluginJointFileType(FileType.CELL_SETS_JSON, expandCellSetsJson, z.null()),
  new PluginJointFileType(FileType.CLUSTERS_JSON, expandClustersJson, z.null()),
  new PluginJointFileType(FileType.GENES_JSON, expandGenesJson, z.null()),
  new PluginJointFileType(FileType.CELLS_JSON, expandCellsJson, cellsJsonSchema),
  new PluginJointFileType(FileType.MOLECULES_JSON, expandMoleculesJson, z.null()),
];

export const baseCoordinationTypes = [
  new PluginCoordinationType(CoordinationType.DATASET, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.OBS_TYPE, 'cell', z.string()),
  new PluginCoordinationType(CoordinationType.FEATURE_TYPE, 'gene', z.string()),
  new PluginCoordinationType(CoordinationType.FEATURE_VALUE_TYPE, 'expression', z.string()),
  new PluginCoordinationType(CoordinationType.OBS_LABELS_TYPE, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_ZOOM, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_ROTATION, 0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_TARGET_X, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_TARGET_Y, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_TARGET_Z, 0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_TYPE, null, z.string().nullable()),
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
    ]).nullable(),
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
  new PluginCoordinationType(CoordinationType.ADDITIONAL_OBS_SETS, null, obsSetsSchema.nullable()),
  new PluginCoordinationType(CoordinationType.MOLECULE_HIGHLIGHT, null, z.string().nullable()),
];
