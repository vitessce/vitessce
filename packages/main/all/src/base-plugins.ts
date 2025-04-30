/* eslint-disable max-len */
import type { ComponentType } from 'react';
import {
  FileType,
  DataType,
  ViewType,
  CoordinationType,
  AsyncFunctionType,
  COMPONENT_COORDINATION_TYPES,
  ALT_ZARR_STORE_TYPES,
} from '@vitessce/constants-internal';
import {
  PluginFileType,
  PluginJointFileType,
  PluginViewType,
  PluginCoordinationType,
  PluginAsyncFunction,
} from '@vitessce/plugins';
import type {
  DataLoader,
  DataSource,
} from '@vitessce/plugins';
import {
  z,
  obsEmbeddingCsvSchema,
  obsSetsCsvSchema,
  obsSpotsCsvSchema,
  obsPointsCsvSchema,
  obsLocationsCsvSchema,
  obsLabelsCsvSchema,
  featureLabelsCsvSchema,
  sampleSetsCsvSchema,
  obsSetsAnndataSchema,
  sampleSetsAnndataSchema,
  obsEmbeddingAnndataSchema,
  obsSpotsAnndataSchema,
  obsPointsAnndataSchema,
  obsLocationsAnndataSchema,
  obsLabelsAnndataSchema,
  obsFeatureMatrixAnndataSchema,
  obsFeatureColumnsAnndataSchema,
  obsSegmentationsAnndataSchema,
  featureLabelsAnndataSchema,
  sampleEdgesAnndataSchema,
  comparisonMetadataAnndataSchema,
  featureStatsAnndataSchema,
  featureSetStatsAnndataSchema,
  obsSetStatsAnndataSchema,
  rasterJsonSchema,
  anndataZarrSchema,
  anndataH5adSchema,
  spatialdataZarrSchema,
  anndataCellsZarrSchema,
  anndataCellSetsZarrSchema,
  anndataExpressionMatrixZarrSchema,
  cellsJsonSchema,
  imageOmeZarrSchema,
  imageOmeTiffSchema,
  imageSpatialdataSchema,
  obsSegmentationsOmeTiffSchema,
  obsSegmentationsOmeZarrSchema,
  obsSegmentationsSpatialdataSchema,
  obsFeatureMatrixSpatialdataSchema,
  obsSpotsSpatialdataSchema,
  obsSetsSpatialdataSchema,
  obsSetPath,
  rgbArray,
  obsSetsSchema,
  imageLayerObj,
  cellsLayerObj,
  neighborhoodsLayerObj,
  moleculesLayerObj,
  meshGlbSchema,
} from '@vitessce/schemas';

// Register view type plugins
import { DescriptionSubscriber } from '@vitessce/description';
import { ObsSetsManagerSubscriber } from '@vitessce/obs-sets-manager';
import {
  EmbeddingScatterplotSubscriber,
  DualEmbeddingScatterplotSubscriber,
} from '@vitessce/scatterplot-embedding';
import { GatingSubscriber } from '@vitessce/scatterplot-gating';
import { SpatialSubscriber } from '@vitessce/spatial';
import { SpatialBetaSubscriber } from '@vitessce/spatial-beta';
import { HeatmapSubscriber } from '@vitessce/heatmap';
import { FeatureListSubscriber } from '@vitessce/feature-list';
import { LayerControllerSubscriber } from '@vitessce/layer-controller';
import { LayerControllerBetaSubscriber } from '@vitessce/layer-controller-beta';
import { LinkControllerSubscriber } from '@vitessce/link-controller';
import { StatusSubscriber } from '@vitessce/status';
import { HiGlassSubscriber, GenomicProfilesSubscriber } from '@vitessce/genomic-profiles';
import { NeuroglancerSubscriber } from '@vitessce/neuroglancer';
import {
  CellSetExpressionPlotSubscriber,
  CellSetSizesPlotSubscriber,
  ExpressionHistogramSubscriber,
  DotPlotSubscriber,
  FeatureBarPlotSubscriber,
  TreemapSubscriber,
  VolcanoPlotSubscriber,
  FeatureStatsTableSubscriber,
  CellSetCompositionBarPlotSubscriber,
  FeatureSetEnrichmentBarPlotSubscriber,
} from '@vitessce/statistical-plots';

