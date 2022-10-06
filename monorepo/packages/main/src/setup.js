// Register view type plugins
import { register as registerDescription } from '@vitessce/description';
import { register as registerObsSetsManager } from '@vitessce/obs-sets-manager';
import { register as registerScatterplot } from '@vitessce/scatterplot-embedding';
// Register file type plugins
import { CsvSource, ObsSetsCsvLoader } from '@vitessce/csv';
import { registerPluginFileType } from '@vitessce/vit-s';
import { FileType, DataType } from '@vitessce/constants-internal';

export function setup() {
  registerDescription();
  registerObsSetsManager();
  registerScatterplot();

  registerPluginFileType(FileType.OBS_SETS_CSV, DataType.OBS_SETS, ObsSetsCsvLoader, CsvSource);
}