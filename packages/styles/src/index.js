// Here, we re-export all MUI things
// used in the rest of the monorepo packages.
// This is intended to make upgrading MUI easier.
export { CacheProvider } from '@emotion/react';
export { default as createCache } from '@emotion/cache';
export { GlobalStyles } from 'tss-react';
export { makeStyles, useStyles as useTheme } from 'tss-react/mui';
// TODO: to customize the theme argument passed in makeStyles, use createMakeAndWithStyles
// Reference: https://mui.com/material-ui/integrations/interoperability/#jss-tss

// Utils
export {
  createTheme,
  ThemeProvider,
} from '@mui/material/styles';
export { grey } from '@mui/material/colors';

// Components
export { default as Accordion } from '@mui/material/Accordion';
export { default as AccordionDetails } from '@mui/material/AccordionDetails';
export { default as AccordionSummary } from '@mui/material/AccordionSummary';
export { default as Autocomplete } from '@mui/material/Autocomplete';
export { default as Box } from '@mui/material/Box';
export { default as Button } from '@mui/material/Button';
export { default as ButtonGroup } from '@mui/material/ButtonGroup';
export { default as Checkbox } from '@mui/material/Checkbox';
export { default as CircularProgress } from '@mui/material/CircularProgress';
export { default as ClickAwayListener } from '@mui/material/ClickAwayListener';
export { default as Fade } from '@mui/material/Fade';
export { default as FormControl } from '@mui/material/FormControl';
export { default as FormControlLabel } from '@mui/material/FormControlLabel';
export { default as FormGroup } from '@mui/material/FormGroup';
export { default as FormHelperText } from '@mui/material/FormHelperText';
export { default as FormLabel } from '@mui/material/FormLabel';
export { default as Grid } from '@mui/material/Grid';
export { default as IconButton } from '@mui/material/IconButton';
export { default as InputLabel } from '@mui/material/InputLabel';
export { default as Link } from '@mui/material/Link';
export { default as List } from '@mui/material/List';
export { default as ListItem } from '@mui/material/ListItem';
export { default as ListItemText } from '@mui/material/ListItemText';
export { default as MenuList } from '@mui/material/MenuList';
export { default as MenuItem } from '@mui/material/MenuItem';
export { default as NativeSelect } from '@mui/material/NativeSelect';
export { default as Paper } from '@mui/material/Paper';
export { default as Popper } from '@mui/material/Popper';
export { default as Radio } from '@mui/material/Radio';
export { default as RadioGroup } from '@mui/material/RadioGroup';
export { default as Select } from '@mui/material/Select';
export { default as Slider } from '@mui/material/Slider';
export { default as Step } from '@mui/material/Step';
export { default as StepLabel } from '@mui/material/StepLabel';
export { default as Stepper } from '@mui/material/Stepper';
export { default as Switch } from '@mui/material/Switch';
export { default as Tab } from '@mui/material/Tab';
export { default as Table } from '@mui/material/Table';
export { default as TableBody } from '@mui/material/TableBody';
export { default as TableCell } from '@mui/material/TableCell';
export { default as TableContainer } from '@mui/material/TableContainer';
export { default as TableRow } from '@mui/material/TableRow';
export { default as Tabs } from '@mui/material/Tabs';
export { default as TextField } from '@mui/material/TextField';
export { default as Tooltip } from '@mui/material/Tooltip';
export { default as Typography } from '@mui/material/Typography';

// Icons
export { default as Add } from '@mui/icons-material/Add';
export { default as ArrowDropDown } from '@mui/icons-material/ArrowDropDown';
export { default as ArrowDropUp } from '@mui/icons-material/ArrowDropUp';
export { default as CenterFocusStrong } from '@mui/icons-material/CenterFocusStrong';
export { default as Close } from '@mui/icons-material/Close';
export { default as CloudDownload } from '@mui/icons-material/CloudDownload';
export { default as ExpandLess } from '@mui/icons-material/ExpandLess';
export { default as ExpandMore } from '@mui/icons-material/ExpandMore';
export { default as Help } from '@mui/icons-material/Help';
export { default as Image } from '@mui/icons-material/Image';
export { default as Info } from '@mui/icons-material/Info';
export { default as Lens } from '@mui/icons-material/Lens';
export { default as MoreVert } from '@mui/icons-material/MoreVert';
export { default as RemoveCircle } from '@mui/icons-material/RemoveCircle';
export { default as Settings } from '@mui/icons-material/Settings';
export { default as Visibility } from '@mui/icons-material/Visibility';
export { default as VisibilityOff } from '@mui/icons-material/VisibilityOff';

// Data Grid
export { DataGrid } from '@mui/x-data-grid/DataGrid';

// Local exports
export { Popper as PopperV4 } from './Popper.js';
export { ScopedGlobalStyles } from './ScopedGlobalStyles.js';