// Register file type plugins
import {
  // CSV
  CsvSource,
  ObsSetsCsvLoader,
  ObsEmbeddingCsvLoader,
  ObsSpotsCsvLoader,
  ObsPointsCsvLoader,
  ObsLocationsCsvLoader,
  ObsLabelsCsvLoader,
  ObsFeatureMatrixCsvLoader,
  FeatureLabelsCsvLoader,
  SampleSetsCsvLoader,
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
  ObsFeatureColumnsAnndataLoader,
  ObsEmbeddingAnndataLoader,
  ObsSpotsAnndataLoader,
  ObsPointsAnndataLoader,
  ObsLocationsAnndataLoader,
  ObsSegmentationsAnndataLoader,
  ObsSetsAnndataLoader,
  ObsLabelsAnndataLoader,
  FeatureLabelsAnndataLoader,
  SampleEdgesAnndataLoader,
  SampleSetsAnndataLoader,
  ComparisonMetadataAnndataLoader,
  FeatureStatsAnndataLoader,
  FeatureSetStatsAnndataLoader,
  ObsSetStatsAnndataLoader,
  // MuData
  MuDataSource,
  // Legacy
  ZarrDataSource,
  MatrixZarrAsObsFeatureMatrixLoader,
  GenomicProfilesZarrLoader,
} from '@vitessce/zarr';

import {
  // OME
  OmeZarrLoader,
  OmeZarrAsObsSegmentationsLoader,
  // SpatialData
  SpatialDataTableSource,
  SpatialDataShapesSource,
  SpatialDataImageLoader,
  SpatialDataLabelsLoader,
  SpatialDataObsSpotsLoader,
  SpatialDataObsSetsLoader,
} from '@vitessce/spatial-zarr';

import {
  OmeTiffAsObsSegmentationsLoader,
  OmeTiffLoader,
  OmeTiffSource,
} from '@vitessce/ome-tiff';
import {
  GlbSource,
  GlbLoader,
} from '@vitessce/glb';

// Joint file types
import {
  BiomarkerSelectSubscriber,
  ComparativeHeadingSubscriber,
  SampleSetPairManagerSubscriber,
  autocompleteFeature,
  transformFeature,
  getAlternativeTerms,
  getTermMapping,
} from '@vitessce/biomarker-select';
import {
  expandAnndataZarr,
  expandSpatialdataZarr,
} from './joint-file-types.js';
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
} from './joint-file-types-legacy.js';

// Biomarker select UI and default async functions.

// Helper function to use COMPONENT_COORDINATION_TYPES.
function makeViewType(name: string, component: any) {
  return new PluginViewType(name, component as ComponentType, COMPONENT_COORDINATION_TYPES[name]);
}

function makeFileType<T1 extends DataLoader, T2 extends DataSource>(name: string, dataType: string, dataLoaderClass: any, dataSourceClass: any, optionsSchema: z.ZodTypeAny) {
  return new PluginFileType(name, dataType, dataLoaderClass as T1, dataSourceClass as T2, optionsSchema);
}
// For when we have multiple file types with the same data type and options schema.
function makeZarrFileTypes<T1 extends DataLoader, T2 extends DataSource>(name: string, dataType: string, dataLoaderClass: any, dataSourceClass: any, optionsSchema: z.ZodObject<any>) {
  const altFileTypes = ALT_ZARR_STORE_TYPES[name];
  return [
    new PluginFileType(name, dataType, dataLoaderClass as T1, dataSourceClass as T2, optionsSchema),
    ...Object.entries(altFileTypes).map(([key, fileType]) => {
      const extendedOptionsSchema = key === 'h5ad' ? optionsSchema.extend({
        refSpecUrl: z.string(),
      }) : optionsSchema;
      return new PluginFileType(fileType, dataType, dataLoaderClass as T1, dataSourceClass as T2, extendedOptionsSchema);
    }),
  ];
}

