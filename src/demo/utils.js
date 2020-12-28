// Exported because used by the cypress tests: They route API requests to the fixtures instead.
export const urlPrefix = 'https://s3.amazonaws.com/vitessce-data/0.0.31/master_release';

export function makeDatasetNameToJsonFiles(datasetPrefix) {
  return name => ({
    type: name,
    fileType: `${name}.json`,
    url: `${urlPrefix}/${datasetPrefix}/${datasetPrefix}.${name}.json`,
  });
}
