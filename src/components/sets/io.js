import Ajv from 'ajv';
import { dsvFormat } from 'd3-dsv';
import { parse as json2csv } from 'json2csv';
import { colorArrayToString, colorStringToArray } from './utils';
import { nodeTransform } from './reducer';
import { DEFAULT_COLOR } from '../utils';
import {
  HIERARCHICAL_SCHEMAS, TABULAR_SCHEMAS,
  MIME_TYPE_JSON, MIME_TYPE_TABULAR,
  SEPARATOR_TABULAR, NA_VALUE_TABULAR,
} from './constants';

/**
 * Check if an imported tree has an old schema version that we know how to
 * "upgrade" to the latest schema version.
 * @param {object} currTree A hierarchical tree object with a .version property,
 * which has already passed schema validation, but may not have the latest schema version.
 * @param {string} datatype The data type of the items in the schema.
 */
export function tryUpgradeToLatestSchema(currTree, datatype) {
  if (currTree.version === '0.1.2') {
    // To upgrade from cell-sets schema 0.1.2 to 0.1.3,
    // add a confidence value of null for each cell ID.
    return {
      ...currTree,
      version: HIERARCHICAL_SCHEMAS[datatype].latestVersion,
      tree: currTree.tree.map(levelZeroNode => nodeTransform(
        levelZeroNode,
        n => !n.children && Array.isArray(n.set),
        n => ({ ...n, set: n.set.map(itemId => ([itemId, null])) }),
      )),
    };
  }
  return currTree;
}

/**
 * Handler for JSON imports. Validates against the hierarchical sets schema.
 * @param {string} result The data passed from the FileReader as a string.
 * @param {string} datatype The data type to validate against.
 * @returns {object} The imported tree object.
 * @throws {Error} Throws error if validation fails or if the datatype does not match.
 */
export function handleImportJSON(result, datatype) {
  let importData = JSON.parse(result);
  // Validate the imported file.
  const validate = new Ajv().compile(HIERARCHICAL_SCHEMAS[datatype].schema);
  const valid = validate(importData);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    throw new Error(`Import validation failed: ${failureReason}`);
  } else if (importData.datatype !== datatype) {
    throw new Error(
      `The imported data type does not match the expected data type of '${datatype}'.`,
    );
  } else {
    importData = tryUpgradeToLatestSchema(importData, datatype);
    return importData;
  }
}

/**
 * Handler for tabular imports. Validates against the tabular sets schema.
 * @param {string} result The data passed from the FileReader as a string.
 * @param {string} datatype The data type to validate against.
 * @returns {object} The imported tree object.
 * @throws {Error} Throws error if validation fails or if the datatype does not match.
 */
export function handleImportTabular(result, datatype) {
  const dsvParser = dsvFormat(SEPARATOR_TABULAR);
  const importData = dsvParser.parse(result, row => ({
    group_name: row.group_name,
    set_name: row.set_name,
    set_color: (row.set_color ? colorStringToArray(row.set_color) : DEFAULT_COLOR),
    cell_id: row.cell_id,
    prediction_score: ((!row.prediction_score || row.prediction_score === NA_VALUE_TABULAR)
      ? null
      : +row.prediction_score
    ),
  }));
  // Validate the imported file.
  const validate = new Ajv().compile(TABULAR_SCHEMAS[datatype].schema);
  const valid = validate(importData);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    throw new Error(`Import validation failed: ${failureReason}`);
  } else {
    // Convert the validated array to a tree representation.
    const treeToImport = {
      version: HIERARCHICAL_SCHEMAS[datatype].latestVersion,
      datatype,
      tree: [],
    };
    const uniqueGroupNames = Array.from(new Set(importData.map(d => d.group_name)));
    uniqueGroupNames.forEach((groupName) => {
      const levelZeroNode = {
        name: groupName,
        children: [],
      };
      const groupRows = importData.filter(d => d.group_name === groupName);
      const uniqueSetNames = Array.from(new Set(groupRows.map(d => d.set_name)));
      uniqueSetNames.forEach((setName) => {
        const setRows = groupRows.filter(d => d.set_name === setName);
        const setColor = setRows[0].set_color;
        const levelOneNode = {
          name: setName,
          color: setColor,
          set: setRows.map(d => ([d.cell_id, d.prediction_score])),
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
        levelOneNode.set.forEach((cellId) => {
          exportData.push({
            group_name: levelZeroNode.name,
            set_name: levelOneNode.name,
            set_color: colorArrayToString(levelOneNode.color),
            cell_id: cellId[0],
            prediction_score: cellId[1] || NA_VALUE_TABULAR,
          });
        });
      }
    });
  });
  const csvString = json2csv(exportData, {
    fields: ['group_name', 'set_name', 'set_color', 'cell_id', 'prediction_score'],
    delimiter: SEPARATOR_TABULAR,
  });
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
