/* eslint-disable max-len */
import { useState, useMemo, useLayoutEffect } from 'react';
import { VitS, registerPluginFileType, z } from '@vitessce/vit-s';
import {
  upgradeAndParse,
  obsEmbeddingCsvSchema, // TODO: define in single-cell-specific sub-package?
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
} from '@vitessce/schemas';

// Register view type plugins
import { register as registerDescription, DescriptionSubscriber } from '@vitessce/description';
import { ObsSetsManagerSubscriber, register as registerObsSetsManager } from '@vitessce/obs-sets-manager';
import { EmbeddingScatterplotSubscriber, register as registerScatterplotEmbedding } from '@vitessce/scatterplot-embedding';
import { GatingSubscriber, register as registerScatterplotGating } from '@vitessce/scatterplot-gating';
import { register as registerSpatial, SpatialSubscriber } from '@vitessce/spatial';
import { HeatmapSubscriber, register as registerHeatmap } from '@vitessce/heatmap';
import { FeatureListSubscriber, register as registerFeatureList } from '@vitessce/feature-list';
import { LayerControllerSubscriber, register as registerLayerController } from '@vitessce/layer-controller';
import { register as registerStatus, StatusSubscriber } from '@vitessce/status';
import { CellSetExpressionPlotSubscriber, CellSetSizesPlotSubscriber, ExpressionHistogramSubscriber, registerCellSetExpression, registerCellSetSizes, registerExpressionHistogram } from '@vitessce/statistical-plots';
import { registerHiglass, registerGenomicProfiles, HiGlassSubscriber, GenomicProfilesSubscriber } from '@vitessce/genomic-profiles';

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
import { FileType, DataType, ViewType, COMPONENT_COORDINATION_TYPES, CoordinationType } from '@vitessce/constants-internal';

// TODO: Move these class definitions into vit-s
class PluginViewType {
  constructor(name, component, coordinationTypes) {
    this.name = name;
    this.component = component;
    this.coordinationTypes = coordinationTypes;
  }
}

class PluginFileType {
  constructor(name, dataType, dataLoaderClass, dataSourceClass, optionsSchema) {
    this.name = name;
    this.dataType = dataType;
    this.dataLoaderClass = dataLoaderClass;
    this.dataSourceClass = dataSourceClass;
    this.optionsSchema = optionsSchema;
  }
}

class PluginCoordinationType {
  constructor(name, defaultValue, valueSchema) {
    this.name = name;
    this.defaultValue = defaultValue;
    this.valueSchema = valueSchema;
  }
}

function makeVitessceViewType(name, component) {
  return new PluginViewType(name, component, COMPONENT_COORDINATION_TYPES[name]);
}

const vitessceViewTypes = [
  makeVitessceViewType(ViewType.DESCRIPTION, DescriptionSubscriber),
  makeVitessceViewType(ViewType.OBS_SETS, ObsSetsManagerSubscriber),
  makeVitessceViewType(ViewType.SCATTERPLOT, EmbeddingScatterplotSubscriber),
  makeVitessceViewType(ViewType.GATING, GatingSubscriber),
  makeVitessceViewType(ViewType.SPATIAL, SpatialSubscriber),
  makeVitessceViewType(ViewType.HEATMAP, HeatmapSubscriber),
  makeVitessceViewType(ViewType.FEATURE_LIST, FeatureListSubscriber),
  makeVitessceViewType(ViewType.LAYER_CONTROLLER, LayerControllerSubscriber),
  makeVitessceViewType(ViewType.STATUS, StatusSubscriber),
  makeVitessceViewType(ViewType.OBS_SET_FEATURE_VALUE_DISTRIBUTION, CellSetExpressionPlotSubscriber),
  makeVitessceViewType(ViewType.OBS_SET_SIZES, CellSetSizesPlotSubscriber),
  makeVitessceViewType(ViewType.FEATURE_VALUE_HISTOGRAM, ExpressionHistogramSubscriber),
  makeVitessceViewType('higlass', HiGlassSubscriber),
  makeVitessceViewType(ViewType.GENOMIC_PROFILES, GenomicProfilesSubscriber),
];

