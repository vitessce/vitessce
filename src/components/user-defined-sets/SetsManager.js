import React from 'react';
import CurrentSetManager from './CurrentSetManager';

export default function SetsManager({ sets }) {
  return (
    <div className="sets-manager">
      <CurrentSetManager sets={sets} />
    </div>
  );
}
