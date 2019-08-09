import { dsvFormat } from 'd3-dsv';
import Ajv from 'ajv';
import tinycolor from 'tinycolor2';
import { parse as json2csv } from 'json2csv';
import { version } from '../../../package.json';
import { PATH_SEP } from './sets';

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
  const {
    setsTree,
  } = props;
  const dsvParser = dsvFormat(tabularColumnSeparator);
  /**
     * Convert a string color representation to an array of [r,g,b].
     * @param {string} colorString The color as a string.
     * @returns {Array} The color as an array.
     */
  function colorAsArray(colorString) {
    return Object.entries(tinycolor(colorString).toRgb())
      .filter(c => c[0] !== 'a').map(c => c[1]);
  }
  // Fall back to set name if set key not provided.
  const importData = dsvParser.parse(result, row => ({
    itemId: row['Item ID'],
    setName: row['Set Name'],
    setKey: row['Set Key'] || row['Set Name'].split(tabularHierarchySeparator).join(PATH_SEP),
    setColor: colorAsArray(row['Set Color']),
  }));
    // Make array of unique set key strings.
  const importedSetKeys = Array.from(new Set(importData.map(d => d.setKey)));
  // Construct the array representation of the tree required by the tree import function.
  const importedSetsTree = [];
  // Iterate over each set and append to the tree array representation.
  importedSetKeys.forEach((setKey) => {
    const setItems = importData.filter(d => d.setKey === setKey);
    const isEmpty = setItems.length === 1 && setItems[0].itemId === tabularNA;
    // Use the first item of the set to get the set name and set color values
    // that will be used for the whole set.
    const firstItem = setItems[0];
    const setNameArray = firstItem.setName.split(tabularHierarchySeparator);
    importedSetsTree.push({
      name: setNameArray[setNameArray.length - 1],
      key: setKey,
      set: (!isEmpty ? setItems.map(d => d.itemId) : []),
      color: firstItem.setColor,
    });
  });
  setsTree.import(importedSetsTree, makeImportName());
}

/**
   * Handler for JSON imports.
   * @param {object} props The component props.
   * @param {string} result The data passed from the onImport function as a string.
   */
export function handleImportJSON(props, result) {
  const {
    datasetId,
    setsType,
    setsTree,
    onError,
  } = props;
  const importData = JSON.parse(result);
  // Validate the imported file.
  const validate = new Ajv().compile(hierarchicalSetsSchema);
  const valid = validate(importData);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    onError(`Import validation failed: ${failureReason}`);
  } else if (importData.datasetId !== datasetId) {
    onError('The imported datasetId does not match the current datasetId.');
  } else if (importData.version !== version) {
    onError('The imported schema version is not compatible with the current schema version.');
  } else if (importData.setsType !== setsType) {
    onError('The imported setsType does not match the current setsType.');
  } else {
    onError(false); // Clear any previous import error.
    setsTree.import(importData.setsTree, makeImportName());
  }
}

/**
   * Convert the tree to a tabular representation and then a string.
   * Uses set keys as unique set identifiers to allow repeated set names.
   * @param {object} props The component props.
   * @returns {string} The data in a string representation.
   */
export function handleExportTabular(props) {
  const {
    setsTree,
  } = props;
  const exportedSetsTree = setsTree.export();
  const exportData = [];
  let prevNodeNameArray = [exportedSetsTree[0].name];
  let prevNodeKeyArray = [exportedSetsTree[0].key];
  // Iterate over each set.
  exportedSetsTree.forEach((node) => {
    // Compute the hierarchical name for the current node,
    // assuming the array of exported nodes is sorted.
    const currNodeKeyArray = node.key.split(PATH_SEP);
    if (arraysEqual(currNodeKeyArray, prevNodeKeyArray)) {
      // Do nothing, the node key and name are correct.
    } else if (arraysEqual(
      currNodeKeyArray.slice(0, currNodeKeyArray.length - 1),
      prevNodeKeyArray,
    )) {
      // The current node is a child of the previous node, so update the prev key and name.
      prevNodeKeyArray = currNodeKeyArray;
      prevNodeNameArray.push(node.name);
    } else if (currNodeKeyArray.length === 1) {
      // The current node is at the first level of the tree, so reset the prev key and name.
      prevNodeNameArray = [node.name];
      prevNodeKeyArray = currNodeKeyArray;
    } else if (arraysEqual(
      currNodeKeyArray.slice(0, currNodeKeyArray.length - 1),
      prevNodeKeyArray.slice(0, prevNodeKeyArray.length - 1),
    )) {
      // The current node is at the same level as the previous node but is different.
      prevNodeKeyArray = currNodeKeyArray;
      prevNodeNameArray = [...prevNodeNameArray.slice(0, prevNodeNameArray.length - 1), node.name];
    }
    // Within a set, iterate over each item to create a new row of the table.
    if (node.set && node.set.length > 0) {
      node.set.forEach((item) => {
        exportData.push({
          'Item ID': item,
          'Set Key': node.key,
          'Set Name': prevNodeNameArray.join(tabularHierarchySeparator),
          'Set Color': tinycolor({ r: node.color[0], g: node.color[1], b: node.color[2] })
            .toHexString(),
        });
      });
    } else {
      exportData.push({
        'Item ID': tabularNA,
        'Set Key': node.key,
        'Set Name': prevNodeNameArray.join(tabularHierarchySeparator),
        'Set Color': tinycolor({ r: node.color[0], g: node.color[1], b: node.color[2] })
          .toHexString(),
      });
    }
  });
  // Export to tabular file and do the download.
  const csv = json2csv(exportData, {
    fields: Object.keys(exportData[0]),
    delimiter: tabularColumnSeparator,
  });
  const dataString = `data:text/${tabularFileExtension};charset=utf-8,${encodeURIComponent(csv)}`;
  return dataString;
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
