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
        {sets.namedSets.mapEntries(([key, set]) => [key, (
          <div className="set-name" key={key}>
            {key}
            <small>{set.size}</small>
          </div>
        )]).toSet().toArray()}
      </div>
    </div>
  );
}
