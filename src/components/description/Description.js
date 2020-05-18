import React from 'react';

export default function Description(props) {
  const { description, metadata } = props;

  return (
    <div className="description">
      <p>{description}</p>

      {metadata && Object.entries(metadata).map(([layerId, metadataRecord]) => (
        metadataRecord && Object.entries(metadataRecord.layerMetadata).length > 0 ? (
          <details key={layerId}>
            <summary>{metadataRecord.layerName}</summary>
            <div className="metadata-container">
              <table>
                <tbody>
                  {Object.entries(metadataRecord.layerMetadata)
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
        ) : null
      ))}
    </div>
  );
}
