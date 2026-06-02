import { makeStyles } from '@vitessce/styles';


export const useStyles = makeStyles()(() => ({
  launcher: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 10px',
  },
  launcherRow: {
    marginTop: '15px',
    marginBottom: '15px',
  },
  launcherRowTitle: {
    marginBottom: 0,
  },
  launcherCardRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  launcherCard: {
    transition: 'opacity 0.3s',
  },
  cardTitle: {
    marginTop: 0,
  },
  cardDashed: {
    display: 'inline-block',
    boxSizing: 'border-box',
    height: '100%',
    width: '100%',
    borderRadius: '4px',
    border: '2px dashed rgba(128, 128, 128, 0.2)',
  },
  cardDim: {
    opacity: 0.2,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  },
  buttonSpacer: {
    flexGrow: 1,
  },
  dataButtonGroup: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: '5px',
  },
  vitessceApp: {
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  dataUrlTextarea: {
    width: '100%',
    boxSizing: 'border-box',
  },
  textareaAndButton: {
    display: 'flex',
    flexDirection: 'row',
    gap: '5px',
  },
  hiddenFileInput: {
    display: 'none',
  },
}));
