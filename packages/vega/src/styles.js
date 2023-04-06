import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  '@global': {
    '#vg-tooltip-element.vg-tooltip.custom-theme': {
      boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      backgroundColor: theme.palette.gridLayoutBackground,
      color: theme.palette.tooltipText,
      border: 'none',
      padding: '0 2px',
    },
  },
}));
