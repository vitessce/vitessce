/* eslint-disable max-len */
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
    backgroundColor: theme.palette.grayLight,
    borderRadius: '4px',
    padding: '2px',
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    bottom: '28px',
    right: '4px',
    boxShadow: '-2px -2px 5px rgba(0, 0, 0, 0.06)',
    '& button': {
      cursor: 'pointer',
      border: '0',
      backgroundColor: 'transparent',
      color: theme.palette.grayDarkL5,
      '&[disabled]': {
        pointerEvents: 'none',
        '& svg': {
          fill: 'silver',
        },
      },
      '& svg': {
        fill: theme.palette.grayDark,
        verticalAlign: 'top',
        height: '20px',
        marginTop: '1px',
      },
      '&:hover,:hover path': {
        color: theme.palette.grayDarkD15,
        fill: theme.palette.grayDarkD15,
      },
    },
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

    '@global .rc-tree': {
      paddingLeft: '0',
      margin: '0',
      border: '1px solid transparent',
    },

    '@global .level-0-treenode > .rc-tree-switcher i svg path': {
      fill: theme.palette.primaryForegroundL5,
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
    '@global .rc-tree-treenode.drag-over-gap-top > .draggable': {
      borderTop: '2px blue solid',
    },
    '@global .rc-tree-treenode.drag-over-gap-bottom > .draggable': {
      borderBottom: '2px blue solid',
    },
    '@global .rc-tree-treenode.filter-node > .rc-tree-node-content-wrapper': {
      color: '#a60000 !important',
      fontWeight: 'bold !important',
    },
    '@global .rc-tree-treenode ul': {
      margin: '0',
      paddingLeft: '35px',
    },
    '@global .rc-tree-treenode .rc-tree-node-content-wrapper': {
      width: 'calc(100% - 20px)',
      display: 'inline-block',
      margin: '0',
      padding: '0',
      textDecoration: 'none',
      verticalAlign: 'top',
      cursor: 'pointer',
      position: 'relative',
    },
    '@global .rc-tree-treenode .rc-tree-node-content-wrapper > span': {
      position: 'relative',
      width: '100%',
      display: 'inline-block',
    },
    '@global .rc-tree-treenode .rc-tree-node-content-wrapper > span .title-button': {
      position: 'relative',
      /* To accomodate the checkbox and node menu button. */
      maxWidth: 'calc(100% - 45px)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '@global .rc-tree-treenode .rc-tree-node-content-wrapper > span .node-menu-icon': {
      position: 'relative',
      left: '0',
    },
    '@global .rc-tree-treenode span.rc-tree-switcher, .rc-tree-treenode span.rc-tree-checkbox': {
      display: 'inline-block',
      marginTop: '4px',
      marginRight: '6px',
      verticalAlign: 'middle',
      backgroundColor: 'transparent',

      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'scroll',
      border: '0 none',
      outline: 'none',
      cursor: 'pointer',
    },
    '@global .rc-tree-treenode span.rc-tree-switcher svg': {
      width: '15px',
      height: '15px',
    },
    '@global .rc-tree-treenode span.rc-tree-switcher.rc-tree-switcher-noop': {
      cursor: 'auto',
    },
    '@global .rc-tree-treenode span.rc-tree-switcher.rc-tree-switcher_close': {
      transform: 'rotate(-90deg)',
    },
    '@global .rc-tree-treenode span.rc-tree-checkbox': {
      width: '13px',
      height: '13px',
      margin: '0 3px',
      border: `2px solid ${theme.palette.grayMid}`,
      borderRadius: '3px',
      position: 'relative',
      left: '0',
      marginRight: '10px',
    },
    '@global .rc-tree-treenode span.rc-tree-checkbox-checked': {
      backgroundColor: theme.palette.grayMid,
    },
    '@global .rc-tree-treenode span.rc-tree-checkbox-indeterminate': {
      backgroundPosition: '-14px -28px',
    },
    '@global .rc-tree-treenode span.rc-tree-checkbox-disabled': {
      backgroundPosition: '0 -56px',
    },
    '@global .rc-tree-treenode span.rc-tree-checkbox.rc-tree-checkbox-checked.rc-tree-checkbox-disabled': {
      backgroundPosition: '-14px -56px',
    },
    '@global .rc-tree-treenode span.rc-tree-checkbox.rc-tree-checkbox-indeterminate.rc-tree-checkbox-disabled': {
      position: 'relative',
      background: '#ccc',
      borderRadius: '3px',
    },
    '@global .rc-tree-treenode span.rc-tree-checkbox.rc-tree-checkbox-indeterminate.rc-tree-checkbox-disabled::after': {
      position: 'absolute',
      top: '5px',
      left: '3px',
      width: '5px',
      height: '0',
      border: '2px solid #fff',
      borderTop: '0',
      borderLeft: '0',
      transform: 'scale(1)',
      content: "' '",
    },
    '@global .rc-tree:not(.rc-tree-show-line) .rc-treenode .rc-tree-switcher-noop': {
      background: 'none',
    },
    '@global .rc-tree.rc-tree-show-line .rc-tree-treenode:not(:last-child) > .rc-tree-switcher-noop': {
      backgroundPosition: '-56px -18px',
    },
    '@global .rc-tree.rc-tree-show-line .rc-tree-treenode:last-child > .rc-tree-switcher-noop': {
      backgroundPosition: '-56px -36px',
    },
    '@global .rc-tree-child-tree': {
      display: 'none',
    },
    '@global .rc-tree-child-tree-open': {
      display: 'block',
    },
    '@global .rc-tree-treenode-disabled > span:not(.rc-tree-switcher), .rc-tree-treenode-disabled > a, .rc-tree-treenode-disabled > a span': {
      color: '#767676',
      cursor: 'not-allowed',
    },
    '@global .rc-tree-treenode-active': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
    '@global .rc-tree-node-selected': {
      backgroundColor: '#ffe6b0',
      border: '1px #ffb951 solid',
      opacity: '0.8',
    },
    '@global .rc-tree-indent-unit': {
      display: 'inline-block',
      paddingLeft: '18px',
    },
  },
  plusButton: {
    border: '0',
    backgroundColor: 'transparent',
    color: theme.palette.primaryForegroundL5,
    padding: '0',
    fontSize: '18px',
    marginBottom: '32px',
    cursor: 'pointer',
  },
  nodeMenuIcon: {
    fill: theme.palette.grayMid,
    cursor: 'pointer',
    // Important needed due to Jupyter Notebook conflicting styles
    height: '14px !important',
    position: 'relative',
    verticalAlign: 'top',
    width: `${nodeHeight}px`,
    top: '5.5px',
    '&:hover': {
      fill: theme.palette.grayMidL10,
    },
  },
  nodeSizeLabel: {
    fontSize: '12px',
    color: theme.palette.primaryForegroundD15,
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
    // Important needed due to Jupyter Notebook conflicting styles
    padding: '5px !important',
    /* background-color only for content */
    backgroundClip: 'content-box',
    border: `2px solid ${theme.palette.primaryForegroundL10}`,
    backgroundColor: theme.palette.primaryForegroundL10,
    borderRadius: '6px',
    position: 'relative',
    top: '3px',
    left: '0px',
    float: 'left',
    marginRight: '10px',
    '&:checked': {
      backgroundClip: 'unset',
    },
  },
  levelRadioButtonChecked: {
    backgroundClip: 'unset',
  },
  titleButton: {
    padding: 0,
    margin: 0,
    height: `${nodeHeight - 8}px`,
    lineHeight: `${nodeHeight - 8}px`,
    border: '1px solid transparent',
    color: theme.palette.primaryForegroundL5,
    background: 'transparent',
    backgroundColor: 'transparent',
    verticalAlign: 'top',
    fontSize: '14px',
    cursor: 'pointer',
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
    backgroundColor: theme.palette.grayLight,
    color: theme.palette.black,
    borderRadius: '4px',
    outline: 'none',
    padding: ' 4px 0px 4px 4px',
    border: `1px solid ${theme.palette.grayLight}`,
    '& :focus': {
      border: `1px solid ${theme.palette.primaryForegroundActive}`,
    },
  },
  titleSaveButton: {
    backgroundColor: theme.palette.grayDark,
    border: `1px solid ${theme.palette.grayDark}`,
    color: theme.palette.grayLight,
    borderRadius: '3px',
    width: '50px',
    height: `${nodeHeight - 8}px`,
    lineHeight: '20px',
    fontSize: '13px',
    verticalAlign: 'top',
    margin: 0,
    padding: 0,
    '&:hover': {
      backgroundColor: theme.palette.grayDarkL5,
      border: `1px solid ${theme.palette.grayDarkL5}`,
    },
  },
  // TODO(monorepo): is this style used anywhere?
  '@global .vitessce-tooltip .ant-tooltip-content .ant-tooltip-inner': {
    fontSize: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
}));


