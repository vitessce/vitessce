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
  cardRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  card: {
    //border: '2px solid grey',
    //borderRadius: '4px',
    //padding: '5px',
    transition: 'opacity 0.3s',
    //boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    //backgroundImage: 'linear-gradient(rgba(255 255 255 / 0.051), rgba(255 255 255 / 0.051))',
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
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
    display: 'none',
  },
}));