import React from 'react';
import Ajv from 'ajv';
import tinycolor from 'tinycolor2';
import { dsvFormat } from 'd3-dsv';
import { parse as json2csv } from 'json2csv';
import { Icon } from 'antd';
import { version } from '../../../package.json';
import 'antd/es/icon/style/index.css';
import PopoverMenu from './PopoverMenu';
import { PATH_SEP } from './sets';
import SetUnionSVG from '../../assets/sets/union.svg';
import SetIntersectionSVG from '../../assets/sets/intersection.svg';
import SetComplementSVG from '../../assets/sets/complement.svg';

import hierarchicalSetsSchema from '../../schemas/hierarchical-sets.schema.json';

const tabularFileType = 'tsv';
const tabularColumnSeparator = '\t';
const tabularHierarchySeparator = ';';

/**
 * Check whether the elements of two arrays are equal.
 * @param {Array} a One of the two arrays.
 * @param {Array} b The other of the two arrays.
 * @returns {boolean} Whether the two arrays contain the same elements.
 */
function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export default function SetsManagerActionBar(props) {
  const {
    setsTree, datasetId, setsType,
    onError = (err) => {
      console.warn(`SetsManagerActionBar onError: ${err}`);
    },
  } = props;

  /**
   * Perform the union set operation, updating the current set.
   */
  function onUnion() {
    const checkedUnion = setsTree.getUnion(setsTree.checkedKeys);
    setsTree.setCurrentSet(checkedUnion, true, 'Current union');
    setsTree.emitVisibilityUpdate();
  }

  /**
   * Perform the intersection set operation, updating the current set.
   */
  function onIntersection() {
    const checkedIntersection = setsTree.getIntersection(setsTree.checkedKeys);
    setsTree.setCurrentSet(checkedIntersection, true, 'Current intersection');
    setsTree.emitVisibilityUpdate();
  }

  /**
   * Perform the complement set operation, updating the current set.
   */
  function onComplement() {
    const checkedComplement = setsTree.getComplement(setsTree.checkedKeys);
    setsTree.setCurrentSet(checkedComplement, true, 'Current complement');
    setsTree.emitVisibilityUpdate();
  }

  /**
   * Import a file, then process the imported data via the supplied handler function.
   * @param {string} mimetype The accepted mime type for the file upload input.
   * @param {Function} importHandler The function to process the imported data.
   * @returns {Function} An onImport function corresponding to the supplied parameters.
   */
  function onImport(mimetype, importHandler) {
    return () => {
      const uploadInputNode = document.createElement('input');
      uploadInputNode.setAttribute('type', 'file');
      uploadInputNode.setAttribute('accept', mimetype);
      document.body.appendChild(uploadInputNode); // required for firefox
      uploadInputNode.click();
      uploadInputNode.addEventListener('change', (event) => {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
          onError('Local file reading APIs are not fully supported in this browser.');
          return;
        }
        const { files } = event.target;
        if (!files || files.length !== 1) {
          onError('Incorrect number of files selected.');
          return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const { result } = reader;
          importHandler(result);
        }, false);
        reader.readAsText(files[0]);
      });
      uploadInputNode.remove();
    };
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
   * @param {string} result The data passed from the onImport function as a string.
   */
  function handleImportTabular(result) {
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
      // Use the first item of the set to get the set name and set color values
      // that will be used for the whole set.
      const firstItem = setItems[0];
      const setNameArray = firstItem.setName.split(tabularHierarchySeparator);
      importedSetsTree.push({
        name: setNameArray[setNameArray.length - 1],
        key: setKey,
        set: setItems.map(d => d.itemId),
        color: firstItem.setColor,
      });
    });
    setsTree.import(importedSetsTree, makeImportName());
  }

  /**
   * Handler for JSON imports.
   * @param {string} result The data passed from the onImport function as a string.
   */
  function handleImportJSON(result) {
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
   * Downloads a file to the browser.
   * @param {string} dataString The data as a string.
   * @param {string} fileName The name of the file to be downloaded.
   */
  function onExport(dataString, fileName) {
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataString);
    downloadAnchorNode.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  /**
   * Download the sets tree in a tabular representation.
   * Uses set keys as unique set identifiers to allow repeated set names.
   */
  function onExportTabular() {
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
      }
      // Within a set, iterate over each item to create a new row of the table.
      node.set.forEach((item) => {
        exportData.push({
          'Item ID': item,
          'Set Key': node.key,
          'Set Name': prevNodeNameArray.join(tabularHierarchySeparator),
          'Set Color': tinycolor({ r: node.color[0], g: node.color[1], b: node.color[2] })
            .toHexString(),
        });
      });
    });
    // Export to tabular file and do the download.
    const csv = json2csv(exportData, {
      fields: Object.keys(exportData[0]),
      delimiter: tabularColumnSeparator,
    });
    const dataString = `data:text/${tabularFileType};charset=utf-8,${encodeURIComponent(csv)}`;
    const fileExtension = tabularFileType;
    const fileName = `${datasetId}-${setsType}-sets.${fileExtension}`;
    onExport(dataString, fileName);
  }

  /**
   * Download the sets tree in a JSON representation.
   */
  function onExportJSON() {
    const exportData = {
      datasetId,
      setsType,
      version,
      setsTree: setsTree.export(),
    };
    // eslint-disable-next-line prefer-template
    const dataString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData));
    const fileExtension = 'json';
    const fileName = `${datasetId}-${setsType}-sets.${fileExtension}`;
    onExport(dataString, fileName);
  }

  return (
    <div className="sets-manager-icon-bar">
      <Icon
        component={SetUnionSVG}
        title="New set from union of checked sets"
        onClick={onUnion}
      />
      <Icon
        component={SetIntersectionSVG}
        title="New set from intersection of checked sets"
        onClick={onIntersection}
      />
      <Icon
        component={SetComplementSVG}
        title="New set from complement of checked sets"
        onClick={onComplement}
      />
      <PopoverMenu
        placement="bottom"
        menuConfig={[{
          name: 'Import TSV',
          handler: onImport(`text/${tabularFileType}`, handleImportTabular),
          handlerKey: 't',
        }, {
          name: 'Import JSON',
          handler: onImport('application/json', handleImportJSON),
          handlerKey: 'j',
        }, {
          name: 'Export TSV',
          handler: onExportTabular,
          handlerKey: 's',
        }, {
          name: 'Export JSON',
          handler: onExportJSON,
          handlerKey: 'o',
        }]}
      >
        <Icon type="more" />
      </PopoverMenu>
    </div>
  );
}