const vitessceFileTypes = [
  // All CSV file types
  new PluginFileType(FileType.OBS_SETS_CSV, DataType.OBS_SETS, ObsSetsCsvLoader, CsvSource, obsSetsCsvSchema),
  new PluginFileType(FileType.OBS_EMBEDDING_CSV, DataType.OBS_EMBEDDING, ObsEmbeddingCsvLoader, CsvSource, obsEmbeddingCsvSchema),
  new PluginFileType(FileType.OBS_LOCATIONS_CSV, DataType.OBS_LOCATIONS, ObsLocationsCsvLoader, CsvSource, obsLocationsCsvSchema),
  new PluginFileType(FileType.OBS_LABELS_CSV, DataType.OBS_LABELS, ObsLabelsCsvLoader, CsvSource, obsLabelsCsvSchema),
  new PluginFileType(FileType.OBS_FEATURE_MATRIX_CSV, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixCsvLoader, CsvSource, z.null()),
  new PluginFileType(FileType.FEATURE_LABELS_CSV, DataType.FEATURE_LABELS, FeatureLabelsCsvLoader, CsvSource, featureLabelsCsvSchema),
  // All JSON file types
  new PluginFileType(FileType.OBS_SEGMENTATIONS_JSON, DataType.OBS_SEGMENTATIONS, ObsSegmentationsJsonLoader, JsonSource, z.null()),
  new PluginFileType(FileType.OBS_SETS_JSON, DataType.OBS_SETS, ObsSetsJsonLoader, JsonSource, z.null()),
  // All AnnData file types
  new PluginFileType(FileType.OBS_SETS_ANNDATA_ZARR, DataType.OBS_SETS, ObsSetsAnndataLoader, AnnDataSource, obsSetsAnndataSchema),
  new PluginFileType(FileType.OBS_EMBEDDING_ANNDATA_ZARR, DataType.OBS_EMBEDDING, ObsEmbeddingAnndataLoader, AnnDataSource, obsEmbeddingAnndataSchema),
  new PluginFileType(FileType.OBS_LOCATIONS_ANNDATA_ZARR, DataType.OBS_LOCATIONS, ObsLocationsAnndataLoader, AnnDataSource, obsLocationsAnndataSchema),
  new PluginFileType(FileType.OBS_LABELS_ANNDATA_ZARR, DataType.OBS_LABELS, ObsLabelsAnndataLoader, AnnDataSource, obsLabelsAnndataSchema),
  new PluginFileType(FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixAnndataLoader, AnnDataSource, obsFeatureMatrixAnndataSchema),
  new PluginFileType(FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR, DataType.OBS_SEGMENTATIONS, ObsSegmentationsAnndataLoader, AnnDataSource, obsSegmentationsAnndataSchema),
  new PluginFileType(FileType.FEATURE_LABELS_ANNDATA_ZARR, DataType.FEATURE_LABELS, FeatureLabelsAnndataLoader, AnnDataSource, featureLabelsAnndataSchema),
  // All MuData file types
  new PluginFileType(FileType.OBS_SETS_MUDATA_ZARR, DataType.OBS_SETS, ObsSetsAnndataLoader, MuDataSource, obsSetsAnndataSchema),
  new PluginFileType(FileType.OBS_EMBEDDING_MUDATA_ZARR, DataType.OBS_EMBEDDING, ObsEmbeddingAnndataLoader, MuDataSource, obsEmbeddingAnndataSchema),
  new PluginFileType(FileType.OBS_LOCATIONS_MUDATA_ZARR, DataType.OBS_LOCATIONS, ObsLocationsAnndataLoader, MuDataSource, obsLocationsAnndataSchema),
  new PluginFileType(FileType.OBS_LABELS_MUDATA_ZARR, DataType.OBS_LABELS, ObsLabelsAnndataLoader, MuDataSource, obsLabelsAnndataSchema),
  new PluginFileType(FileType.OBS_FEATURE_MATRIX_MUDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixAnndataLoader, MuDataSource, obsFeatureMatrixAnndataSchema),
  new PluginFileType(FileType.OBS_SEGMENTATIONS_MUDATA_ZARR, DataType.OBS_SEGMENTATIONS, ObsSegmentationsAnndataLoader, MuDataSource, obsSegmentationsAnndataSchema),
  new PluginFileType(FileType.FEATURE_LABELS_MUDATA_ZARR, DataType.FEATURE_LABELS, FeatureLabelsAnndataLoader, MuDataSource, featureLabelsAnndataSchema),
  // All OME file types
  new PluginFileType(FileType.IMAGE_OME_ZARR, DataType.IMAGE, OmeZarrLoader, ZarrDataSource, z.null()),
  // All legacy file types
  new PluginFileType(FileType.OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR, DataType.OBS_FEATURE_MATRIX, MatrixZarrAsObsFeatureMatrixLoader, ZarrDataSource, z.null()),
  new PluginFileType(FileType.IMAGE_RASTER_JSON, DataType.IMAGE, RasterJsonAsImageLoader, JsonSource, rasterJsonSchema),
  new PluginFileType(FileType.OBS_SEGMENTATIONS_RASTER_JSON, DataType.OBS_SEGMENTATIONS, RasterJsonAsObsSegmentationsLoader, JsonSource, rasterJsonSchema),
  new PluginFileType(FileType.OBS_SETS_CELL_SETS_JSON, DataType.OBS_SETS, ObsSetsJsonLoader, JsonSource, z.null()),
  new PluginFileType(FileType.OBS_FEATURE_MATRIX_CLUSTERS_JSON, DataType.OBS_FEATURE_MATRIX, ClustersJsonAsObsFeatureMatrixLoader, JsonSource, z.null()),
  new PluginFileType(FileType.OBS_FEATURE_MATRIX_GENES_JSON, DataType.OBS_FEATURE_MATRIX, GenesJsonAsObsFeatureMatrixLoader, JsonSource, z.null()),
  new PluginFileType(FileType.OBS_LABELS_CELLS_JSON, DataType.OBS_LABELS, CellsJsonAsObsLabelsLoader, JsonSource, z.null()),
  new PluginFileType(FileType.OBS_EMBEDDING_CELLS_JSON, DataType.OBS_EMBEDDING, CellsJsonAsObsEmbeddingLoader, JsonSource, z.null()),
  new PluginFileType(FileType.OBS_LOCATIONS_CELLS_JSON, DataType.OBS_LOCATIONS, CellsJsonAsObsLocationsLoader, JsonSource, z.null()),
  new PluginFileType(FileType.OBS_SEGMENTATIONS_CELLS_JSON, DataType.OBS_SEGMENTATIONS, CellsJsonAsObsSegmentationsLoader, JsonSource, z.null()),
  new PluginFileType(FileType.OBS_LOCATIONS_MOLECULES_JSON, DataType.OBS_LOCATIONS, MoleculesJsonAsObsLocationsLoader, JsonSource, z.null()),
  new PluginFileType(FileType.OBS_LABELS_MOLECULES_JSON, DataType.OBS_LABELS, MoleculesJsonAsObsLabelsLoader, JsonSource, z.null()),
  new PluginFileType(FileType.NEIGHBORHOODS_JSON, DataType.NEIGHBORHOODS, JsonLoader, JsonSource, z.null()),
  new PluginFileType(FileType.GENOMIC_PROFILES_ZARR, DataType.GENOMIC_PROFILES, GenomicProfilesZarrLoader, ZarrDataSource, z.null()),
];
// TODO: schemas for joint file types.


