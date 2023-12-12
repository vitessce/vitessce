import { MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';


export default function IntelliList({ option, options, onOptionChange }) {
  const [opts, setOpts] = useState(['']);
  useEffect(() => {
    setOpts(options.map(o => o.toString()));
  }, [options]);

  return (
    <Select
      value={option ? option.toString() : ''}
      onChange={onOptionChange}
      inputProps={{
        name: 'gene',
        id: 'gene-select',
      }}
    >
      {opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
    </Select>
  );
}


// <Autocomplete
//   disablePortal
//   value={option ? option.toString() : ''}
//   getOptionLabel={o => o}
//   onChange={onOptionChange}
//   options={opts}
//   renderInput={params => <TextField {...params} label="Gene" />}
// />