/*
  Tooltips and popovers for showing help info to the user.
  Some styles here (for .rc-tooltip and descendants) have been adapted from the ant-design tooltip and popover styles:
  https://github.com/ant-design/ant-design/blob/34c2fad6368cce0d3e1959613d092274f567582a/components/tooltip/style/index.less
  https://github.com/ant-design/ant-design/blob/34c2fad6368cce0d3e1959613d092274f567582a/components/popover/style/index.less
 */
const helpTooltipCommon = {
  boxSizing: 'border-box',
  margin: '0',
  padding: '0',
  color: 'rgba(0, 0, 0, 0.65)',
  fontSize: '14px',
  listStyle: 'none',
  position: 'absolute',
};

export const useHelpTooltipStyles = makeStyles(theme => ({
  helpTooltip: {
    zIndex: 1060,
    display: 'block',
    maxWidth: '250px',
    visibility: 'visible',
    paddingTop: '8px', // Assumes placement: 'top'
    ...helpTooltipCommon,
    '@global .rc-tooltip-inner': {
      fontSize: '10px',
      minWidth: '30px',
      padding: '6px 8px',
      color: '#fff',
      textAlign: 'left',
      textDecoration: 'none',
      wordWrap: 'break-word',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderRadius: '2px',
      boxShadow: '0 3px 6px -4px rgba(100, 100, 100, 0.12), 0 6px 16px 0 rgba(100, 100, 100, 0.08), 0 9px 28px 8px rgba(100, 100, 100, 0.05)',
    },
    '@global .rc-tooltip-arrow': {
      display: 'none',
    },
  },
  popover: {
    top: 0,
    left: 0,
    zIndex: 1030,
    fontWeight: 'normal',
    whiteSpace: 'normal',
    textAlign: 'left',
    cursor: 'auto',
    userSelect: 'text',
    paddingBottom: '10px', // Assumes placement: 'top'
    '&.rc-tooltip-placement-top': {
      paddingBottom: '10px',
    },
    '&.rc-tooltip-placement-right': {
      paddingLeft: '10px',
    },
    '&.rc-tooltip-placement-bottom': {
      paddingTop: '10px',
    },
    '&.rc-tooltip-placement-left': {
      paddingRight: '10px',
    },
    '&.rc-tooltip-placement-top > .rc-tooltip-content > .rc-tooltip-arrow': {
      bottom: '6px',
      borderTopColor: 'transparent',
      borderRightColor: '#fff',
      borderBottomColor: '#fff',
      borderLeftColor: 'transparent',
      boxShadow: '3px 3px 7px rgba(0, 0, 0, 0.07)',
      left: '50%;',
      transform: 'translateX(-50%) rotate(45deg)',
    },
    '&.rc-tooltip-placement-right > .rc-tooltip-content > .rc-tooltip-arrow': {
      left: '6px',
      borderTopColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#fff',
      borderLeftColor: '#fff',
      boxShadow: '-3px 3px 7px rgba(0, 0, 0, 0.07)',
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
    },
    '&.rc-tooltip-placement-bottom > .rc-tooltip-content > .rc-tooltip-arrow': {
      top: '6px',
      borderTopColor: '#fff',
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: '#fff',
      boxShadow: '-2px -2px 5px rgba(0, 0, 0, 0.06)',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
    },
    '&.rc-tooltip-placement-left > .rc-tooltip-content > .rc-tooltip-arrow': {
      right: '6px',
      borderTopColor: '#fff',
      borderRightColor: '#fff',
      borderBottomColor: 'transparent',
      borderLeftColor: 'transparent',
      boxShadow: '3px -3px 7px rgba(0, 0, 0, 0.07)',
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
    },
    ...helpTooltipCommon,
    '& ::after': {
      position: 'absolute',
      background: 'rgba(255, 255, 255, 0.01)',
      content: "''",
    },
    '@global .rc-tooltip-inner': {
      boxSizing: 'border-box',
      backgroundColor: theme.palette.white,
      backgroundClip: 'padding-box',
      borderRadius: '2px',
      boxShadow: '0 3px 6px -4px rgba(100, 100, 100, 0.12), 0 6px 16px 0 rgba(100, 100, 100, 0.08), 0 9px 28px 8px rgba(100, 100, 100, 0.05)',
    },
    '@global .rc-tooltip-content': {
      padding: 0,
    },
    '@global .rc-tooltip-inner-content': {
      padding: '12px 16px',
      color: 'rgba(0, 0, 0, 0.65)',
    },
    '@global .rc-tooltip-arrow': {
      position: 'absolute',
      display: 'block',
      width: '8px',
      height: '8px',
      background: 'transparent',
      borderStyle: 'solid',
      borderWidth: '4px',
    },
  },
  popoverMenuList: {
    listStyleType: 'none',
    padding: 0,
    marginBottom: 0,
    marginTop: 0,
    '& dl, ol, ul': {
      marginTop: 0,
      marginBottom: '16px',
    },
    '& li button': {
      border: 0,
      padding: '4px 16px',
      cursor: 'pointer',
      width: '100%',
      backgroundColor: 'transparent',
      color: theme.palette.grayDarkD15,
      borderRadius: '2px',
      '&:hover': {
        backgroundColor: theme.palette.grayLightL10,
      },
    },
    '& li:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.grayMid}`,
    },
    '& button': {
      appearance: 'button',
      textTransform: 'none',
      overflow: 'visible',
      margin: 0,
      fontFamily: 'inherit',
      fontSize: '14px',
      lineHeight: 'inherit',
      borderRadius: 0,
    },
  },
  small: {
    fontSize: '11px',
  },
  popoverMenuColor: {
    boxShadow: 'none !important',
    margin: '0 auto',
    /* Sets margins around color picker and centers */
    '& > div:nth-child(3)': {
      padding: '6px !important',
      transform: 'translate(2px, 0)',
    },
    '& > div > div:nth-of-type(1)': {
      fontSize: '12px',
      width: '20px !important',
    },
    '& input': {
      width: '60px !important',
      fontSize: '12px',
    },
    /* Sets smaller color squares */
    '& > div > span > div': {
      width: '18px !important',
      height: '18px !important',
    },
  },
}));
