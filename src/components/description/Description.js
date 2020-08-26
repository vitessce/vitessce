import React from 'react';

export default function Description(props) {
  const { description, metadata } = props;

  return (
    <div className="description">
      <p>{description}</p>

      {metadata && metadata.map(({ name: layerName, metadata: metadataRecord }) => (
        metadataRecord && Object.entries(metadataRecord).length > 0 ? (
          <details key={layerName}>
            <summary>{layerName}</summary>
            <div className="metadata-container">
              <table>
                <tbody>
                  {Object.entries(metadataRecord)
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
