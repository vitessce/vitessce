import React from 'react';

export default function Description(props) {
  const { description, metadata } = props;

  return (
    <div className="description">
      <p>{description}</p>

      {Object.entries(metadata).map(([layerName, layerMetadata]) => (
        <details key={layerName}>
          <summary>{layerName}</summary>
          <div className="metadata-container">
            <table>
              <tbody>
                {Object.entries(layerMetadata)
                  .map(([key, value]) => (
                    <tr key={key}>
                      <th title={key}>{key}</th>
                      <td title={value}>{value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </div>
  );
}
