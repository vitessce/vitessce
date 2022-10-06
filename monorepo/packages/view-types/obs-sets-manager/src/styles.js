import { makeStyles } from '@material-ui/core';

const nodeHeight = 32;

export const useStyles = makeStyles(theme => ({
  setsManager: {
    position: 'relative',
    width: '100%',
    display: 'block',
    height: 'auto',
  },
  setOperationButtons: {
    backgroundColor: theme.palette.grayLight,// map-get($global-colors, "gray-light");
    borderRadius: '4px',
    padding: '2px',
    display: 'inline-block',
    position: 'absolute',
    bottom: '1.75rem',
    right: '0.25rem',
    boxShadow: '-2px -2px 5px rgba(0, 0, 0, 0.06)',
    '& button': {
      border: '0',
      backgroundColor: 'transparent',
      color: theme.palette.grayDark,// lighten(map-get($global-colors, "gray-dark"), 5%);
      '& [disabled]': {
        pointerEvents: 'none',
        '& svg': {
          fill: 'silver'
        }
      },
      '& svg': {
        fill: theme.palette.grayDark,// map-get($global-colors, "gray-dark");
        verticalAlign: 'top',
        height: '20px',
        marginTop: '1px',
      },
      '& :hover, :hover path': {
        color: theme.palette.grayDark,// darken(map-get($global-colors, "gray-dark"), 15%);
        fill: theme.palette.grayDark,// darken(map-get($global-colors, "gray-dark"), 15%);
      }
    }
  },
  setsManagerTree: {
    position: 'relative',
    top: '0',
    left: '0',
    width: '100%',
    height: 'auto',
    display: 'block',
    paddingRight: '17px', /* Increase/decrease this value for cross-browser compatibility */
    boxSizing: 'content-box', /* So the width will be 100% + 17px */
  },
  plusButton: {
    border: '0',
    backgroundColor: 'transparent',
    color: theme.palette.primaryForeground, // lighten(map-get($theme-colors, "primary-foreground"), 5%);
    padding: '0',
    fontSize: '18px',
    marginBottom: '2rem',
  },
  '@global .rc-tree': {
    paddingLeft: '0',
    margin: '0',
    border: '1px solid transparent',
  },
  nodeMenuIcon: {
    fill: theme.palette.grayMid, // map-get($global-colors, "gray-mid");
    cursor: 'pointer',
    height: '14px',
    position: 'relative',
    verticalAlign: 'top',
    width: `${nodeHeight}px`,
    top: '5.5px',
    '& :hover': {
      fill: theme.palette.grayMid,  // lighten(map-get($global-colors, "gray-mid"), 10%);
    }
  },
  nodeSizeLabel: {
    fontSize: '12px',
    color: theme.palette.primaryForeground, // darken(map-get($theme-colors, "primary-foreground"), 15%);
  },
  levelButtonsContainer: {
    height: '20px',
    width: '100%',
    position: 'relative',
    paddingLeft: '4px',
    left: '0',
  },
  levelRadioButton: {
    cursor: 'pointer',
    appearance: 'none',
    /* create custom radiobutton appearance */
    width: '12px',
    height: '12px',
    padding: '5px',
    /* background-color only for content */
    backgroundClip: 'content-box',
    border: `2px solid ${theme.palette.primaryForeground}`,// lighten(map-get($theme-colors, "primary-foreground"), 10%);
    backgroundColor: theme.palette.primaryForeground, // lighten(map-get($theme-colors, "primary-foreground"), 10%);
    borderRadius: '6px',
    position: 'relative',
    top: '3px',
    left: '0px',
    float: 'left',
    marginRight: '10px',
    '& :checked': {
      backgroundClip: 'unset',
    }
  },
  levelRadioButtonChecked: {
    backgroundClip: 'unset',
  },
  '@global .level-0-treenode > .rc-tree-switcher i svg path': {
    fill: theme.palette.primaryForeground, // lighten(map-get($theme-colors, "primary-foreground"), 5%)
  },
  '@global .rc-tree-focused:not(.rc-tree-active-focused)': {
    borderColor: 'cyan',
  },
  '@global .rc-tree-treenode': {
    margin: '0',
    padding: '0',
    lineHeight: `${nodeHeight - 8}px`,
    whiteSpace: 'nowrap',
    listStyle: 'none',
    outline: '0',
  },
  titleButton: {
    padding: 0,
    margin: 0,
    height: `${nodeHeight - 8}px`,
    lineHeight: `${nodeHeight - 8}px`,
    border: '1px solid transparent',
    color: theme.palette.primaryForeground, // lighten(map-get($theme-colors, "primary-foreground"), 5%);
    background: 'transparent',
    backgroundColor: 'transparent',
    verticalAlign: 'top',
    fontSize: '14px',
  },
  titleButtonWithInput: {
    padding: 0,
    margin: 0,
    display: 'block',
    height: `${nodeHeight - 6}px`,
    boxSizing: 'border-box',
  },
  titleInput: {
    fontSize: '14px',
    height: `${nodeHeight - 8}px`,
    lineHeight: `${nodeHeight - 8}px`,
    width: 'calc(100% - 60px)',
    marginRight: '10px',
    backgroundColor: theme.palette.grayLight, // map-get($global-colors, "gray-light");
    color: theme.palette.black, // map-get($global-colors, "black");
    borderRadius: '4px',
    outline: 'none',
    padding:' 4px 0px 4px 4px',
    border: `1px solid ${theme.palette.grayLight}`,//  map-get($global-colors, "gray-light");
    '& :focus': {
      border: `1px solid ${theme.palette.primaryForegroundActive}`, //map-get($theme-colors, "primary-foreground-active");
    }
  },
  titleSaveButton: {
    backgroundColor: theme.palette.grayDark, // map-get($global-colors, "gray-dark");
    border: `1px solid ${theme.palette.grayDark}`, // map-get($global-colors, "gray-dark");
    color: theme.palette.grayLight, // map-get($global-colors, "gray-light");
    borderRadius: '3px',
    width: '50px',
    height: `${nodeHeight - 8}px`,
    lineHeight: '20px',
    fontSize: '13px',
    verticalAlign: 'top',
    margin: 0,
    padding: 0,
    '& :hover': {
      backgroundColor: theme.palette.grayDark, // lighten(map-get($global-colors, "gray-dark"), 5%);
      border: `1px solid ${theme.palette.grayDark}`, // lighten(map-get($global-colors, "gray-dark"), 5%);
    }
  },
  '@global .rc-tree-treenode .draggable': {
    color: '#333',
    userSelect: 'none',
    /* Required to make elements draggable in old WebKit */
    '-khtml-user-drag': 'element',
    '-webkit-user-drag': 'element',
    border: '2px transparent solid',
  },
  '@global .rc-tree-treenode.drag-over > .draggable': {
    color: 'white',
    backgroundColor: '#316ac5',
    border: '2px #316ac5 solid',
    opacity: '0.8',
  },

}));
