import React, { useState } from 'react';
import * as Sets from './sets';

export default function NamedSetManager(props) {
  const {
    sets,
    name,
    onUpdateSets = (msg) => {
      console.warn(`onUpdateSets from NamedSetManager ${msg}`);
    },
  } = props;
  const set = sets.namedSets[name];
  const [isEditing, setIsEditing] = useState(false);
  const [setName, setSetName] = useState(name);

  const renameSet = () => {
    setIsEditing(false);
    onUpdateSets(Sets.renameNamedSet(sets, name, setName));
  };

  const deleteSet = () => {
    setIsEditing(false);
    onUpdateSets(Sets.deleteNamedSet(sets, name));
  };

  const updateCurrentSet = (name) => {
    onUpdateSets(Sets.setCurrentSet(sets, sets.namedSets[name]));
  };

  return (
    <React.Fragment>
      <tr className="set-name">
        <td>
          {isEditing
            ? <input value={setName} onChange={e => setSetName(e.target.value)} type="text" />
            : <button type="button" className="select-button" onClick={() => updateCurrentSet(name)}>{name}</button>}
        </td>
        {isEditing
          ? (
            <td className="set-edit">
              <button type="button" onClick={deleteSet}>🗑</button>
            </td>
          )
          : (
            <td className="set-count">
              <small>{set.length}</small>
            </td>
          )}
        {isEditing
          ? (
            <td className="set-edit">
              <button type="button" onClick={renameSet}>💾</button>
            </td>
          )
          : (
            <td className="set-edit">
              <button type="button" className="edit-button" onClick={() => setIsEditing(true)}>✏️</button>
            </td>
          )
        }
      </tr>
    </React.Fragment>
  );
}
