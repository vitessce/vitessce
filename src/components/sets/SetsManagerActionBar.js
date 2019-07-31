import React from 'react';
import Ajv from 'ajv';
import { Icon } from 'antd';
import { version } from '../../../package.json';
import 'antd/es/icon/style/index.css';
import PopoverMenu from './PopoverMenu';
import SetUnionSVG from '../../assets/sets/union.svg';
import SetIntersectionSVG from '../../assets/sets/intersection.svg';
import SetComplementSVG from '../../assets/sets/complement.svg';

import hierarchicalSetsSchema from '../../schemas/hierarchical-sets.schema.json';

export default function SetsManagerActionBar(props) {
  const {
    setsTree, datasetId, setsType,
    onError = (err) => {
      console.warn(`SetsManagerActionBar onError: ${err}`);
    },
  } = props;

  function onUnion() {
    const checkedUnion = setsTree.getUnion(setsTree.checkedKeys);
    setsTree.setCurrentSet(checkedUnion, true, 'Current union');
    setsTree.emitVisibilityUpdate();
  }

  function onIntersection() {
    const checkedIntersection = setsTree.getIntersection(setsTree.checkedKeys);
    setsTree.setCurrentSet(checkedIntersection, true, 'Current intersection');
    setsTree.emitVisibilityUpdate();
  }

  function onComplement() {
    const checkedComplement = setsTree.getComplement(setsTree.checkedKeys);
    setsTree.setCurrentSet(checkedComplement, true, 'Current complement');
    setsTree.emitVisibilityUpdate();
  }

  function onImport() {
    const uploadInputNode = document.createElement('input');
    uploadInputNode.setAttribute('type', 'file');
    uploadInputNode.setAttribute('accept', 'application/json');
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
          setsTree.import(importData.setsTree, importData.setsName);
        }
      }, false);
      reader.readAsText(files[0]);
    });
    uploadInputNode.remove();
  }

  function onExport() {
    const timestamp = (new Date().toLocaleString());
    const exportData = {
      datasetId,
      setsName: `Export ${timestamp}`,
      setsType,
      version,
      setsTree: setsTree.export(),
    };
    // eslint-disable-next-line prefer-template
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData));
    const fileExtension = 'json';
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${datasetId}-${setsType}-sets.${fileExtension}`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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
          name: 'Import',
          handler: onImport,
          handlerKey: 'i',
        }, {
          name: 'Export',
          handler: onExport,
          handlerKey: 'e',
        }]}
      >
        <Icon type="more" />
      </PopoverMenu>
    </div>
  );
}
