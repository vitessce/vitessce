/* eslint-disable */
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
  overlayBox: {
    display: 'block',
    position: 'absolute',
    top: '0px',
    left: '36px',
    width: '100%',
    width: 'calc(100% - 36px)',
    height: '100%',
    backgroundColor: 'white',
  },
  overlayHeader: {
    display: 'flex',
    flexDirection: 'row',
  },
  stepperRoot: {
    flexGrow: '1',
    padding: '0 20px 0 0 !important',
    
  },
  stepButtonRoot: {
    margin: '-8px -16px !important',
    padding: '8px 16px 8px 16px !important',
  },
  codeButton: {
    flexGrow: '1',
  },
}));

