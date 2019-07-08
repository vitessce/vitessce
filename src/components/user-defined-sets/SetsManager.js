import React from 'react';
import CurrentSetManager from './CurrentSetManager';

export default function SetsManager({ sets }) {
  return (
    <div className="sets-manager">
      <CurrentSetManager sets={sets} />
      <div className="named-set-list">
        {sets.getKeys().map(key => (
          <div className="named-set" key={key}>
            {key}
            <small>{sets.getNamedSet(key).size}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
