/* eslint-disable */
import React from 'react';

export default function TooltipContent(props) {
  const {
    cellId,
    factors,
  } = props;

  return (
    <table>
      <tbody>
        <tr>
          <th>Cell ID</th>
          <td>{cellId}</td>
        </tr>
        {Object.keys(factors).map(key => (
          <tr key={key}>
            <th>{key}</th>
            <td>{factors[key]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
