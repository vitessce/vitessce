/* eslint-disable jsx-a11y/accessible-emoji */
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
  const set = sets.namedSets.get(name);
  if (!set) {
    console.warn('Invalid set encountered in NamedSetManager');
  }
  const [isEditing, setIsEditing] = useState(false);
  const [setName, setSetName] = useState(name);

  function renameSet() {
    setIsEditing(false);
    onUpdateSets(Sets.renameNamedSet(sets, name, setName));
  }

  function deleteSet() {
    setIsEditing(false);
    onUpdateSets(Sets.deleteNamedSet(sets, name));
  }

  function updateCurrentSet(nameToSelect) {
    onUpdateSets(Sets.setCurrentSet(sets, sets.namedSets.get(nameToSelect)));
  }

  if (isEditing) {
    return (
      <tr className="set-name">
        <td>
          <input
            value={setName}
            onKeyDown={e => (e.keyCode === 13 ? renameSet() : null)}
            onChange={e => setSetName(e.target.value)}
            type="text"
          />
        </td>
        <td className="set-edit">
          <button type="button" onClick={deleteSet}>🗑</button>
        </td>
        <td className="set-edit">
          <button type="button" onClick={renameSet}>💾</button>
        </td>
      </tr>
    );
  }
  return (
    <tr className="set-name">
      <td>
        <button type="button" className="select-button" onClick={() => updateCurrentSet(name)}>{name}</button>
      </td>
      <td className="set-count">
        <small>{set.length}</small>
      </td>
      <td className="set-edit">
        <button type="button" className="edit-button" onClick={() => setIsEditing(true)}>✏️</button>
      </td>
    </tr>
  );
}
