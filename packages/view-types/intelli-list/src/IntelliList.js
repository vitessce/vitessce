import { MenuItem, Select } from '@mui/material';

export default function IntelliList({ option, options, onOptionChange }) {
  if (!option) return null;
  return (
    <div>
      <Select value={option} onChange={onOptionChange}>
        {options.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
      </Select>
    </div>
  );
}
