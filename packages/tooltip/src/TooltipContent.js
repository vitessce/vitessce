import React from 'react';
import { useMappedGeneList } from '@vitessce/vit-s';

export default function TooltipContent(props) {
  const {
    info,
  } = props;
  const mappedInfo = useMappedGeneList(info, undefined);

  return (
    <table>
      <tbody>
        {Object.entries(mappedInfo).map(([key, value]) => (
          <tr key={key}>
            <th>{key}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
