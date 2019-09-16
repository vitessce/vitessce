import React from 'react';
import { Icon } from 'antd';
import 'antd/es/icon/style/index.css';
import PopoverMenu from './PopoverMenu';
import SetUnionSVG from '../../assets/sets/union.svg';
import SetIntersectionSVG from '../../assets/sets/intersection.svg';
import SetComplementSVG from '../../assets/sets/complement.svg';

import {
  tabularFileType, tabularFileExtension,
  handleImportTabular, handleImportJSON,
  handleExportTabular, handleExportJSON,
} from './io';

export default function SetsManagerActionBar(props) {
  const {
    setsTree, datasetId, setsType,
    onError = (err) => {
      console.warn(`SetsManagerActionBar onError: ${err}`);
      // NOTE: Because this is used in the non-pubsub SetsManager,
      // it would be inappropriate to use our STATUS_WARN event here...
      // If we were to need that integration, a callback needs to be passed in.
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
   * @param {Function} importHandler The function to process the imported data.
   * @param {string} mimeType The accepted mime type for the file upload input.
   * @returns {Function} An onImport function corresponding to the supplied parameters.
   */
  function onImport(importHandler, mimeType) {
    return () => {
      const uploadInputNode = document.createElement('input');
      uploadInputNode.setAttribute('type', 'file');
      uploadInputNode.setAttribute('accept', mimeType);
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
          importHandler(props, result);
        }, false);
        reader.readAsText(files[0]);
      });
      uploadInputNode.remove();
    };
  }

  /**
   * Downloads a file from the browser.
   * @param {string} exportHandler The function that converts the data to a string.
   * @param {string} fileExtension The extension of the file to be downloaded.
   */
  function onExport(exportHandler, fileExtension) {
    return () => {
      const dataString = exportHandler(props);
      const fileName = `${datasetId}-${setsType}-sets.${fileExtension}`;
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataString);
      downloadAnchorNode.setAttribute('download', fileName);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    };
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
          name: `Import ${tabularFileType}`,
          handler: onImport(handleImportTabular, `text/${tabularFileExtension}`),
          handlerKey: 't',
        }, {
          name: 'Import JSON',
          handler: onImport(handleImportJSON, 'application/json'),
          handlerKey: 'j',
        }, {
          name: `Export ${tabularFileType}`,
          handler: onExport(handleExportTabular, tabularFileExtension),
          handlerKey: 's',
        }, {
          name: 'Export JSON',
          handler: onExport(handleExportJSON, 'json'),
          handlerKey: 'o',
        }]}
      >
        <Icon type="more" />
      </PopoverMenu>
    </div>
  );
}
