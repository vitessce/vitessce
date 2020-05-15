/* eslint-disable */
import styled from 'styled-components';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import Select from '@material-ui/core/Select';

import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import LensIcon from '@material-ui/icons/Lens';

import InputLabel from '@material-ui/core/InputLabel';

export const StyledGrid = styled(Grid);
export const StyledButton = styled(Button);
export const StyledAddIcon = styled(AddIcon);

export const StyledExpansionPanel = styled(ExpansionPanel)`
  width: 100%;
  padding-left: 8px;
  padding-right: 8px;
  flex-direction: column;
`;
export const StyledExpansionPanelSummary = styled(ExpansionPanelSummary)`
  padding-left: 10px;
  padding-right: 10px;
`;
export const StyledExpansionPanelDetails = styled(ExpansionPanelDetails)`
  width: 100%;
  padding-left: 8px;
  padding-right: 8px;
  flex-direction: column;
`;
export const StyledExpandMoreIcon = styled(ExpandMoreIcon);

export const StyledCheckbox = styled(Checkbox);
export const StyledSlider = styled(Slider);
export const StyledSelect = styled(Select);

export const StyledIconButton = styled(IconButton);
export const StyledPaddedIconButton = styled(IconButton)`
  padding: 3px;
  width: 16px;
  height: 16px;
`;
export const StyledMoreVertIcon = styled(MoreVertIcon);
export const StyledClickAwayListener = styled(ClickAwayListener);
export const StyledPaper = styled(Paper)`
  background-color: rgba(0, 0, 0, 0.75);
`;
export const StyledPopper = styled(Popper);
export const StyledMenuItem = styled(MenuItem);
export const StyledColorsMenuItem = styled(MenuItem)`
  &:hover: {
    background-color: transparent;
  }
  padding-left: 2px;
  padding-right: 2px;
`;
export const StyledMenuList = styled(MenuList);

export const StyledLensIcon = styled(LensIcon)`
  width: 17px;
  height: 17px;
`;

export const StyledInputLabel = styled(InputLabel);

export const StyledDashedButton = styled(Button)`
  border-style: dashed;
  margin-top: 10px;
  font-weight: 400;
`;

export const StyledSpan = styled("span")`
  width: 70px;
  text-align: center;
  padding-left: 2px;
  padding-right: 2px;
`;

/*import { makeStyles, createMuiTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

export const darkTheme = createMuiTheme({ 
  palette: {
    type: 'dark',
    primary: grey,
    secondary: grey,
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
});

export const useOptionStyles = makeStyles(() => ({
  colors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    paddingLeft: '2px',
    paddingRight: '2px',
  },
}));

export const useExpansionPanelStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: '100%',
    flexDirection: 'column',
  },
}));*/

