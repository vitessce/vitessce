import React from 'react';
import { Icon } from 'antd';
import 'antd/es/icon/style/index.css';
import PopoverMenu from './PopoverMenu';
import SetUnionSVG from '../../assets/sets/union.svg';
import SetIntersectionSVG from '../../assets/sets/intersection.svg';
import SetComplementSVG from '../../assets/sets/complement.svg';

export default function (props) {
  const { setsTree } = props;

  function onUnion() {
    const checkedUnion = setsTree.getUnion(setsTree.checkedKeys);
    setsTree.setCurrentSet(checkedUnion, true);
    setsTree.emitVisibilityUpdate();
  }

  function onIntersection() {
    const checkedIntersection = setsTree.getIntersection(setsTree.checkedKeys);
    setsTree.setCurrentSet(checkedIntersection, true);
    setsTree.emitVisibilityUpdate();
  }

  function onComplement() {
    const checkedComplement = setsTree.getComplement(setsTree.checkedKeys);
    setsTree.setCurrentSet(checkedComplement, true);
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
        console.warn('The File APIs are not fully supported in this browser.');
        return;
      }
      const { files } = event.target;
      if (!files || files.length !== 1) {
        console.warn('Incorrect number of files selected.');
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const { result } = reader;
        setsTree.import(JSON.parse(result));
      }, false);
      reader.readAsText(files[0]);
    });
    uploadInputNode.remove();
  }

  function onExport() {
    // eslint-disable-next-line prefer-template
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(setsTree.export()));
    const fileExtension = 'json';
    const exportName = 'test';
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${exportName}.${fileExtension}`);
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
