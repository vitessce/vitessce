import Ajv from 'ajv';
import { dsvFormat } from 'd3-dsv';
import { parse as json2csv } from 'json2csv';
import { colorArrayToString, colorStringToArray } from './utils';
import { DEFAULT_COLOR } from '../utils';
import cellSetsSchema from '../../schemas/cellSets.schema.json';
import cellSetsTabularSchema from '../../schemas/cellSetsTabular.schema.json';

export const FILE_EXTENSION_JSON = 'json';
export const MIME_TYPE_JSON = 'application/json';

export const FILE_EXTENSION_TABULAR = 'csv';
export const MIME_TYPE_TABULAR = 'text/csv';
export const SEPARATOR_TABULAR = ',';

export const HIERARCHICAL_SCHEMAS = {
  cell: {
    version: '0.1.2',
    schema: cellSetsSchema,
  },
};

export const TABULAR_SCHEMAS = {
  cell: {
    schema: cellSetsTabularSchema,
  },
};

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
      version: HIERARCHICAL_SCHEMAS[datatype].version,
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
          set: setRows.map(d => d.cell_id),
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
            cell_id: cellId,
          });
        });
      }
    });
  });
  const csvString = json2csv(exportData, {
    fields: ['group_name', 'set_name', 'set_color', 'cell_id'],
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
