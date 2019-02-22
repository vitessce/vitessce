import React from 'react';


export default function FileManager(props) {
  const { layerNames } = props;
  const layerNamesLis = layerNames.map(
    layerName => <li className="list-group-item" key={layerName}>{layerName}</li>,
  );
  return (
    <div>
      <ul className="list-group">{layerNamesLis}</ul>
    </div>
  );
}
