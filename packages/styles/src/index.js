// Here, we re-export all MUI things
// used in the rest of the monorepo packages.
// This is intended to make upgrading MUI easier.
export { CacheProvider } from '@emotion/react';
export { default as createCache } from '@emotion/cache';
export { GlobalStyles } from 'tss-react';
export { makeStyles, useStyles as useTheme } from 'tss-react/mui';
// TODO: to customize the theme argument passed in makeStyles, use createMakeAndWithStyles
// Reference: https://mui.com/material-ui/integrations/interoperability/#jss-tss
export {
  // Utils
  createTheme,
  colors,
  ThemeProvider,
  // Components
  Slider,
  Typography,
  Paper,
  Popper,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  InputLabel,
  Button,
  Grid,
  Box,
  ButtonGroup,
  Tooltip,
  TextField,
  FormHelperText,
  Select,
  FormControl,
  RadioGroup,
  FormLabel,
  Radio,
  FormControlLabel,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableRow,
  Checkbox,
  Switch,
  IconButton,
  CircularProgress,
  Link,
  MenuList,
  MenuItem,
  ClickAwayListener,
  Fade,
  List,
  ListItem,
  ListItemText,
  FormGroup,
  Autocomplete,
} from '@mui/material';
export {
  CloudDownload,
  ArrowDropDown,
  ArrowDropUp,
  Settings,
  Close,
  Help,
  ExpandMore,
  Add,
  Info,
  MoreVert,
  Visibility,
  VisibilityOff,
  Image,
  ExpandLess,
  RemoveCircle,
  Lens,
  CenterFocusStrong,
} from '@mui/icons-material';
export {
  DataGrid,
} from '@mui/x-data-grid';
