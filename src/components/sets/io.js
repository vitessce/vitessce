/* eslint-disable */
import { dsvFormat } from 'd3-dsv';
import Ajv from 'ajv';
import tinycolor from 'tinycolor2';
import { parse as json2csv } from 'json2csv';
import { version } from '../../../package.json';

import hierarchicalSetsSchema from '../../schemas/hierarchical-sets.schema.json';

export const tabularFileType = 'TSV';
export const tabularFileExtension = 'tsv';
const tabularColumnSeparator = '\t';
const tabularHierarchySeparator = ';';
const tabularNA = 'NA';

/**
 * Check whether the elements of two arrays are equal.
 * @param {Array} a One of the two arrays.
 * @param {Array} b The other of the two arrays.
 * @returns {boolean} Whether the two arrays contain the same elements.
 */
function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * Make a timestamped name for an import root node.
 * @returns {string} A new name for an import node.
 */
function makeImportName() {
  const timestamp = (new Date()).toLocaleString();
  return `Import ${timestamp}`;
}

/**
 * Handler for tabular (TSV) imports.
 * @param {object} props The component props.
 * @param {string} result The data passed from the onImport function as a string.
 */
export function handleImportTabular(props, result) {
  // TODO
}

/**
 * Handler for JSON imports.
 * @param {string} result The data passed from the FileReader as a string.
 * @param {string} datatype The data type to validate against.
 * @param {function} onError A function to call with errors.
 */
export function handleImportJSON(result, datatype) {
  const importData = JSON.parse(result);
  // Validate the imported file.
  const validate = new Ajv().compile(hierarchicalSetsSchema);
  const valid = validate(importData);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    throw new Error(`Import validation failed: ${failureReason}`);
  } else if (importData.datatype !== datatype) {
    throw new Error(`The imported data type does not match the expected data type of '${datatype}'.`);
  } else {
    return importData;
  }
}

/**
 * Convert the tree to a tabular representation and then a string.
 * Uses set keys as unique set identifiers to allow repeated set names.
 * @param {object} props The component props.
 * @returns {string} The data in a string representation.
 */
export function handleExportTabular(props) {
  // TODO
}

/**
 * Download the sets tree in a JSON representation.
 * @param {object} props The component props.
 * @returns {string} The data in a string representation.
 */
export function handleExportJSON(props) {
  const {
    datasetId,
    setsType,
    setsTree,
  } = props;
  const exportData = {
    datasetId,
    setsType,
    version,
    setsTree: setsTree.export(),
  };
  // eslint-disable-next-line prefer-template
  const dataString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData));
  return dataString;
}
