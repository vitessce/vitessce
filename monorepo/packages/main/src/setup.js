import { Vitessce as VitS } from '@vitessce/vit-s';

// Register view type plugins
import { register as registerDescription } from '@vitessce/description';
import { register as registerObsSetsManager } from '@vitessce/obs-sets-manager';
import { register as registerScatterplotEmbedding } from '@vitessce/scatterplot-embedding';
import { register as registerSpatial } from '@vitessce/spatial';
// Register file type plugins
import { CsvSource, ObsSetsCsvLoader, ObsEmbeddingCsvLoader, ObsLocationsCsvLoader } from '@vitessce/csv';
import { JsonSource, ObsSegmentationsJsonLoader } from '@vitessce/json';
import { registerPluginFileType } from '@vitessce/vit-s';
import { FileType, DataType } from '@vitessce/constants-internal';
import { useLayoutEffect, useState } from 'react';

function setup() {
  registerDescription();
  registerObsSetsManager();
  registerScatterplotEmbedding();
  registerSpatial();

  registerPluginFileType(FileType.OBS_SETS_CSV, DataType.OBS_SETS, ObsSetsCsvLoader, CsvSource);
  registerPluginFileType(FileType.OBS_EMBEDDING_CSV, DataType.OBS_EMBEDDING, ObsEmbeddingCsvLoader, CsvSource);
  registerPluginFileType(FileType.OBS_LOCATIONS_CSV, DataType.OBS_LOCATIONS, ObsLocationsCsvLoader, CsvSource);
  registerPluginFileType(FileType.OBS_SEGMENTATIONS_JSON, DataType.OBS_SEGMENTATIONS, ObsSegmentationsJsonLoader, JsonSource);
}

export function Vitessce(props) {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    setup();
    setReady(true);
  }, []);
  return (ready ? <VitS {...props} /> : null);
}