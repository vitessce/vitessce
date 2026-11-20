import { makeStyles } from '@vitessce/styles';

const FONT_SIZE = {
  xs: '0.65rem', sm: '0.78rem', md: '0.82rem', lg: '0.92rem',
};

export const useStyles = makeStyles()(theme => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  // Overview (no active frame) and empty states.
  topBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '4px 6px',
    flexShrink: 0,
  },
  subtleButton: {
    opacity: 0.5,
    '&:hover': { opacity: 1 },
  },
  overview: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '0 28px 24px',
    textAlign: 'center',
    overflowY: 'auto',
  },
  overviewIcon: {
    opacity: 0.18,
    fontSize: 64,
  },
  overviewLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    opacity: 0.35,
  },
  overviewTitle: {
    fontSize: '1.4rem',
    fontWeight: 300,
    lineHeight: 1.2,
    opacity: 0.85,
  },
  overviewCount: {
    fontSize: FONT_SIZE.sm,
    opacity: 0.6,
  },
  overviewDescription: {
    fontSize: FONT_SIZE.sm,
    opacity: 0.6,
    lineHeight: 1.6,
    width: '100%',
    textAlign: 'left',
  },
  beginButton: {
    marginTop: 12,
    padding: '9px 32px',
    fontSize: FONT_SIZE.lg,
    letterSpacing: '0.04em',
  },
  // Play mode.
  playHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
  },
  playHeaderCenter: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
    fontWeight: 600,
    opacity: 0.75,
    letterSpacing: '0.04em',
    userSelect: 'none',
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 6px 2px',
    gap: 2,
    flexShrink: 0,
  },
  navButton: {
    width: 48,
    height: 48,
  },
  navIcon: {
    fontSize: 42,
  },
  navSlider: {
    flex: 1,
    padding: '0 4px',
  },
  utilityRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    padding: '0 8px 6px',
    flexShrink: 0,
  },
  utilityButtonInactive: {
    opacity: 0.35,
  },
  semanticZoomLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 1,
    letterSpacing: -0.5,
    userSelect: 'none',
  },
  activeFrame: {
    padding: '8px 12px 6px',
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
    maxHeight: 160,
    overflowY: 'auto',
  },
  frameTitle: {
    fontWeight: 700,
    fontSize: FONT_SIZE.lg,
    lineHeight: 1.3,
    marginBottom: 3,
  },
  annotationText: {
    fontSize: FONT_SIZE.sm,
    opacity: 0.8,
    lineHeight: 1.5,
    '& p': {
      margin: '0 0 4px 0',
      whiteSpace: 'pre-wrap',
    },
    '& details': {
      marginBottom: '6px',
    },
    '& summary': {
      borderBottom: `1px solid ${theme.palette.divider}`,
      cursor: 'pointer',
    },
  },
  shapeCount: {
    display: 'inline-block',
    fontSize: FONT_SIZE.xs,
    opacity: 0.6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  frameList: {
    overflowY: 'auto',
    flex: 1,
    padding: '4px 0',
  },
  frameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: FONT_SIZE.md,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  frameRowActive: {
    backgroundColor: theme.palette.action.selected,
    fontWeight: 600,
  },
  frameRowTitle: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  frameNumber: {
    fontSize: FONT_SIZE.md,
    fontWeight: 700,
    opacity: 0.35,
    minWidth: 20,
    textAlign: 'right',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  frameNumberActive: {
    opacity: 1,
    color: theme.palette.primary.main,
  },
  // Edit mode.
  editHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
    gap: 4,
  },
  editTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 600,
    flex: 1,
  },
  headerIcon: {
    fontSize: 14,
  },
  confirmed: {
    color: theme.palette.success.main,
  },
  editBody: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    flexShrink: 0,
    borderTop: `1px solid ${theme.palette.divider}`,
    '&:first-of-type': {
      borderTop: 'none',
    },
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 12px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  sectionLabel: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  sectionFields: {
    padding: '4px 12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  compactFrameList: {
    maxHeight: 170,
    overflowY: 'auto',
    paddingBottom: 2,
  },
  compactFrameRow: {
    padding: '3px 6px 3px 12px',
    gap: 6,
  },
  rowActions: {
    display: 'flex',
    flexShrink: 0,
    opacity: 0.5,
    '&:hover': { opacity: 1 },
  },
  smallIconButton: {
    padding: '1px 3px',
  },
  hint: {
    padding: '6px 12px',
    fontSize: FONT_SIZE.sm,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  inputText: {
    fontSize: FONT_SIZE.sm,
  },
  // Capture.
  captureAllRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  captureView: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  captureViewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: FONT_SIZE.sm,
    fontWeight: 600,
  },
  captureViewName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  captureCategoryList: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 4,
  },
  captureCategory: {
    display: 'flex',
    flexDirection: 'column',
  },
  captureCategoryHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  captureCategoryLabel: {
    margin: 0,
    '& .MuiFormControlLabel-label': {
      fontSize: FONT_SIZE.sm,
    },
  },
  captureTypeList: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 20,
  },
  captureTypeLabel: {
    margin: 0,
    '& .MuiFormControlLabel-label': {
      fontSize: FONT_SIZE.xs,
    },
  },
  captureTypeCheckbox: {
    padding: 2,
  },
  toggleTextButton: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: FONT_SIZE.xs,
    opacity: 0.6,
    padding: '0 2px',
    alignSelf: 'flex-start',
    '&:hover': { opacity: 1 },
  },
  // Shapes.
  toolPalette: {
    display: 'flex',
    gap: 4,
    padding: '2px 12px 6px',
    flexWrap: 'wrap',
  },
  annotationToolButton: {
    fontSize: FONT_SIZE.xs,
    padding: '2px 7px',
    minWidth: 0,
    textTransform: 'none',
  },
  drawingStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 12px 6px',
    fontSize: FONT_SIZE.xs,
    opacity: 0.8,
  },
  shapeViewLabel: {
    padding: '4px 12px 0',
    fontSize: FONT_SIZE.xs,
    opacity: 0.5,
  },
  shapeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: FONT_SIZE.sm,
    padding: '3px 6px 3px 12px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  shapeRowSelected: {
    backgroundColor: theme.palette.action.selected,
    outline: `1px solid ${theme.palette.primary.main}`,
  },
  shapeRowHidden: {
    opacity: 0.45,
  },
  shapeLabel: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  shapeEditor: {
    padding: '8px 16px 12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.action.hover,
  },
  shapeEditorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: FONT_SIZE.sm,
  },
  shapeEditorLabel: {
    fontSize: FONT_SIZE.xs,
    opacity: 0.55,
    minWidth: 42,
    flexShrink: 0,
  },
  buttonGroup: {
    display: 'flex',
    gap: 3,
  },
  optionButton: {
    fontSize: FONT_SIZE.xs,
    padding: '2px 7px',
    minWidth: 0,
    textTransform: 'none',
    lineHeight: 1.5,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    padding: 0,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
    cursor: 'pointer',
    flexShrink: 0,
    backgroundColor: 'transparent',
    '&::-webkit-color-swatch-wrapper': { padding: 0 },
    '&::-webkit-color-swatch': { border: 'none', borderRadius: 2 },
  },
  annotationSlider: {
    flex: 1,
    marginLeft: 4,
  },
  numberInput: {
    width: 72,
    '& input': {
      fontSize: FONT_SIZE.xs,
      padding: '2px 0',
    },
  },
  coordinateLabel: {
    fontSize: FONT_SIZE.xs,
    opacity: 0.45,
    flexShrink: 0,
  },
  measurement: {
    fontSize: FONT_SIZE.xs,
    opacity: 0.75,
    flex: 1,
  },
  nativeSelect: {
    fontSize: FONT_SIZE.xs,
  },
}));
