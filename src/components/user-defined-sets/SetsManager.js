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
      <div className="named-set-list">
        {Array.from(sets.namedSets.keys()).map(key => (
          <div className="named-set" key={key}>
            {key}
            <small>{sets.namedSets.get(key).size}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
