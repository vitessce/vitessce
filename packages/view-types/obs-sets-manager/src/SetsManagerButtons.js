import React, { useCallback } from 'react';
import {
  handleImportJSON,
  handleImportTabular,

  MIME_TYPE_JSON,
  MIME_TYPE_TABULAR,
} from '@vitessce/sets-utils';
import { SetUnionSVG, SetIntersectionSVG, SetComplementSVG } from '@vitessce/icons';
import PopoverMenu from './PopoverMenu.js';
import { useStyles } from './styles.js';

/**
 * A plus button for creating or importing set hierarchies.
 * @param {object} props
 * @param {string} props.datatype The data type to validate imported hierarchies against.
 * @param {function} props.onError A callback to pass error message strings.
 * @param {function} props.onImportTree A callback to pass successfully-validated tree objects.
 * @param {function} props.onCreateLevelZeroNode A callback to create a new empty
 * level zero node.
 * @param {boolean} props.importable Is importing allowed?
 * If not, the import button will not be rendered.
 * @param {boolean} props.editable Is editing allowed?
 * If not, the create button will not be rendered.
 */
export function PlusButton(props) {
  const {
    datatype, onError, onImportTree, onCreateLevelZeroNode,
    importable, editable,
  } = props;

  const { classes } = useStyles();

  /**
   * Import a file, then process the imported data via the supplied handler function.
   * @param {Function} importHandler The function to process the imported data.
   * @param {string} mimeType The accepted mime type for the file upload input.
   * @returns {Function} An import function corresponding to the supplied parameters.
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
    ...(editable ? [
      {
        title: 'Create hierarchy',
        handler: onCreateLevelZeroNode,
        handlerKey: 'n',
      },
    ] : []),
    ...(importable ? [
      {
        title: 'Import hierarchy',
        subtitle: '(from CSV file)',
        handler: onImport(handleImportTabular, MIME_TYPE_TABULAR),
        handlerKey: 'c',
      },
      {
        title: 'Import hierarchy',
        subtitle: '(from JSON file)',
        handler: onImport(handleImportJSON, MIME_TYPE_JSON),
        handlerKey: 'j',
      },
    ] : []),
  ];

  return (menuConfig.length > 0 ? (
    <PopoverMenu
      menuConfig={menuConfig}
    >
      <button className={classes.plusButton} type="submit">+</button>
    </PopoverMenu>
  ) : null);
}

/**
 * Set operations buttons (union, intersection, complement)
 * and a view checked sets button.
 * @param {object} props
 * @param {function} props.onUnion A callback for the union button.
 * @param {function} props.onIntersection A callback for the intersection button.
 * @param {function} props.onComplement A callback for the complement button.
 * @param {boolean} props.operatable Are set operations allowed?
 * If not, the union, intersection, and complement buttons will not be rendered.
 */
export function SetOperationButtons(props) {
  const unionText = 'New set from union of checked sets';
  const intersectionText = 'New set from intersection of checked sets';
  const complementText = 'New set from complement of checked sets';

  const {
    onUnion,
    onIntersection,
    onComplement,
    operatable,
    hasCheckedSetsToUnion,
    hasCheckedSetsToIntersect,
    hasCheckedSetsToComplement,
  } = props;

  return (
    <>
      {operatable && (
        <>
          <button
            onClick={onUnion}
            title={unionText}
            type="submit"
            disabled={!hasCheckedSetsToUnion}
          >
            <SetUnionSVG />
          </button>
          <button
            onClick={onIntersection}
            title={intersectionText}
            type="submit"
            disabled={!hasCheckedSetsToIntersect}
          >
            <SetIntersectionSVG />
          </button>
          <button
            onClick={onComplement}
            title={complementText}
            type="submit"
            disabled={!hasCheckedSetsToComplement}
          >
            <SetComplementSVG />
          </button>
        </>
      )}
    </>
  );
}
