import React from 'react';

export default function TooltipContent(props) {
  const {
    info,
  } = props;

  return (
    <table>
      <tbody>
        {info ? Object.entries(info).map(([key, value]) => (
          <tr key={key}>
            <th>{key}</th>
            <td>{value}</td>
          </tr>
        )) : null}
      </tbody>
    </table>
  );
}
