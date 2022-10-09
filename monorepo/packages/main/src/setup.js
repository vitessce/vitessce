import { Vitessce as VitS } from '@vitessce/vit-s';

// Register view type plugins
import { register as registerDescription } from '@vitessce/description';
import { register as registerObsSetsManager } from '@vitessce/obs-sets-manager';
import { register as registerScatterplotEmbedding } from '@vitessce/scatterplot-embedding';
// Register file type plugins
import { CsvSource, ObsSetsCsvLoader, ObsEmbeddingCsvLoader } from '@vitessce/csv';
import { registerPluginFileType } from '@vitessce/vit-s';
import { FileType, DataType } from '@vitessce/constants-internal';
import { useLayoutEffect, useState } from 'react';

function setup() {
  registerDescription();
  registerObsSetsManager();
  registerScatterplotEmbedding();

  registerPluginFileType(FileType.OBS_SETS_CSV, DataType.OBS_SETS, ObsSetsCsvLoader, CsvSource);
  registerPluginFileType(FileType.OBS_EMBEDDING_CSV, DataType.OBS_EMBEDDING, ObsEmbeddingCsvLoader, CsvSource);
}

export function Vitessce(props) {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    setup();
    setReady(true);
  }, []);
  return (ready ? <VitS {...props} /> : null);
}