export const baseViewTypes = [
  makeViewType(ViewType.DESCRIPTION, DescriptionSubscriber),
  makeViewType(ViewType.OBS_SETS, ObsSetsManagerSubscriber),
  makeViewType(ViewType.SCATTERPLOT, EmbeddingScatterplotSubscriber),
  makeViewType(ViewType.DUAL_SCATTERPLOT, DualEmbeddingScatterplotSubscriber),
  makeViewType(ViewType.GATING, GatingSubscriber),
  makeViewType(ViewType.SPATIAL, SpatialSubscriber),
  makeViewType(ViewType.SPATIAL_BETA, SpatialBetaSubscriber),
  makeViewType(ViewType.HEATMAP, HeatmapSubscriber),
  makeViewType(ViewType.FEATURE_LIST, FeatureListSubscriber),
  makeViewType(ViewType.LAYER_CONTROLLER, LayerControllerSubscriber),
  makeViewType(ViewType.LAYER_CONTROLLER_BETA, LayerControllerBetaSubscriber),
  makeViewType(ViewType.STATUS, StatusSubscriber),
  makeViewType(ViewType.OBS_SET_FEATURE_VALUE_DISTRIBUTION, CellSetExpressionPlotSubscriber),
  makeViewType(ViewType.OBS_SET_SIZES, CellSetSizesPlotSubscriber),
  makeViewType(ViewType.FEATURE_VALUE_HISTOGRAM, ExpressionHistogramSubscriber),
  makeViewType(ViewType.FEATURE_BAR_PLOT, FeatureBarPlotSubscriber),
  makeViewType('higlass', HiGlassSubscriber),
  makeViewType(ViewType.GENOMIC_PROFILES, GenomicProfilesSubscriber),
  makeViewType(ViewType.DOT_PLOT, DotPlotSubscriber),
  makeViewType(ViewType.VOLCANO_PLOT, VolcanoPlotSubscriber),
  makeViewType(ViewType.FEATURE_STATS_TABLE, FeatureStatsTableSubscriber),
  makeViewType(ViewType.BIOMARKER_SELECT, BiomarkerSelectSubscriber),
  makeViewType(ViewType.LINK_CONTROLLER, LinkControllerSubscriber),
  makeViewType(ViewType.NEUROGLANCER, NeuroglancerSubscriber),
  makeViewType(ViewType.TREEMAP, TreemapSubscriber),
  makeViewType(ViewType.COMPARATIVE_HEADING, ComparativeHeadingSubscriber),
  makeViewType(ViewType.SAMPLE_SET_PAIR_MANAGER, SampleSetPairManagerSubscriber),
  makeViewType(ViewType.OBS_SET_COMPOSITION_BAR_PLOT, CellSetCompositionBarPlotSubscriber),
  makeViewType(ViewType.FEATURE_SET_ENRICHMENT_BAR_PLOT, FeatureSetEnrichmentBarPlotSubscriber),
];

