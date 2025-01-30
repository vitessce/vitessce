import React, { useMemo } from 'react';
import { transformInfoValues } from './utils.js';

export default function TooltipContent(props) {
  const {
    info,
    featureType,
    featureLabelsMap,
  } = props;

  const mappedInfo = useMemo(() => {
    if (!featureType || !featureLabelsMap) {
      return info;
    }
    return transformInfoValues(info, featureType, featureLabelsMap);
  }, [info, featureType, featureLabelsMap]);

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
