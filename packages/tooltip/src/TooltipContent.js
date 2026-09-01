import React, { useMemo } from 'react';
import { MISSING_VALUE_PLACEHOLDER } from '@vitessce/utils';
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
            <td>{value ?? MISSING_VALUE_PLACEHOLDER}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
