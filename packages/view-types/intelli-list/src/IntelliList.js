import { ListItem, ListItemText, Stack } from '@mui/material';
import { FixedSizeList } from 'react-window';


export default function IntelliList({ option, options, onOptionChange }) {
  const renderRow = ({ index, style }) => (
    <ListItem style={style} key={index} onClick={() => onOptionChange(options[index])}>
      <ListItemText primary={options[index]} />
    </ListItem>
  );

  if (!options) {
    return null;
  }

  return (
    <Stack>
      {option}
      <FixedSizeList
        height={400}
        width={300}
        itemSize={20}
        itemCount={options.length}
      >
        {renderRow}
      </FixedSizeList>
    </Stack>
  );
}
