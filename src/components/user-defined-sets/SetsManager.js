import React from 'react';
import CurrentSetManager from './CurrentSetManager';

export default function SetsManager(props) {
  const {
    sets,
    onUpdateSets = (msg) => {
      console.warn(`onUpdateSets from SetsManager ${msg}`);
    },
  } = props;
  return (
    <div className="sets-manager">
      <CurrentSetManager sets={sets} onUpdateSets={onUpdateSets} />
      <div className="set-list">
        {Array.from(sets.namedSets.keys()).reverse().map(key => (
          <div className="set-name" key={key}>
            {key}
            <small>{sets.namedSets.get(key).size}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
