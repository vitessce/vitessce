/* eslint-disable max-len */
import { useState, useLayoutEffect } from 'react';
import { VitS, registerPluginFileType } from '@vitessce/vit-s';

// Register view type plugins
import { register as registerDescription } from '@vitessce/description';
import { register as registerObsSetsManager } from '@vitessce/obs-sets-manager';
import { register as registerScatterplotEmbedding } from '@vitessce/scatterplot-embedding';
import { register as registerScatterplotGating } from '@vitessce/scatterplot-gating';
import { register as registerSpatial } from '@vitessce/spatial';
import { register as registerHeatmap } from '@vitessce/heatmap';
import { register as registerFeatureList } from '@vitessce/feature-list';
import { register as registerLayerController } from '@vitessce/layer-controller';
import { register as registerStatus } from '@vitessce/status';
import { register as registerStaticFigure } from '@vitessce/static-figure';
import { registerCellSetExpression, registerCellSetSizes, registerExpressionHistogram } from '@vitessce/statistical-plots';
import { registerHiglass, registerGenomicProfiles } from '@vitessce/genomic-profiles';

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
import { FileType, DataType } from '@vitessce/constants-internal';

function setup() {
  // View types
  registerDescription();
  registerObsSetsManager();
  registerScatterplotEmbedding();
  registerScatterplotGating();
  registerSpatial();
  registerHeatmap();
  registerFeatureList();
  registerLayerController();
  registerStatus();
  registerStaticFigure();
  // Statistical plots
  registerCellSetExpression();
  registerCellSetSizes();
  registerExpressionHistogram();
  // Higlass
  registerHiglass();
  registerGenomicProfiles();

  // File types
  // All CSV file types
  registerPluginFileType(FileType.OBS_SETS_CSV, DataType.OBS_SETS, ObsSetsCsvLoader, CsvSource);
  registerPluginFileType(FileType.OBS_EMBEDDING_CSV, DataType.OBS_EMBEDDING, ObsEmbeddingCsvLoader, CsvSource);
  registerPluginFileType(FileType.OBS_LOCATIONS_CSV, DataType.OBS_LOCATIONS, ObsLocationsCsvLoader, CsvSource);
  registerPluginFileType(FileType.OBS_LABELS_CSV, DataType.OBS_LABELS, ObsLabelsCsvLoader, CsvSource);
  registerPluginFileType(FileType.OBS_FEATURE_MATRIX_CSV, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixCsvLoader, CsvSource);
  registerPluginFileType(FileType.FEATURE_LABELS_CSV, DataType.FEATURE_LABELS, FeatureLabelsCsvLoader, CsvSource);
  // All JSON file types
  registerPluginFileType(FileType.OBS_SEGMENTATIONS_JSON, DataType.OBS_SEGMENTATIONS, ObsSegmentationsJsonLoader, JsonSource);
  registerPluginFileType(FileType.OBS_SETS_JSON, DataType.OBS_SETS, ObsSetsJsonLoader, JsonSource);
  // All AnnData file types
  registerPluginFileType(FileType.OBS_SETS_ANNDATA_ZARR, DataType.OBS_SETS, ObsSetsAnndataLoader, AnnDataSource);
  registerPluginFileType(FileType.OBS_EMBEDDING_ANNDATA_ZARR, DataType.OBS_EMBEDDING, ObsEmbeddingAnndataLoader, AnnDataSource);
  registerPluginFileType(FileType.OBS_LOCATIONS_ANNDATA_ZARR, DataType.OBS_LOCATIONS, ObsLocationsAnndataLoader, AnnDataSource);
  registerPluginFileType(FileType.OBS_LABELS_ANNDATA_ZARR, DataType.OBS_LABELS, ObsLabelsAnndataLoader, AnnDataSource);
  registerPluginFileType(FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixAnndataLoader, AnnDataSource);
  registerPluginFileType(FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR, DataType.OBS_SEGMENTATIONS, ObsSegmentationsAnndataLoader, AnnDataSource);
  registerPluginFileType(FileType.FEATURE_LABELS_ANNDATA_ZARR, DataType.FEATURE_LABELS, FeatureLabelsAnndataLoader, AnnDataSource);
  // All MuData file types
  registerPluginFileType(FileType.OBS_SETS_MUDATA_ZARR, DataType.OBS_SETS, ObsSetsAnndataLoader, MuDataSource);
  registerPluginFileType(FileType.OBS_EMBEDDING_MUDATA_ZARR, DataType.OBS_EMBEDDING, ObsEmbeddingAnndataLoader, MuDataSource);
  registerPluginFileType(FileType.OBS_LOCATIONS_MUDATA_ZARR, DataType.OBS_LOCATIONS, ObsLocationsAnndataLoader, MuDataSource);
  registerPluginFileType(FileType.OBS_LABELS_MUDATA_ZARR, DataType.OBS_LABELS, ObsLabelsAnndataLoader, MuDataSource);
  registerPluginFileType(FileType.OBS_FEATURE_MATRIX_MUDATA_ZARR, DataType.OBS_FEATURE_MATRIX, ObsFeatureMatrixAnndataLoader, MuDataSource);
  registerPluginFileType(FileType.OBS_SEGMENTATIONS_MUDATA_ZARR, DataType.OBS_SEGMENTATIONS, ObsSegmentationsAnndataLoader, MuDataSource);
  registerPluginFileType(FileType.FEATURE_LABELS_MUDATA_ZARR, DataType.FEATURE_LABELS, FeatureLabelsAnndataLoader, MuDataSource);
  // All OME file types
  registerPluginFileType(FileType.IMAGE_OME_ZARR, DataType.IMAGE, OmeZarrLoader, ZarrDataSource);

  // All legacy file types
  registerPluginFileType(FileType.OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR, DataType.OBS_FEATURE_MATRIX, MatrixZarrAsObsFeatureMatrixLoader, ZarrDataSource);
  registerPluginFileType(FileType.IMAGE_RASTER_JSON, DataType.IMAGE, RasterJsonAsImageLoader, JsonSource);
  registerPluginFileType(FileType.OBS_SEGMENTATIONS_RASTER_JSON, DataType.OBS_SEGMENTATIONS, RasterJsonAsObsSegmentationsLoader, JsonSource);
  registerPluginFileType(FileType.OBS_SETS_CELL_SETS_JSON, DataType.OBS_SETS, ObsSetsJsonLoader, JsonSource);
  registerPluginFileType(FileType.OBS_FEATURE_MATRIX_CLUSTERS_JSON, DataType.OBS_FEATURE_MATRIX, ClustersJsonAsObsFeatureMatrixLoader, JsonSource);
  registerPluginFileType(FileType.OBS_FEATURE_MATRIX_GENES_JSON, DataType.OBS_FEATURE_MATRIX, GenesJsonAsObsFeatureMatrixLoader, JsonSource);
  registerPluginFileType(FileType.OBS_LABELS_CELLS_JSON, DataType.OBS_LABELS, CellsJsonAsObsLabelsLoader, JsonSource);
  registerPluginFileType(FileType.OBS_EMBEDDING_CELLS_JSON, DataType.OBS_EMBEDDING, CellsJsonAsObsEmbeddingLoader, JsonSource);
  registerPluginFileType(FileType.OBS_LOCATIONS_CELLS_JSON, DataType.OBS_LOCATIONS, CellsJsonAsObsLocationsLoader, JsonSource);
  registerPluginFileType(FileType.OBS_SEGMENTATIONS_CELLS_JSON, DataType.OBS_SEGMENTATIONS, CellsJsonAsObsSegmentationsLoader, JsonSource);
  registerPluginFileType(FileType.OBS_LOCATIONS_MOLECULES_JSON, DataType.OBS_LOCATIONS, MoleculesJsonAsObsLocationsLoader, JsonSource);
  registerPluginFileType(FileType.OBS_LABELS_MOLECULES_JSON, DataType.OBS_LABELS, MoleculesJsonAsObsLabelsLoader, JsonSource);
  registerPluginFileType(FileType.NEIGHBORHOODS_JSON, DataType.NEIGHBORHOODS, JsonLoader, JsonSource);
  registerPluginFileType(FileType.GENOMIC_PROFILES_ZARR, DataType.GENOMIC_PROFILES, GenomicProfilesZarrLoader, ZarrDataSource);
}

export function Vitessce(props) {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    setup();
    setReady(true);
  }, []);
  return (ready ? (
    <VitS {...props} />
  ) : null);
}
