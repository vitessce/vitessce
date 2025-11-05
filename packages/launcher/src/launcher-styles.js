import { makeStyles } from '@vitessce/styles';


export const useStyles = makeStyles()(() => ({
  launcher: {
    display: 'flex',
    flexDirection: 'column',
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
    border: '2px solid grey',
    borderRadius: '10px',
    padding: '5px',
    transition: 'opacity 0.3s',
  },
  cardTitle: {
    marginTop: 0,
  },
  cardDashed: {
    border: '2px dashed grey',
    cursor: 'pointer',
  },
  cardDim: {
    opacity: 0.2,
  },
  vitessceApp: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: 'calc(100% - 0px)',
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
  }
}));