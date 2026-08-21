import {
  VitessceConfig, hconcat, vconcat,
} from '@vitessce/config';
import {
  ViewType as vt,
  DataType as dt,
  FileType as ft,
  CoordinationType as ct,
} from '@vitessce/constants';
import { Parser } from '@json2csv/plainjs';

export function makeIdsCsvDataUrl(ids) {
  const parser = new Parser({ fields: ['id'] });
  const csv = parser.parse(ids.map(id => ({ id })));
  return `data:text/csv,${encodeURIComponent(csv)}`;
}

// Exported because used by the cypress tests: They route API requests to the fixtures instead.
export const urlPrefix = 'https://data-1.vitessce.io/0.0.31/master_release';

export function makeDatasetNameToJsonFiles(datasetPrefix) {
  return name => ({
    type: name,
    fileType: `${name}.json`,
    url: `${urlPrefix}/${datasetPrefix}/${datasetPrefix}.${name}.json`,
  });
}

export function getS3Url(datasetPrefix, name) {
  return `${urlPrefix}/${datasetPrefix}/${datasetPrefix}.${name}.json`;
}

export const vapi = {
  VitessceConfig,
  hconcat,
  vconcat,
  vt,
  dt,
  ft,
  ct,
};
