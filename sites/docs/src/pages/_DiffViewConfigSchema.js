import React, { useState } from 'react';
// TODO: no longer exported by vit-s package
import { SCHEMA_HANDLERS, LATEST_VERSION } from '@vitessce/vit-s';

const viewConfigVersions = Object.keys(SCHEMA_HANDLERS);
const defaultPrev = viewConfigVersions[viewConfigVersions.indexOf(LATEST_VERSION) - 1];
const defaultNext = LATEST_VERSION;
const defaultRef = 'main';

function getCompareUrl(prevVersion, nextVersion) {
  return `https://observablehq.com/@keller-mark/vitessce-config-version-diff?ref=${defaultRef}&prev=${prevVersion}&next=${nextVersion}`;
}

export default function DiffViewConfigSchema() {
  const [prev, setPrev] = useState(defaultPrev);
  const [next, setNext] = useState(defaultNext);

  function handlePrevChange(event) {
    setPrev(event.target.value);
  }

  function handleNextChange(event) {
    setNext(event.target.value);
  }

  return (
    <p>
      Compare schema versions:&nbsp;
      <select onChange={handlePrevChange} value={prev}>
        {viewConfigVersions.slice(0, viewConfigVersions.length - 1).map(v => (
          <option value={v} key={v}>{v}</option>
        ))}
      </select> vs.&nbsp;
      <select onChange={handleNextChange} value={next}>
        {viewConfigVersions.slice(1).map(v => (
          <option value={v} key={v}>{v}</option>
        ))}
      </select>
      &nbsp;
      <a target="_blank" rel="noopener noreferrer" href={getCompareUrl(prev, next)}>Go</a>
    </p>
  );
}