export const baseFileTypes = [
  // All CSV file types
  makeFileType(FileType.OBS_SETS_CSV, DataType.OBS_SETS, ObsSetsCsvLoader, CsvSource, obsSetsCsvSchema),
  makeFileType(FileType.OBS_EMBEDDING_CSV, DataType.OBS_EMBEDDING, ObsEmbeddingCsvLoader, CsvSource, obsEmbeddingCsvSchema),
  makeFileType(FileType.OBS_SPOTS_CSV, DataType.OBS_SPOTS, ObsSpotsCsvLoader, CsvSource, obsSpotsCsvSchema),
  makeFileType(FileType.OBS_POINTS_CSV, DataType.OBS_POINTS, ObsPointsCsvLoader, CsvSource, obsPointsCsvSchema),
  makeFileType(FileType.OBS_LOCATIONS_CSV, DataType.OBS_LOCATIONS, ObsLocationsCsvLoader, CsvSource, obsLocationsCsvSchema),
  makeFileType(FileType.OBS_LABELS_CSV, DataType.OBS_LABELS, ObsLabelsCsvLoader, CsvSource, obsLabelsCsvSchema),
  makeFileType(FileType.OBS_FEATURE_MATRIX_CSV, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixCsvLoader, CsvSource, z.null()),
  makeFileType(FileType.FEATURE_LABELS_CSV, DataType.FEATURE_LABELS, FeatureLabelsCsvLoader, CsvSource, featureLabelsCsvSchema),
  makeFileType(FileType.SAMPLE_SETS_CSV, DataType.SAMPLE_SETS, SampleSetsCsvLoader, CsvSource, sampleSetsCsvSchema),
  // All JSON file types
  makeFileType(FileType.OBS_SEGMENTATIONS_JSON, DataType.OBS_SEGMENTATIONS, ObsSegmentationsJsonLoader, JsonSource, z.null()),
  makeFileType(FileType.OBS_SETS_JSON, DataType.OBS_SETS, ObsSetsJsonLoader, JsonSource, z.null()),
  // All AnnData file types
  ...makeZarrFileTypes(FileType.OBS_SETS_ANNDATA_ZARR, DataType.OBS_SETS, ObsSetsAnndataLoader, AnnDataSource, obsSetsAnndataSchema),
  ...makeZarrFileTypes(FileType.OBS_EMBEDDING_ANNDATA_ZARR, DataType.OBS_EMBEDDING, ObsEmbeddingAnndataLoader, AnnDataSource, obsEmbeddingAnndataSchema),
  ...makeZarrFileTypes(FileType.OBS_SPOTS_ANNDATA_ZARR, DataType.OBS_SPOTS, ObsSpotsAnndataLoader, AnnDataSource, obsSpotsAnndataSchema),
  ...makeZarrFileTypes(FileType.OBS_POINTS_ANNDATA_ZARR, DataType.OBS_POINTS, ObsPointsAnndataLoader, AnnDataSource, obsPointsAnndataSchema),
  ...makeZarrFileTypes(FileType.OBS_LOCATIONS_ANNDATA_ZARR, DataType.OBS_LOCATIONS, ObsLocationsAnndataLoader, AnnDataSource, obsLocationsAnndataSchema),
  ...makeZarrFileTypes(FileType.OBS_LABELS_ANNDATA_ZARR, DataType.OBS_LABELS, ObsLabelsAnndataLoader, AnnDataSource, obsLabelsAnndataSchema),
  ...makeZarrFileTypes(FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixAnndataLoader, AnnDataSource, obsFeatureMatrixAnndataSchema),
  ...makeZarrFileTypes(FileType.OBS_FEATURE_COLUMNS_ANNDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureColumnsAnndataLoader, AnnDataSource, obsFeatureColumnsAnndataSchema),
  ...makeZarrFileTypes(FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR, DataType.OBS_SEGMENTATIONS, ObsSegmentationsAnndataLoader, AnnDataSource, obsSegmentationsAnndataSchema),
  ...makeZarrFileTypes(FileType.FEATURE_LABELS_ANNDATA_ZARR, DataType.FEATURE_LABELS, FeatureLabelsAnndataLoader, AnnDataSource, featureLabelsAnndataSchema),
  ...makeZarrFileTypes(FileType.SAMPLE_EDGES_ANNDATA_ZARR, DataType.SAMPLE_EDGES, SampleEdgesAnndataLoader, AnnDataSource, sampleEdgesAnndataSchema),
  ...makeZarrFileTypes(FileType.SAMPLE_SETS_ANNDATA_ZARR, DataType.SAMPLE_SETS, SampleSetsAnndataLoader, AnnDataSource, sampleSetsAnndataSchema),

  ...makeZarrFileTypes(FileType.COMPARISON_METADATA_ANNDATA_ZARR, DataType.COMPARISON_METADATA, ComparisonMetadataAnndataLoader, AnnDataSource, comparisonMetadataAnndataSchema),
  ...makeZarrFileTypes(FileType.COMPARATIVE_FEATURE_STATS_ANNDATA_ZARR, DataType.FEATURE_STATS, FeatureStatsAnndataLoader, AnnDataSource, featureStatsAnndataSchema),
  ...makeZarrFileTypes(FileType.COMPARATIVE_FEATURE_SET_STATS_ANNDATA_ZARR, DataType.FEATURE_SET_STATS, FeatureSetStatsAnndataLoader, AnnDataSource, featureSetStatsAnndataSchema),
  ...makeZarrFileTypes(FileType.COMPARATIVE_OBS_SET_STATS_ANNDATA_ZARR, DataType.OBS_SET_STATS, ObsSetStatsAnndataLoader, AnnDataSource, obsSetStatsAnndataSchema),
  // All MuData file types
  makeFileType(FileType.OBS_SETS_MUDATA_ZARR, DataType.OBS_SETS, ObsSetsAnndataLoader, MuDataSource, obsSetsAnndataSchema),
  makeFileType(FileType.OBS_EMBEDDING_MUDATA_ZARR, DataType.OBS_EMBEDDING, ObsEmbeddingAnndataLoader, MuDataSource, obsEmbeddingAnndataSchema),
  makeFileType(FileType.OBS_SPOTS_MUDATA_ZARR, DataType.OBS_SPOTS, ObsSpotsAnndataLoader, MuDataSource, obsSpotsAnndataSchema),
  makeFileType(FileType.OBS_POINTS_MUDATA_ZARR, DataType.OBS_POINTS, ObsPointsAnndataLoader, MuDataSource, obsPointsAnndataSchema),
  makeFileType(FileType.OBS_LOCATIONS_MUDATA_ZARR, DataType.OBS_LOCATIONS, ObsLocationsAnndataLoader, MuDataSource, obsLocationsAnndataSchema),
  makeFileType(FileType.OBS_LABELS_MUDATA_ZARR, DataType.OBS_LABELS, ObsLabelsAnndataLoader, MuDataSource, obsLabelsAnndataSchema),
  makeFileType(FileType.OBS_FEATURE_MATRIX_MUDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixAnndataLoader, MuDataSource, obsFeatureMatrixAnndataSchema),
  makeFileType(FileType.OBS_SEGMENTATIONS_MUDATA_ZARR, DataType.OBS_SEGMENTATIONS, ObsSegmentationsAnndataLoader, MuDataSource, obsSegmentationsAnndataSchema),
  makeFileType(FileType.FEATURE_LABELS_MUDATA_ZARR, DataType.FEATURE_LABELS, FeatureLabelsAnndataLoader, MuDataSource, featureLabelsAnndataSchema),
  // All OME file types
  ...makeZarrFileTypes(FileType.IMAGE_OME_ZARR, DataType.IMAGE, OmeZarrLoader, ZarrDataSource, imageOmeZarrSchema),
  makeFileType(FileType.IMAGE_OME_TIFF, DataType.IMAGE, OmeTiffLoader, OmeTiffSource, imageOmeTiffSchema),
  ...makeZarrFileTypes(FileType.OBS_SEGMENTATIONS_OME_ZARR, DataType.OBS_SEGMENTATIONS, OmeZarrAsObsSegmentationsLoader, ZarrDataSource, obsSegmentationsOmeZarrSchema),
  makeFileType(FileType.OBS_SEGMENTATIONS_OME_TIFF, DataType.OBS_SEGMENTATIONS, OmeTiffAsObsSegmentationsLoader, OmeTiffSource, obsSegmentationsOmeTiffSchema),
  // SpatialData file types
  makeFileType(FileType.IMAGE_SPATIALDATA_ZARR, DataType.IMAGE, SpatialDataImageLoader, ZarrDataSource, imageSpatialdataSchema),
  // TODO: create a new loader for labels that returns obsSegmentations with obsSegmentationsType: 'bitmask'
  makeFileType(FileType.LABELS_SPATIALDATA_ZARR, DataType.OBS_SEGMENTATIONS, SpatialDataLabelsLoader, ZarrDataSource, obsSegmentationsSpatialdataSchema),
  // TODO: create a new loader for shapes that returns obsSegmentations with obsSegmentationsType: 'polygon' (or switch this to 'shape' everywhere?)
  // TODO: create a new source for GeoPandas tables?
  makeFileType(FileType.SHAPES_SPATIALDATA_ZARR, DataType.OBS_SEGMENTATIONS, ObsSegmentationsAnndataLoader, SpatialDataShapesSource, obsSegmentationsSpatialdataSchema),
  makeFileType(FileType.OBS_SPOTS_SPATIALDATA_ZARR, DataType.OBS_SPOTS, SpatialDataObsSpotsLoader, SpatialDataShapesSource, obsSpotsSpatialdataSchema),
  makeFileType(FileType.OBS_FEATURE_MATRIX_SPATIALDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixAnndataLoader, SpatialDataTableSource, obsFeatureMatrixSpatialdataSchema),
  makeFileType(FileType.OBS_SETS_SPATIALDATA_ZARR, DataType.OBS_SETS, SpatialDataObsSetsLoader, SpatialDataTableSource, obsSetsSpatialdataSchema),

  makeFileType(FileType.OBS_SEGMENTATIONS_GLB, DataType.OBS_SEGMENTATIONS, GlbLoader, GlbSource, meshGlbSchema),
  makeFileType(FileType.FEATURE_LABELS_SPATIALDATA_ZARR, DataType.FEATURE_LABELS, FeatureLabelsAnndataLoader, SpatialDataTableSource, featureLabelsAnndataSchema),
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
  new PluginJointFileType(FileType.ANNDATA_ZARR_ZIP, expandAnndataZarr, anndataZarrSchema),
  new PluginJointFileType(FileType.ANNDATA_H5AD, expandAnndataZarr, anndataH5adSchema),
  new PluginJointFileType(FileType.SPATIALDATA_ZARR, expandSpatialdataZarr, spatialdataZarrSchema),
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

// TODO: should these schemas be imported from a common location in package/ rather than here in packages/main/?
// That would allow view implementations to depend on them for type checking and their default values.
export const baseCoordinationTypes = [
  new PluginCoordinationType(
    CoordinationType.META_COORDINATION_SCOPES,
    null,
    z.record(z.any()).nullable(),
  ),
  new PluginCoordinationType(
    CoordinationType.META_COORDINATION_SCOPES_BY,
    null,
    z.record(z.any()).nullable(),
  ),
  new PluginCoordinationType(CoordinationType.DATASET, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.OBS_TYPE, 'cell', z.string()),
  new PluginCoordinationType(CoordinationType.FEATURE_TYPE, 'gene', z.string()),
  new PluginCoordinationType(CoordinationType.FEATURE_VALUE_TYPE, 'expression', z.string()),
  new PluginCoordinationType(CoordinationType.OBS_LABELS_TYPE, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.FEATURE_LABELS_TYPE, null, z.string().nullable()),
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
  new PluginCoordinationType(CoordinationType.SPATIAL_ROTATION_X, 0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_ROTATION_Y, 0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_ROTATION_Z, 0, z.number().nullable()),
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
  new PluginCoordinationType(CoordinationType.OBS_SELECTION, null, z.array(z.string()).nullable()),
  new PluginCoordinationType(
    CoordinationType.OBS_SET_SELECTION,
    null,
    z.array(obsSetPath).nullable(),
  ),
  new PluginCoordinationType(CoordinationType.OBS_SELECTION_MODE, null, z.enum(['obsSelection', 'obsSetSelection']).nullable()),
  new PluginCoordinationType(
    CoordinationType.OBS_SET_FILTER,
    null,
    z.array(obsSetPath).nullable(),
  ),
  new PluginCoordinationType(CoordinationType.OBS_FILTER_MODE, null, z.enum(['obsFilter', 'obsSetFilter']).nullable()),
  new PluginCoordinationType(
    CoordinationType.OBS_SET_EXPANSION,
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
    z.enum(['geneSelection', 'cellSetSelection', 'spatialChannelColor', 'spatialLayerColor', 'obsLabels']),
  ),
  new PluginCoordinationType(CoordinationType.FEATURE_FILTER, null, z.array(z.string()).nullable()),
  new PluginCoordinationType(CoordinationType.FEATURE_HIGHLIGHT, null, z.string().nullable()),
  new PluginCoordinationType(
    CoordinationType.FEATURE_SELECTION,
    null,
    z.array(z.string()).nullable(),
  ),
  new PluginCoordinationType(CoordinationType.FEATURE_AGGREGATION_STRATEGY, null, z.union([
    z.enum([
      'first', 'last', 'mean', 'sum', 'difference',
    ]),
    // An index of a featureSelection array element.
    z.number(),
  ]).nullable()),
  new PluginCoordinationType(
    CoordinationType.FEATURE_SET_SELECTION,
    null,
    z.array(obsSetPath).nullable(),
  ),
  new PluginCoordinationType(CoordinationType.FEATURE_SELECTION_MODE, null, z.enum(['featureSelection', 'featureSetSelection']).nullable()),
  new PluginCoordinationType(
    CoordinationType.FEATURE_SET_FILTER,
    null,
    z.array(obsSetPath).nullable(),
  ),
  new PluginCoordinationType(CoordinationType.FEATURE_FILTER_MODE, null, z.enum(['featureFilter', 'featureSetFilter']).nullable()),
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
    CoordinationType.FEATURE_VALUE_POSITIVITY_THRESHOLD,
    0,
    z.number(),
  ),
  new PluginCoordinationType(
    CoordinationType.TOOLTIPS_VISIBLE,
    true,
    z.boolean(),
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
  new PluginCoordinationType(CoordinationType.FILE_UID, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.IMAGE_LAYER, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.IMAGE_CHANNEL, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.SEGMENTATION_LAYER, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.SEGMENTATION_CHANNEL, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_TARGET_C, null, z.number().or(z.string()).nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_TARGET_Z, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_TARGET_T, null, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_LAYER_VISIBLE, true, z.boolean()),
  new PluginCoordinationType(CoordinationType.SPATIAL_LAYER_OPACITY, 1.0, z.number()),
  new PluginCoordinationType(CoordinationType.SPATIAL_LAYER_COLORMAP, null, z.string().nullable()), // TODO: enum to be more strict
  new PluginCoordinationType(CoordinationType.SPATIAL_LAYER_TRANSPARENT_COLOR, null, z.array(z.number()).length(3).nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_LAYER_MODEL_MATRIX, null, z.array(z.number()).length(16).nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_CHANNEL_VISIBLE, true, z.boolean()),
  new PluginCoordinationType(CoordinationType.SPATIAL_CHANNEL_OPACITY, 1.0, z.number()),
  new PluginCoordinationType(CoordinationType.SPATIAL_CHANNEL_WINDOW, null, z.array(z.number()).length(2).nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_CHANNEL_COLOR, [255, 255, 255], z.array(z.number()).length(3).nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_SEGMENTATION_FILLED, true, z.boolean()),
  new PluginCoordinationType(CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH, 1.0, z.number()),
  // Reference: https://www.awaresystems.be/imaging/tiff/tifftags/photometricinterpretation.html
  new PluginCoordinationType(CoordinationType.PHOTOMETRIC_INTERPRETATION, null, z.enum(['BlackIsZero', 'RGB']).nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_RENDERING_MODE, '2D', z.enum(['2D', '3D']).nullable()),
  new PluginCoordinationType(CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM, 'additive', z.enum(['maximumIntensityProjection', 'additive'])),
  new PluginCoordinationType(CoordinationType.SPATIAL_TARGET_RESOLUTION, 0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_SLICE_X, null, z.array(z.number()).length(2).nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_SLICE_Y, null, z.array(z.number()).length(2).nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_SLICE_Z, null, z.array(z.number()).length(2).nullable()),
  new PluginCoordinationType(CoordinationType.SPOT_LAYER, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.POINT_LAYER, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_SPOT_RADIUS, 25.0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.SPATIAL_SPOT_FILLED, true, z.boolean()),
  new PluginCoordinationType(CoordinationType.SPATIAL_SPOT_STROKE_WIDTH, 1.0, z.number()),
  new PluginCoordinationType(CoordinationType.SPATIAL_LAYER_COLOR, null, z.array(z.number()).length(3).nullable()),
  new PluginCoordinationType(CoordinationType.PIXEL_HIGHLIGHT, null, z.array(z.number()).length(3).nullable()),
  new PluginCoordinationType(CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE, true, z.boolean()),
  new PluginCoordinationType(CoordinationType.LEGEND_VISIBLE, true, z.boolean()),
  new PluginCoordinationType(CoordinationType.SPATIAL_CHANNEL_LABELS_VISIBLE, true, z.boolean()),
  new PluginCoordinationType(CoordinationType.SPATIAL_CHANNEL_LABELS_ORIENTATION, 'vertical', z.enum(['vertical', 'horizontal'])),
  new PluginCoordinationType(CoordinationType.SPATIAL_CHANNEL_LABEL_SIZE, 14, z.number()),
  new PluginCoordinationType(CoordinationType.SAMPLE_TYPE, 'sample', z.string().nullable()),
  // TODO: remove one array level and use multi-coordination for sampleSetSelection?
  new PluginCoordinationType(CoordinationType.SAMPLE_FILTER, null, z.array(z.string()).nullable()),
  new PluginCoordinationType(CoordinationType.SAMPLE_SELECTION, null, z.array(z.string()).nullable()),
  new PluginCoordinationType(CoordinationType.SAMPLE_SET_SELECTION, null, z.array(z.array(z.string())).nullable()),
  new PluginCoordinationType(CoordinationType.SAMPLE_SET_FILTER, null, z.array(z.array(z.string())).nullable()),
  new PluginCoordinationType(CoordinationType.SAMPLE_SELECTION_MODE, null, z.enum(['sampleSelection', 'sampleSetSelection']).nullable()),
  new PluginCoordinationType(CoordinationType.SAMPLE_FILTER_MODE, null, z.enum(['sampleFilter', 'sampleSetFilter']).nullable()),
  new PluginCoordinationType(
    CoordinationType.SAMPLE_SET_COLOR,
    null,
    z.array(z.object({
      path: obsSetPath,
      color: rgbArray,
    })).nullable(),
  ),
  new PluginCoordinationType(CoordinationType.SAMPLE_HIGHLIGHT, null, z.string().nullable()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_POINTS_VISIBLE, true, z.boolean()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_CONTOURS_VISIBLE, false, z.boolean()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_CONTOURS_FILLED, true, z.boolean()),
  new PluginCoordinationType(CoordinationType.EMBEDDING_CONTOUR_PERCENTILES, null, z.array(z.number()).nullable()),
  new PluginCoordinationType(CoordinationType.CONTOUR_COLOR_ENCODING, 'cellSetSelection', z.enum(['cellSetSelection', 'sampleSetSelection', 'contourColor'])),
  new PluginCoordinationType(CoordinationType.CONTOUR_COLOR, null, rgbArray.nullable()),
  new PluginCoordinationType(CoordinationType.HIERARCHY_LEVELS, null, z.array(z.enum(['sampleSet', 'obsSet'])).nullable()),
  // For volcano plot:
  new PluginCoordinationType(CoordinationType.FEATURE_POINT_SIGNIFICANCE_THRESHOLD, 0.01, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.FEATURE_LABEL_SIGNIFICANCE_THRESHOLD, 0.01, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.FEATURE_POINT_FOLD_CHANGE_THRESHOLD, 1.0, z.number().nullable()),
  new PluginCoordinationType(CoordinationType.FEATURE_LABEL_FOLD_CHANGE_THRESHOLD, 5.0, z.number().nullable()),
];

export const baseAsyncFunctions = [
  new PluginAsyncFunction(AsyncFunctionType.AUTOCOMPLETE_FEATURE, autocompleteFeature),
  new PluginAsyncFunction(AsyncFunctionType.TRANSFORM_FEATURE, transformFeature),
  new PluginAsyncFunction(AsyncFunctionType.GET_ALTERNATIVE_TERMS, getAlternativeTerms),
  new PluginAsyncFunction(AsyncFunctionType.GET_TERM_MAPPING, getTermMapping),
];
