import React from 'react';

export default function TooltipContent(props) {
  const {
    info,
  } = props;

  return (
    <table>
      <tbody>
        {Object.entries(info).map(([key, value]) => (
          <tr key={key}>
            <th>{key}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