const vitessceCoordinationTypes = [
  new PluginCoordinationType(CoordinationType.DATASET, null, z.string()),
];


export function Vitessce(props) {
  const {
    config,
    onConfigUpgrade,
    pluginViewTypes: pluginViewTypesProp,
    pluginFileTypes: pluginFileTypesProp,
    pluginCoordinationTypes: pluginCoordinationTypesProp,
  } = props;

  // TODO: change to config?.uid when that field is added
  const configUid = config?.name;
  const configVersion = config?.version;

  const [configOrWarning, success] = useMemo(() => {
    try {
      const validConfig = upgradeAndParse(config, onConfigUpgrade);
      return [validConfig, true];
    } catch (e) {
      console.error(e);
      return [
        {
          title: 'View config initialization failed.',
          unformatted: e.message,
        },
        false,
      ];
    }
  }, [configUid, configVersion]);

  const mergedPluginViewTypes = useMemo(() => ([
    ...vitessceViewTypes, ...(pluginViewTypesProp || []),
  ]), [pluginViewTypesProp]);

  const mergedPluginFileTypes = useMemo(() => ([
    ...vitessceFileTypes, ...(pluginFileTypesProp || []),
  ]), [pluginFileTypesProp]);

  const mergedPluginCoordinationTypes = useMemo(() => ([
    ...vitessceCoordinationTypes, ...(pluginCoordinationTypesProp || []),
  ]), [pluginCoordinationTypesProp]);

  return (success ? (
    <VitS
      {...props}
      config={configOrWarning}
      viewTypes={mergedPluginViewTypes}
      fileTypes={mergedPluginFileTypes}
      coordinationTypes={mergedPluginCoordinationTypes}
    />
  ) : (<p>Config validation failed</p>));
}
