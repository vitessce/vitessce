import Ajv from 'ajv';
import hierarchicalSetsSchema from '../../schemas/hierarchical-sets.schema.json';

export const HIERARCHICAL_SETS_SCHEMA_VERSION = '0.1.2';
export const FILE_EXTENSION_JSON = 'json';
export const MIME_TYPE_JSON = 'application/json';

/**
 * Handler for JSON imports. Validates against the hierarchical sets schema.
 * @param {string} result The data passed from the FileReader as a string.
 * @param {string} datatype The data type to validate against.
 * @returns {object} The imported tree object.
 * @throws {Error} Throws error if validation fails or if the datatype does not match.
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
    throw new Error(
      `The imported data type does not match the expected data type of '${datatype}'.`,
    );
  } else {
    return importData;
  }
}

/**
 * Convert a tree object to a JSON representation.
 * @param {object} result The object to export.
 * @returns {string} The data in a string representation.
 */
export function handleExportJSON(result) {
  // eslint-disable-next-line prefer-template
  const dataString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result));
  return dataString;
}

/**
 * Download a file. Appends and removes an anchor node in the DOM.
 * @param {string} dataString The function that converts the data to a string.
 * @param {string} fileName The name of the file to be downloaded.
 */
export function downloadForUser(dataString, fileName) {
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataString);
  downloadAnchorNode.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
