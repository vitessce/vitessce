import React from 'react';


export default function LayerManager(props) {
  const { layerNames } = props;
  const layerNamesLis = layerNames.map(
    layerName => <li className="list-group-item py-1" key={layerName}>{layerName}</li>,
  );
  return (
    <div>
      <ul className="list-group">{layerNamesLis}</ul>
    </div>
  );
}
