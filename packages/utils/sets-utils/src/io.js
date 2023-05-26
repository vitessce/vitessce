import { isNil } from 'lodash-es';
import { dsvFormat } from 'd3-dsv';
// TODO(monorepo): try to find a different package for this.
// Reference: https://github.com/zemirco/json2csv/issues/539
import { Parser } from 'json2csv/dist/json2csv.umd.js';
import { getDefaultColor } from '@vitessce/utils';
import { colorArrayToString, colorStringToArray } from './utils.js';
import {
  HIERARCHICAL_SCHEMAS, TABULAR_SCHEMAS,
  MIME_TYPE_JSON, MIME_TYPE_TABULAR,
  SEPARATOR_TABULAR, NA_VALUE_TABULAR,
} from './constants.js';

/**
 * Check if an imported tree has an old schema version that we know how to
 * "upgrade" to the latest schema version.  Validate against the schema.
 * @param {object} currTree A hierarchical tree object with a .version property,
 * which has already passed schema validation, but may not have the latest schema version.
 * @param {string} datatype The data type of the items in the schema.
 * @returns {[object, boolean]} The upgraded tree object and a boolean indicating
 * whether the tree was upgraded.
 */
// eslint-disable-next-line no-unused-vars
export function tryUpgradeTreeToLatestSchema(currTree, datatype) {
  const zodSchema = HIERARCHICAL_SCHEMAS.schema;
  const latestSchemaVersion = HIERARCHICAL_SCHEMAS.latestVersion;
  const parseResult = zodSchema.safeParse(currTree);
  const valid = parseResult.success;
  if (!valid) {
    const failureReason = JSON.stringify(parseResult.error.message, null, 2);
    throw new Error(`Tree validation failed: ${failureReason}`);
  }
  // Zod will not only validate, but also will upgrade from v0.1.2 to v0.1.3 via transform.
  // We also want to return a boolean indicating whether the tree was upgraded.
  const didUpgrade = (currTree.version !== latestSchemaVersion);
  return [parseResult.data, didUpgrade];
}

/**
 * Handler for JSON imports. Validates and upgrades against the hierarchical sets schema.
 * @param {string} result The data passed from the FileReader as a string.
 * @param {string} datatype The data type to validate against.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * @returns {object} The imported tree object.
 * @throws {Error} Throws error if validation fails or if the datatype does not match.
 */
// eslint-disable-next-line no-unused-vars
export function handleImportJSON(result, datatype, theme) {
  let importData = JSON.parse(result);
  // Validate the imported file.
  [importData] = tryUpgradeTreeToLatestSchema(importData, datatype);
  return importData;
}

/**
 * Handler for tabular imports. Validates against the tabular sets schema.
 * @param {string} result The data passed from the FileReader as a string.
 * @param {string} datatype The data type to validate against.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * @returns {object} The imported tree object.
 * @throws {Error} Throws error if validation fails or if the datatype does not match.
 */
export function handleImportTabular(result, datatype, theme) {
  const dsvParser = dsvFormat(SEPARATOR_TABULAR);
  const importData = dsvParser.parse(result, row => ({
    groupName: row.groupName,
    setName: row.setName,
    setColor: (row.setColor ? colorStringToArray(row.setColor) : getDefaultColor(theme)),
    obsId: row.obsId,
    predictionScore: (
      (
        isNil(row.predictionScore)
        || row.predictionScore === NA_VALUE_TABULAR
      )
        ? null
        : +row.predictionScore
    ),
  }));
  // Validate the imported file.
  const zodSchema = TABULAR_SCHEMAS.schema;
  const parseResult = zodSchema.safeParse(importData);
  const valid = parseResult.success;
  if (!valid) {
    const failureReason = JSON.stringify(parseResult.error.message, null, 2);
    throw new Error(`Import validation failed: ${failureReason}`);
  } else {
    const parsedData = parseResult.data;
    // Convert the validated array to a tree representation.
    const treeToImport = {
      version: HIERARCHICAL_SCHEMAS.latestVersion,
      tree: [],
    };
    const uniqueGroupNames = Array.from(new Set(parsedData.map(d => d.groupName)));
    uniqueGroupNames.forEach((groupName) => {
      const levelZeroNode = {
        name: groupName,
        children: [],
      };
      const groupRows = parsedData.filter(d => d.groupName === groupName);
      const uniqueSetNames = Array.from(new Set(groupRows.map(d => d.setName)));
      uniqueSetNames.forEach((setName) => {
        const setRows = groupRows.filter(d => d.setName === setName);
        const { setColor } = setRows[0];
        const levelOneNode = {
          name: setName,
          color: setColor,
          set: setRows.map(d => ([d.obsId, d.predictionScore])),
        };
        levelZeroNode.children.push(levelOneNode);
      });
      treeToImport.tree.push(levelZeroNode);
    });
    return treeToImport;
  }
}

/**
 * Convert a tree object to a JSON representation.
 * @param {object} result The object to export.
 * @returns {string} The data in a string representation.
 */
export function handleExportJSON(result) {
  const jsonString = JSON.stringify(result);
  const dataString = `data:${MIME_TYPE_JSON};charset=utf-8,${encodeURIComponent(jsonString)}`;
  return dataString;
}

/**
 * Convert a tree object with one level (height === 1) to a tabular representation.
 * @param {object} result The object to export.
 * @returns {string} The data in a string representation.
 */
export function handleExportTabular(result) {
  // Convert a tree object to an array of JSON objects.
  const exportData = [];
  result.tree.forEach((levelZeroNode) => {
    levelZeroNode.children.forEach((levelOneNode) => {
      if (levelOneNode.set) {
        levelOneNode.set.forEach(([obsId, prob]) => {
          exportData.push({
            groupName: levelZeroNode.name,
            setName: levelOneNode.name,
            setColor: colorArrayToString(levelOneNode.color),
            obsId,
            predictionScore: isNil(prob) ? NA_VALUE_TABULAR : prob,
          });
        });
      }
    });
  });
  const parser = new Parser({
    fields: ['groupName', 'setName', 'setColor', 'obsId', 'predictionScore'],
    delimiter: SEPARATOR_TABULAR,
  });
  const csvString = parser.parse(exportData);
  const dataString = `data:${MIME_TYPE_TABULAR};charset=utf-8,${encodeURIComponent(csvString)}`;
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
