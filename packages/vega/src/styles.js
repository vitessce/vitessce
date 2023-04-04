import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
    '@global': {
      '#vg-tooltip-element.vg-tooltip.custom-theme': {
        color: 'green',
        backgroundColor: 'gray',
        borderCollapse: 'collapse'
      },
    },
  });


// '& #vg-tooltip-element.vg-tooltip.custom-theme': {
//     color: '#e3116c',
//   },
