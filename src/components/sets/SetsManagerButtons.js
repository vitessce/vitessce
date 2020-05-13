import React, { useCallback } from 'react';
import PopoverMenu from './PopoverMenu';
import { handleImportJSON } from './io';

import { ReactComponent as SetViewSVG } from '../../assets/sets/eye.svg';
import { ReactComponent as SetUnionSVG } from '../../assets/sets/union.svg';
import { ReactComponent as SetIntersectionSVG } from '../../assets/sets/intersection.svg';
import { ReactComponent as SetComplementSVG } from '../../assets/sets/complement.svg';


export function PlusButton(props) {
  const {
    datatype, onError, onImportTree, onCreateLevelZeroNode,
  } = props;

  /**
   * Import a file, then process the imported data via the supplied handler function.
   * @param {Function} importHandler The function to process the imported data.
   * @param {string} mimeType The accepted mime type for the file upload input.
   * @returns {Function} An onImport function corresponding to the supplied parameters.
   */
  const onImport = useCallback((importHandler, mimeType) => () => {
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
        try {
          const treeToImport = importHandler(result, datatype);
          onError(false); // Clear any previous import error.
          onImportTree(treeToImport);
        } catch (e) {
          onError(e.message);
        }
      }, false);
      reader.readAsText(files[0]);
    });
    uploadInputNode.remove();
  }, [datatype, onError, onImportTree]);

  const menuConfig = [
    {
      name: 'Create hierarchy',
      handler: onCreateLevelZeroNode,
      handlerKey: 'c',
    },
    {
      name: 'Import hierarchy (from JSON)',
      handler: onImport(handleImportJSON, 'application/json'),
      handlerKey: 'i',
    },
  ];

  return (
    <PopoverMenu
      menuConfig={menuConfig}
      onClose={() => {}}
    >
      <button className="new-node-button" type="submit">+</button>
    </PopoverMenu>
  );
}

export function SetOperationButtons(props) {
  const {
    onUnion,
    onIntersection,
    onComplement,
    onView,
  } = props;

  return (
    <div className="set-operation-buttons">
      <button
        onClick={onView}
        type="submit"
        title="View checked sets"
      >
        <SetViewSVG />
      </button>
      <button
        onClick={onUnion}
        title="New set from union of checked sets"
        type="submit"
      >
        <SetUnionSVG />
      </button>
      <button
        onClick={onIntersection}
        title="New set from intersection of checked sets"
        type="submit"
      >
        <SetIntersectionSVG />
      </button>
      <button
        onClick={onComplement}
        title="New set from complement of checked sets"
        type="submit"
      >
        <SetComplementSVG />
      </button>
    </div>
  );
}
