import React, { useMemo, useCallback } from 'react';
import { Grid, NativeSelect, makeStyles } from '@vitessce/styles';

function pathToKey(pathArr) {
  return pathArr.join('___');
}

function keyToPath(keyStr) {
  return keyStr.split('___');
}

export default function SingleCellSetSelector(props) {
  const {
    theme,
    obsType,
    obsSetColor,
    multiObsSetSelection,
    singleObsSetSelection,
    setSingleObsSetSelection,
  } = props;

  const handleChange = useCallback((event) => {
    if (event.target.value === '__none__') {
      setSingleObsSetSelection(null);
    } else {
      const nextPath = keyToPath(event.target.value);
;      setSingleObsSetSelection([
        nextPath,
      ]);
    }
  }, []);


  const hasMultiOptions = Array.isArray(multiObsSetSelection) && multiObsSetSelection.length > 0;

  return (
    <Grid container size={12}>
      <NativeSelect
        onChange={handleChange}
        value={singleObsSetSelection ? pathToKey(singleObsSetSelection) : '__none__'}
        variant="standard"
        sx={{ width: '100%' }}
      >
        <option value="__none__">None</option>
        {hasMultiOptions ? (
          <>
            {multiObsSetSelection.map(o => (
              <option value={pathToKey(o)}>{o.at(-1)}</option>
            ))}
          </>
        ) : null}
      </NativeSelect>
    </Grid>
  );
}
