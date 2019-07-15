import React from 'react';
import CurrentSetManager from './CurrentSetManager';
import NamedSetManager from './NamedSetManager';
import * as Sets from './sets';

export default function SetsManager(props) {
  const {
    sets,
    onUpdateSets = (msg) => {
      console.warn(`onUpdateSets from SetsManager ${msg}`);
    },
  } = props;

  const onImport = () => {
    console.log('importing');
  };

  const onExport = () => {
    // eslint-disable-next-line prefer-template
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(Sets.exportClean(sets)));
    const fileExtension = 'json';
    const exportName = 'test';
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${exportName}.${fileExtension}`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="sets-manager">
      <CurrentSetManager sets={sets} onUpdateSets={onUpdateSets} />
      <table className="set-list">
        <tbody>
          {Object.keys(sets.namedSets).sort().map(name => (
            <NamedSetManager key={name} sets={sets} name={name} onUpdateSets={onUpdateSets} />
          ))}
        </tbody>
      </table>
      <div className="set-io">
        <button onClick={onImport} type="button">Import</button>
        <button onClick={onExport} type="button">Export</button>
      </div>
    </div>
  );
}
