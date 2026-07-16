import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  makeStyles,
  IconButton,
  Button,
  Slider,
  TextField,
  Tooltip,
  ArrowLeft,
  ArrowRight,
  ArrowDropUp,
  ArrowDropDown,
  CenterFocusStrong,
  CircularProgress,
  Visibility,
  VisibilityOff,
  Close,
  MenuBook,
  Edit,
  Add,
  RemoveCircle,
  CloudDownload,
  ContentCopy,
  FileCopy,
  Check,
  Code,
  Warning,
  Info,
} from '@vitessce/styles';

const TOOLS = [
  { key: 'rectangle', label: 'Rect' },
  { key: 'line', label: 'Line' },
  { key: 'ellipse', label: 'Ellipse' },
  { key: 'polygon', label: 'Poly' },
  { key: 'polyline', label: 'Path' },
];

function rgbToHex(rgb) {
  if (!rgb || rgb.length < 3) return '#ffffff';
  return `#${rgb.slice(0, 3).map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [255, 255, 255];
}

const DASH_OPTIONS = [
  { key: null, label: 'Solid' },
  { key: '8 4', label: 'Dash' },
  { key: '2 4', label: 'Dot' },
];

function ShapeIcon({ type, size = 13 }) {
  const s = size;
  const sw = 1.5;
  const c = 'currentColor';
  if (type === 'rectangle') return (
    <svg width={s} height={s} viewBox="0 0 13 13" fill="none"><rect x="1" y="3" width="11" height="7" stroke={c} strokeWidth={sw} /></svg>
  );
  if (type === 'line') return (
    <svg width={s} height={s} viewBox="0 0 13 13" fill="none"><line x1="1.5" y1="11.5" x2="11.5" y2="1.5" stroke={c} strokeWidth={sw} strokeLinecap="round" /><polygon points="11.5,1.5 8.5,2.5 10.5,4.5" fill={c} /></svg>
  );
  if (type === 'ellipse') return (
    <svg width={s} height={s} viewBox="0 0 13 13" fill="none"><ellipse cx="6.5" cy="6.5" rx="5" ry="3" stroke={c} strokeWidth={sw} /></svg>
  );
  if (type === 'polygon') return (
    <svg width={s} height={s} viewBox="0 0 13 13" fill="none"><polygon points="6.5,1 11.5,4.5 9.5,11 3.5,11 1.5,4.5" stroke={c} strokeWidth={sw} fill="none" /></svg>
  );
  if (type === 'polyline') return (
    <svg width={s} height={s} viewBox="0 0 13 13" fill="none"><polyline points="1.5,10.5 4,5 7,8.5 10,3 12,6" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
  );
  return null;
}

const FS = { xs: '0.65rem', sm: '0.78rem', md: '0.82rem', lg: '0.92rem' };
const FONT_MONO = 'monospace';

const useStyles = makeStyles()(theme => ({
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
  enterTopBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '4px 6px',
    flexShrink: 0,
  },
  enterEditBtn: {
    opacity: 0.4,
    '&:hover': { opacity: 0.9 },
  },
  enterScreen: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '0 28px 24px',
    textAlign: 'center',
    overflowY: 'auto',
  },
  enterIcon: {
    opacity: 0.18,
    lineHeight: 1,
    marginBottom: 4,
  },
  enterLabel: {
    fontSize: FS.xs,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    opacity: 0.35,
  },
  enterCount: {
    fontSize: '1.6rem',
    fontWeight: 300,
    letterSpacing: '0.01em',
    lineHeight: 1.1,
    opacity: 0.85,
  },
  enterHint: {
    fontSize: FS.sm,
    opacity: 0.45,
    lineHeight: 1.6,
    marginTop: 2,
    width: '100%',
  },
  enterBeginBtn: {
    marginTop: 12,
    padding: '9px 32px',
    fontSize: FS.lg,
    letterSpacing: '0.04em',
  },
  // ── Play mode header ──────────────────────────────────────────────────────
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
    fontSize: FS.md,
    fontWeight: 600,
    opacity: 0.75,
    letterSpacing: '0.04em',
    userSelect: 'none',
  },
  playExitBtn: {
    opacity: 0.5,
    '&:hover': { opacity: 1 },
  },
  playEditBtn: {
    opacity: 0.5,
    '&:hover': { opacity: 1 },
  },
  // ── Play mode nav ─────────────────────────────────────────────────────────
  navRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 6px 2px',
    gap: 2,
    flexShrink: 0,
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
  divergedChip: {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: FS.xs,
    color: theme.palette.warning?.main ?? '#f5a623',
    opacity: 0.9,
    whiteSpace: 'nowrap',
    paddingLeft: 3,
    pointerEvents: 'none',
  },
  editBtn: {
    fontSize: FS.xs,
    padding: '2px 6px',
    minWidth: 0,
  },
  recentBtnDiverged: {
    color: theme.palette.warning?.main ?? '#f5a623',
  },
  // ── Active frame card ──────────────────────────────────────────────────────
  activeFrame: {
    padding: '8px 12px 6px',
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
    maxHeight: 130,
    overflowY: 'auto',
  },
  frameTitle: {
    fontWeight: 700,
    fontSize: FS.lg,
    lineHeight: 1.3,
    marginBottom: 3,
  },
  frameText: {
    fontSize: FS.sm,
    opacity: 0.75,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  shapeCount: {
    display: 'inline-block',
    fontSize: FS.xs,
    opacity: 0.6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  frameList: {
    overflowY: 'auto',
    flex: 1,
    padding: '4px 0',
  },
  frameItem: {
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: FS.md,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
      backgroundColor: theme.palette.action?.hover || 'rgba(255,255,255,0.08)',
    },
  },
  frameItemActive: {
    backgroundColor: theme.palette.action?.selected || 'rgba(255,255,255,0.14)',
    fontWeight: 600,
  },
  frameNum: {
    fontSize: FS.md,
    fontWeight: 700,
    opacity: 0.35,
    minWidth: 20,
    textAlign: 'right',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    fontFamily: FONT_MONO,
  },
  frameNumActive: {
    opacity: 1,
    color: theme.palette.primary?.main || '#90caf9',
  },
  empty: {
    padding: '12px',
    opacity: 0.5,
    fontSize: FS.md,
    textAlign: 'center',
  },
  // Edit mode styles
  editHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
    gap: 4,
  },
  editTitle: {
    fontSize: FS.lg,
    fontWeight: 600,
    flex: 1,
  },
  toolPalette: {
    display: 'flex',
    gap: 4,
    padding: '6px 12px',
    flexWrap: 'wrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
  },
  toolBtn: {
    fontSize: FS.xs,
    padding: '2px 7px',
    minWidth: 0,
    textTransform: 'none',
  },
  toolBtnActive: {
    backgroundColor: theme.palette.primary?.main || '#1976d2',
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary?.dark || '#1565c0',
    },
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  headerIconBtn: {
    opacity: 0.7,
    '&:hover': { opacity: 1 },
  },
  captureViewBtn: {
    fontSize: FS.xs,
    padding: '3px 8px',
    minWidth: 0,
    textTransform: 'none',
    alignSelf: 'flex-start',
  },
  // ── Edit mode body ──────────────────────────────────────────────────────────
  editBody: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  editSectionBlock: {
    flexShrink: 0,
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  sectionRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 12px',
  },
  sectionLabel: {
    flex: 1,
    fontSize: FS.xs,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  framesCompactList: {
    maxHeight: 170,
    overflowY: 'auto',
    paddingBottom: 2,
  },
  frameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: FS.md,
    '&:hover': {
      backgroundColor: theme.palette.action?.hover || 'rgba(255,255,255,0.06)',
    },
  },
  frameRowActive: {
    backgroundColor: theme.palette.action?.selected || 'rgba(255,255,255,0.12)',
    fontWeight: 600,
  },
  frameRowTitle: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  frameReorderBtns: {
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 0,
    opacity: 0.35,
    '&:hover': { opacity: 0.8 },
  },
  frameDetailFields: {
    padding: '8px 12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  shapesBody: {
    flex: 1,
    overflowY: 'auto',
  },
  shapeList: {
    padding: '2px 0',
  },
  shapeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: FS.sm,
    opacity: 0.8,
    padding: '3px 12px',
    borderRadius: 3,
    transition: 'background 0.1s',
  },
  shapeItemSelected: {
    opacity: 1,
    backgroundColor: theme.palette.action?.selected || 'rgba(255,255,255,0.14)',
    outline: `1px solid ${theme.palette.primary?.main || '#1976d2'}`,
  },
  shapeLabel: {
    flex: 1,
  },
  noFrameHint: {
    padding: '6px 12px',
    fontSize: FS.sm,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  shapeEditor: {
    padding: '8px 32px 12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.action?.hover || 'rgba(255,255,255,0.03)',
  },
  shapeEditorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: FS.sm,
  },
  shapeEditorLabel: {
    fontSize: FS.xs,
    opacity: 0.55,
    minWidth: 42,
    flexShrink: 0,
    letterSpacing: '0.02em',
  },
  shapeEditorBtnGroup: {
    display: 'flex',
    gap: 3,
  },
  shapeEditorBtn: {
    fontSize: FS.xs,
    padding: '2px 7px',
    minWidth: 0,
    textTransform: 'none',
    lineHeight: 1.5,
  },
  shapeEditorBtnActive: {
    backgroundColor: theme.palette.primary?.main || '#1976d2',
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary?.dark || '#1565c0',
    },
  },
  colorSwatch: {
    width: 20,
    height: 20,
    padding: 0,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
    cursor: 'pointer',
    flexShrink: 0,
    '&::-webkit-color-swatch-wrapper': {
      padding: 0,
    },
    '&::-webkit-color-swatch': {
      border: 'none',
      borderRadius: 2,
    },
  },
  widthInput: {
    width: 42,
    fontSize: FS.xs,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
    padding: '2px 6px',
    backgroundColor: 'transparent',
    color: 'inherit',
    flexShrink: 0,
    MozAppearance: 'textfield',
    '&::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
    '&::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
  },
  coordInput: {
    width: 66,
    fontSize: FS.xs,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
    padding: '2px 6px',
    backgroundColor: 'transparent',
    color: 'inherit',
    flexShrink: 0,
    MozAppearance: 'textfield',
    '&::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
    '&::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
  },
  coordLabel: {
    fontSize: FS.xs,
    opacity: 0.4,
    flexShrink: 0,
  },
  coordSelect: {
    flex: 1,
    fontSize: FS.xs,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
    padding: '2px 4px',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    minWidth: 0,
  },
  geomToggleBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: FS.xs,
    opacity: 0.5,
    padding: '0 2px',
    letterSpacing: '0.04em',
    '&:hover': { opacity: 0.9 },
  },
  shapeCopySelect: {
    fontSize: FS.xs,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
    padding: '1px 3px',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
  },
  dataUrlBadge: {
    padding: '2px 12px 4px',
    fontSize: FS.xs,
    fontFamily: FONT_MONO,
    opacity: 0.45,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
    cursor: 'default',
  },
}));

export function AnnotationController(props) {
  const {
    frames,
    frameIndex,
    overlayVisible,
    diverged,
    description,
    activeTool,
    onEnter,
    onExit,
    onBack,
    onForward,
    onToggleOverlay,
    onRecenter,
    onFrameClick,
    onSetFrames = () => {},
    onSetActiveTool = () => {},
    onCaptureViewState = () => {},
    onDownloadConfig = () => {},
    selectedShapeUid = null,
    onSetSelectedShapeUid = () => {},
    isLoadingData = false,
    loadDataError = null,
    dataMode = false,
    dataUrl = null,
    physicalPixelSize = null,
  } = props;

  const { classes, cx } = useStyles();
  const [editMode, setEditMode] = useState(false);
  const [geoOpen, setGeoOpen] = useState(false);
  useEffect(() => { setGeoOpen(false); }, [selectedShapeUid]);

  const activeFrameRef = useRef(null);
  const editBodyRef = useRef(null);
  useEffect(() => {
    if (activeFrameRef.current) activeFrameRef.current.scrollTop = 0;
    if (editBodyRef.current) editBodyRef.current.scrollTop = 0;
  }, [frameIndex]);

  const [hintExpanded, setHintExpanded] = useState(false);
  useEffect(() => { setHintExpanded(false); }, [description]);

  const [captureConfirmed, setCaptureConfirmed] = useState(false);
  const [copyConfirmed, setCopyConfirmed] = useState(false);
  const [downloadConfirmed, setDownloadConfirmed] = useState(false);
  const [configDownloadConfirmed, setConfigDownloadConfirmed] = useState(false);

  const handleCaptureViewState = useCallback(() => {
    onCaptureViewState();
    setCaptureConfirmed(true);
    setTimeout(() => setCaptureConfirmed(false), 1500);
  }, [onCaptureViewState]);
  const setSelectedShapeUid = onSetSelectedShapeUid;

  const handleToggleEditMode = useCallback(() => {
    if (editMode) {
      onSetActiveTool(null);
      setSelectedShapeUid(null);
    }
    setEditMode(prev => !prev);
  }, [editMode, onSetActiveTool, setSelectedShapeUid]);

  const handleAddFrame = useCallback(() => {
    const newFrame = {
      uid: crypto.randomUUID(),
      title: 'New Frame',
      shapes: [],
    };
    const updated = frames ? [...frames, newFrame] : [newFrame];
    onSetFrames(updated);
    onFrameClick(updated.length - 1);
  }, [frames, onSetFrames, onFrameClick]);

  const handleDeleteFrame = useCallback((i) => {
    if (!frames) return;
    const updated = frames.filter((_, idx) => idx !== i);
    onSetFrames(updated);
    if (updated.length === 0) {
      onFrameClick(null);
    } else {
      onFrameClick(Math.min(i, updated.length - 1));
    }
  }, [frames, onSetFrames, onFrameClick]);

  const handleMoveFrame = useCallback((index, direction) => {
    if (!frames) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= frames.length) return;
    const updated = [...frames];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    onSetFrames(updated);
    if (frameIndex === index) {
      onFrameClick(newIndex);
    } else if (frameIndex === newIndex) {
      onFrameClick(index);
    }
  }, [frames, frameIndex, onSetFrames, onFrameClick]);

  const handleDuplicateFrame = useCallback((i) => {
    if (!frames) return;
    const source = frames[i];
    const copy = {
      ...source,
      uid: crypto.randomUUID(),
      title: source.title ? `${source.title} (copy)` : 'Frame (copy)',
      shapes: (source.shapes ?? []).map(s => ({ ...s, uid: crypto.randomUUID() })),
    };
    const updated = [...frames.slice(0, i + 1), copy, ...frames.slice(i + 1)];
    onSetFrames(updated);
    onFrameClick(i + 1);
  }, [frames, onSetFrames, onFrameClick]);

  const handleUpdateTitle = useCallback((i, title) => {
    if (!frames) return;
    onSetFrames(frames.map((f, idx) => (idx === i ? { ...f, title } : f)));
  }, [frames, onSetFrames]);

  const handleUpdateText = useCallback((i, text) => {
    if (!frames) return;
    onSetFrames(frames.map((f, idx) => (idx === i ? { ...f, text } : f)));
  }, [frames, onSetFrames]);

  const handleDeleteShape = useCallback((shapeUid) => {
    if (!frames || frameIndex === null) return;
    onSetFrames(frames.map((f, idx) => (
      idx === frameIndex
        ? { ...f, shapes: (f.shapes ?? []).filter(s => s.uid !== shapeUid) }
        : f
    )));
  }, [frames, frameIndex, onSetFrames]);

  const handleUpdateShape = useCallback((shapeUid, updates) => {
    if (!frames || frameIndex === null) return;
    onSetFrames(frames.map((f, idx) => (
      idx === frameIndex
        ? { ...f, shapes: (f.shapes ?? []).map(s => s.uid === shapeUid ? { ...s, ...updates } : s) }
        : f
    )));
  }, [frames, frameIndex, onSetFrames]);

  const handleCopyShapeToFrame = useCallback((shapeUid, targetFrameIndex) => {
    if (!frames || frameIndex === null) return;
    const shape = frames[frameIndex].shapes?.find(s => s.uid === shapeUid);
    if (!shape) return;
    const copy = { ...shape, uid: crypto.randomUUID() };
    onSetFrames(frames.map((f, fi) => (
      fi === targetFrameIndex ? { ...f, shapes: [...(f.shapes ?? []), copy] } : f
    )));
  }, [frames, frameIndex, onSetFrames]);

  const handleToolClick = useCallback((tool) => {
    onSetActiveTool(activeTool === tool ? null : tool);
  }, [activeTool, onSetActiveTool]);

  const handleCopyJson = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(frames, null, 2));
      setCopyConfirmed(true);
      setTimeout(() => setCopyConfirmed(false), 1500);
    }
  }, [frames]);

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(frames, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotation-frames.json';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadConfirmed(true);
    setTimeout(() => setDownloadConfirmed(false), 1500);
  }, [frames]);

  const handleDownloadConfig = useCallback(() => {
    onDownloadConfig();
    setConfigDownloadConfirmed(true);
    setTimeout(() => setConfigDownloadConfirmed(false), 1500);
  }, [onDownloadConfig]);

  const numFrames = frames?.length ?? 0;

  // ── Edit mode layout ──────────────────────────────────────────────────────
  if (editMode) {
    const activeFrame = frameIndex !== null && frames ? frames[frameIndex] : null;
    return (
      <div className={classes.root}>

        {/* Header */}
        <div className={classes.editHeader}>
          <span className={classes.editTitle}>Edit Annotations</span>
          <div className={classes.headerActions}>
            <Tooltip title={copyConfirmed ? 'Copied!' : 'Copy JSON to clipboard'}>
              <span>
                <IconButton size="small" className={classes.headerIconBtn} onClick={handleCopyJson} disabled={!frames} style={copyConfirmed ? { color: '#4caf50' } : {}}>
                  {copyConfirmed ? <Check style={{ fontSize: 14 }} /> : <ContentCopy style={{ fontSize: 14 }} />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={downloadConfirmed ? 'Downloaded!' : 'Download annotation-frames.json'}>
              <span>
                <IconButton size="small" className={classes.headerIconBtn} onClick={handleDownloadJson} disabled={!frames} style={downloadConfirmed ? { color: '#4caf50' } : {}}>
                  {downloadConfirmed ? <Check style={{ fontSize: 14 }} /> : <CloudDownload style={{ fontSize: 14 }} />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={configDownloadConfirmed ? 'Downloaded!' : 'Download full Vitessce config'}>
              <span>
                <IconButton size="small" className={classes.headerIconBtn} onClick={handleDownloadConfig} style={configDownloadConfirmed ? { color: '#4caf50' } : {}}>
                  {configDownloadConfirmed ? <Check style={{ fontSize: 14 }} /> : <Code style={{ fontSize: 14 }} />}
                </IconButton>
              </span>
            </Tooltip>
            <Button size="small" variant="outlined" className={classes.editBtn} onClick={handleToggleEditMode}>
              Done
            </Button>
          </div>
        </div>
        {dataMode && dataUrl && (
          <Tooltip title={dataUrl} placement="bottom">
            <div className={classes.dataUrlBadge}>
              {dataUrl.length > 52 ? `…${dataUrl.slice(-49)}` : dataUrl}
            </div>
          </Tooltip>
        )}

        {/* ── Scrollable body ── */}
        <div className={classes.editBody} ref={editBodyRef}>

          {/* FRAMES section */}
          <div className={classes.editSectionBlock}>
            <div className={classes.sectionRow}>
              <span className={classes.sectionLabel}>Frames{numFrames > 0 ? ` · ${numFrames}` : ''}</span>
              <Tooltip title="Add frame">
                <IconButton size="small" onClick={handleAddFrame}><Add fontSize="inherit" /></IconButton>
              </Tooltip>
            </div>
            <div className={classes.framesCompactList}>
              {numFrames === 0 && (
                <div className={classes.noFrameHint}>No frames — click + to add one.</div>
              )}
              {(() => {
                const editPadLen = String(numFrames).length;
                return (frames ?? []).map((frame, i) => {
                  const isActive = i === frameIndex;
                  return (
                    <div
                      key={frame.uid}
                      className={cx(classes.frameRow, isActive && classes.frameRowActive)}
                      onClick={() => onFrameClick(i)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && onFrameClick(i)}
                    >
                      <span className={cx(classes.frameNum, isActive && classes.frameNumActive)}>
                        {String(i + 1).padStart(editPadLen, '0')}
                      </span>
                      <span className={classes.frameRowTitle}>{frame.title || `Frame ${i + 1}`}</span>
                      <div className={classes.frameReorderBtns} onClick={e => e.stopPropagation()} role="presentation">
                        <IconButton size="small" disabled={i === 0} onClick={e => { e.stopPropagation(); handleMoveFrame(i, -1); }} title="Move up" style={{ padding: '1px 3px' }}>
                          <ArrowDropUp style={{ fontSize: 22 }} />
                        </IconButton>
                        <IconButton size="small" disabled={i === (frames?.length ?? 0) - 1} onClick={e => { e.stopPropagation(); handleMoveFrame(i, 1); }} title="Move down" style={{ padding: '1px 3px' }}>
                          <ArrowDropDown style={{ fontSize: 22 }} />
                        </IconButton>
                      </div>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); handleDuplicateFrame(i); }} title="Duplicate frame">
                        <FileCopy fontSize="inherit" />
                      </IconButton>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); handleDeleteFrame(i); }} title="Delete frame">
                        <RemoveCircle fontSize="inherit" />
                      </IconButton>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* FRAME DETAILS section */}
          {activeFrame && (
            <div className={classes.editSectionBlock}>
              <div className={classes.sectionRow}>
                <span className={classes.sectionLabel}>Frame Details</span>
              </div>
              <div className={classes.frameDetailFields}>
                <TextField
                  value={activeFrame.title ?? ''}
                  onChange={e => handleUpdateTitle(frameIndex, e.target.value)}
                  size="small"
                  variant="outlined"
                  label="Title"
                  fullWidth
                  inputProps={{ style: { fontSize: FS.sm } }}
                />
                <TextField
                  value={activeFrame.text ?? ''}
                  onChange={e => handleUpdateText(frameIndex, e.target.value)}
                  size="small"
                  variant="outlined"
                  label="Notes"
                  placeholder="Narrative text (optional)"
                  multiline
                  rows={4}
                  fullWidth
                  inputProps={{ style: { fontSize: FS.sm } }}
                />
                <Tooltip title="Save current zoom/pan as this frame's view state">
                  <Button
                    size="small"
                    variant={captureConfirmed ? 'contained' : 'outlined'}
                    className={classes.captureViewBtn}
                    color={captureConfirmed ? 'success' : 'primary'}
                    startIcon={captureConfirmed
                      ? <Check style={{ fontSize: 13 }} />
                      : <CenterFocusStrong style={{ fontSize: 13 }} />}
                    onClick={handleCaptureViewState}
                  >
                    Capture View
                  </Button>
                </Tooltip>
              </div>
            </div>
          )}

          {/* SHAPES section */}
          {frameIndex !== null && (
            <div className={cx(classes.editSectionBlock, classes.shapesBody)}>
              <div className={classes.sectionRow}>
                <span className={classes.sectionLabel}>Shape Options</span>
              </div>
              <div className={classes.toolPalette}>
                {TOOLS.map(({ key, label }) => (
                  <Button
                    key={key}
                    size="small"
                    variant={activeTool === key ? 'contained' : 'outlined'}
                    className={cx(classes.toolBtn, activeTool === key && classes.toolBtnActive)}
                    onClick={() => handleToolClick(key)}
                    title={`Draw ${key}`}
                    startIcon={<ShapeIcon type={key} size={12} />}
                  >
                    {label}
                  </Button>
                ))}
                {activeTool && (
                  <Button size="small" variant="text" className={classes.toolBtn} onClick={() => onSetActiveTool(null)} title="Cancel drawing">✕</Button>
                )}
              </div>
              <div className={classes.sectionRow} style={{ marginTop: 6 }}>
                <span className={classes.sectionLabel}>
                  Shapes{(activeFrame?.shapes?.length ?? 0) > 0 ? ` · ${activeFrame.shapes.length}` : ''}
                </span>
              </div>
              {(activeFrame?.shapes?.length ?? 0) === 0 ? (
                <div className={classes.noFrameHint}>
                  {activeTool ? 'Click on the canvas to place points.' : 'Select a tool to start drawing.'}
                </div>
              ) : (
                <div className={classes.shapeList}>
                  {activeFrame.shapes.map(shape => {
                    const isSelected = selectedShapeUid === shape.uid;
                    const hasFill = ['rectangle', 'ellipse', 'polygon'].includes(shape.type);
                    const hasMarkers = ['line', 'polyline'].includes(shape.type);
                    const currentDash = shape.strokeDashArray ?? null;
                    const measurementValue = (() => {
                      const pps = physicalPixelSize;
                      const ppx = pps?.x ?? 1;
                      const ppy = pps?.y ?? 1;
                      const unit = pps?.unit ?? null;
                      const hasPhys = !!pps;
                      const addCommas = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                      const fmtDist = d => unit ? `${d.toFixed(2)} ${unit}` : `${d.toFixed(1)} px`;
                      const fmtArea = a => unit ? `${a.toFixed(2)} ${unit}²` : `${addCommas(a)} px²`;
                      if (shape.type === 'line') {
                        const dx = (shape.x2 ?? 0) - (shape.x1 ?? 0);
                        const dy = (shape.y2 ?? 0) - (shape.y1 ?? 0);
                        return fmtDist(hasPhys ? Math.sqrt((dx * ppx) ** 2 + (dy * ppy) ** 2) : Math.sqrt(dx * dx + dy * dy));
                      }
                      if (shape.type === 'rectangle') {
                        const areaPx = Math.abs((shape.width ?? 0) * (shape.height ?? 0));
                        return fmtArea(hasPhys ? areaPx * ppx * ppy : areaPx);
                      }
                      if (shape.type === 'ellipse') {
                        const areaPx = Math.PI * Math.abs(shape.radiusX ?? 0) * Math.abs(shape.radiusY ?? 0);
                        return fmtArea(hasPhys ? areaPx * ppx * ppy : areaPx);
                      }
                      if (shape.type === 'polygon' && shape.points?.length >= 3) {
                        const pts = shape.points;
                        let shoelace = 0;
                        for (let pi = 0; pi < pts.length; pi++) {
                          const [ax, ay] = pts[pi];
                          const [bx, by] = pts[(pi + 1) % pts.length];
                          shoelace += ax * by - bx * ay;
                        }
                        return fmtArea(hasPhys ? Math.abs(shoelace / 2) * ppx * ppy : Math.abs(shoelace / 2));
                      }
                      if (shape.type === 'polyline' && shape.points?.length >= 2) {
                        let total = 0;
                        for (let pi = 0; pi < shape.points.length - 1; pi++) {
                          const [ax, ay] = shape.points[pi];
                          const [bx, by] = shape.points[pi + 1];
                          total += hasPhys
                            ? Math.sqrt(((bx - ax) * ppx) ** 2 + ((by - ay) * ppy) ** 2)
                            : Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
                        }
                        return fmtDist(total);
                      }
                      return null;
                    })();
                    return (
                      <div key={shape.uid}>
                        <div
                          className={cx(classes.shapeItem, isSelected && classes.shapeItemSelected)}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedShapeUid(isSelected ? null : shape.uid)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && setSelectedShapeUid(isSelected ? null : shape.uid)}
                        >
                          <ShapeIcon type={shape.type} size={12} />
                          <span className={classes.shapeLabel}>{shape.text ? `"${shape.text}"` : shape.type}</span>
                          <IconButton size="small" onClick={e => { e.stopPropagation(); handleDeleteShape(shape.uid); }} title="Delete shape">
                            <RemoveCircle fontSize="inherit" />
                          </IconButton>
                        </div>
                        {isSelected && (
                          <div className={classes.shapeEditor} onClick={e => e.stopPropagation()} role="presentation">
                            {/* Label + position (lines only) */}
                            <div className={classes.shapeEditorRow}>
                              <span className={classes.shapeEditorLabel}>Label</span>
                              <TextField value={shape.text ?? ''} onChange={e => handleUpdateShape(shape.uid, { text: e.target.value || undefined })} size="small" variant="standard" placeholder="Label text" style={{ flex: 1 }} inputProps={{ style: { fontSize: FS.sm, padding: '0 0' } }} />
                              <Button size="small" variant={shape.labelBackground ? 'contained' : 'outlined'} className={cx(classes.shapeEditorBtn, shape.labelBackground && classes.shapeEditorBtnActive)} onClick={() => handleUpdateShape(shape.uid, { labelBackground: !shape.labelBackground })} style={{ flexShrink: 0 }} title="Toggle background behind label text">Bg</Button>
                            </div>
                            {hasMarkers && shape.text && (
                              <div style={{ display: 'flex', gap: 3, paddingLeft: 48, marginTop: -2 }}>
                                {['start', 'middle', 'end'].map(pos => {
                                  const active = (shape.textPosition ?? 'start') === pos;
                                  return (
                                    <Button key={pos} size="small" variant={active ? 'contained' : 'outlined'} className={cx(classes.shapeEditorBtn, active && classes.shapeEditorBtnActive)} onClick={() => handleUpdateShape(shape.uid, { textPosition: pos })}>
                                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                    </Button>
                                  );
                                })}
                              </div>
                            )}
                            {/* Stroke: color + dash style + width slider */}
                            <div className={classes.shapeEditorRow}>
                              <span className={classes.shapeEditorLabel}>Stroke</span>
                              <input type="color" className={classes.colorSwatch} value={rgbToHex(shape.strokeColor ?? [255, 255, 255])} onChange={e => handleUpdateShape(shape.uid, { strokeColor: hexToRgb(e.target.value) })} title="Stroke color" />
                              <div className={classes.shapeEditorBtnGroup}>
                                {DASH_OPTIONS.map(opt => (
                                  <Button key={String(opt.key)} size="small" variant={currentDash === opt.key ? 'contained' : 'outlined'} className={cx(classes.shapeEditorBtn, currentDash === opt.key && classes.shapeEditorBtnActive)} onClick={() => handleUpdateShape(shape.uid, { strokeDashArray: opt.key ?? undefined })} title={opt.key === null ? 'Solid' : opt.key === '8 4' ? 'Dashed' : 'Dotted'}>
                                    {opt.label}
                                  </Button>
                                ))}
                              </div>
                              <Slider size="small" min={1} max={10} step={1} value={shape.strokeWidth ?? 3} onChange={(_, v) => handleUpdateShape(shape.uid, { strokeWidth: v })} valueLabelDisplay="auto" style={{ flex: 1, marginLeft: 4 }} />
                            </div>
                            {/* Fill: color + opacity slider */}
                            {hasFill && (
                              <div className={classes.shapeEditorRow}>
                                <span className={classes.shapeEditorLabel}>Fill</span>
                                <input type="color" className={classes.colorSwatch} value={rgbToHex(shape.fillColor ?? shape.strokeColor ?? [255, 255, 255])} onChange={e => handleUpdateShape(shape.uid, { fillColor: hexToRgb(e.target.value) })} title="Fill color" />
                                <span style={{ fontSize: FS.xs, opacity: 0.6, flexShrink: 0 }}>α</span>
                                <Slider size="small" min={0} max={1} step={0.05} value={shape.fillOpacity ?? 0} onChange={(_, v) => handleUpdateShape(shape.uid, { fillOpacity: v })} valueLabelDisplay="auto" valueLabelFormat={v => v.toFixed(2)} style={{ flex: 1, marginLeft: 2 }} />
                              </div>
                            )}
                            {/* Markers: start/end caps — full-width symmetric layout */}
                            {hasMarkers && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {[
                                  { field: 'markerStart', current: shape.markerStart, prefix: '←', symbols: ['–', '←', '|–'] },
                                  { field: 'markerEnd',   current: shape.markerEnd,   prefix: '→', symbols: ['–', '→', '–|'] },
                                ].map(({ field, current, prefix, symbols }) => (
                                  <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <span style={{ fontSize: FS.xs, opacity: 0.45, width: 12, textAlign: 'center', flexShrink: 0 }}>{prefix}</span>
                                    <div className={classes.shapeEditorBtnGroup}>
                                      {[undefined, 'Arrow', 'Tick'].map((cap, ci) => {
                                        const active = (current ?? undefined) === cap;
                                        return (
                                          <Button key={cap ?? 'none'} size="small" variant={active ? 'contained' : 'outlined'} className={cx(classes.shapeEditorBtn, active && classes.shapeEditorBtnActive)} onClick={() => handleUpdateShape(shape.uid, { [field]: cap })}>
                                            {symbols[ci]}
                                          </Button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* ── Utilities row: attributes toggle + copy to frame ── */}
                            <div className={classes.shapeEditorRow} style={{ justifyContent: 'space-between', marginTop: 2 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                <button className={classes.geomToggleBtn} onClick={() => setGeoOpen(o => !o)}>
                                  {geoOpen ? '▾' : '▸'} Attributes
                                </button>
                                {!geoOpen && measurementValue && (
                                  <span style={{ fontSize: FS.xs, fontFamily: FONT_MONO, opacity: 0.55, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{measurementValue}</span>
                                )}
                              </div>
                              {numFrames > 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span className={classes.coordLabel}>Copy →</span>
                                  <select
                                    className={classes.shapeCopySelect}
                                    value=""
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => {
                                      e.stopPropagation();
                                      if (e.target.value !== '') {
                                        handleCopyShapeToFrame(shape.uid, +e.target.value);
                                        e.target.value = '';
                                      }
                                    }}
                                  >
                                    <option value="">frame…</option>
                                    {frames.map((f, fi) => fi !== frameIndex && (
                                      <option key={f.uid} value={fi}>
                                        {String(fi + 1).padStart(String(numFrames).length, '0')}
                                        {f.title ? ` ${f.title.length > 18 ? f.title.slice(0, 18) + '…' : f.title}` : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                            {/* ── Attributes section (collapsed by default): measure + geometry ── */}
                            {geoOpen && (<>
                              {measurementValue && (
                                <div className={classes.shapeEditorRow}>
                                  <span className={classes.shapeEditorLabel}>Measure</span>
                                  <span style={{ fontSize: FS.xs, fontFamily: FONT_MONO, opacity: 0.75, flex: 1 }}>{measurementValue}</span>
                                  <Button
                                    size="small"
                                    variant={shape.measureBackground ? 'contained' : 'outlined'}
                                    className={cx(classes.shapeEditorBtn, shape.measureBackground && classes.shapeEditorBtnActive)}
                                    onClick={() => handleUpdateShape(shape.uid, { measureBackground: !shape.measureBackground })}
                                    style={{ flexShrink: 0 }}
                                    title="Toggle background behind measure text"
                                  >
                                    Bg
                                  </Button>
                                  <Button
                                    size="small"
                                    variant={shape.showMeasure ? 'contained' : 'outlined'}
                                    className={cx(classes.shapeEditorBtn, shape.showMeasure && classes.shapeEditorBtnActive)}
                                    onClick={() => handleUpdateShape(shape.uid, { showMeasure: !shape.showMeasure })}
                                    style={{ flexShrink: 0 }}
                                  >
                                    Show
                                  </Button>
                                </div>
                              )}
                              {shape.type === 'rectangle' && (<>
                                <div className={classes.shapeEditorRow}>
                                  <span className={classes.shapeEditorLabel}>Origin</span>
                                  <span className={classes.coordLabel}>x</span>
                                  <input type="number" className={classes.coordInput} value={shape.x ?? 0} step={1} onChange={e => handleUpdateShape(shape.uid, { x: +e.target.value })} />
                                  <span className={classes.coordLabel}>y</span>
                                  <input type="number" className={classes.coordInput} value={shape.y ?? 0} step={1} onChange={e => handleUpdateShape(shape.uid, { y: +e.target.value })} />
                                </div>
                                <div className={classes.shapeEditorRow}>
                                  <span className={classes.shapeEditorLabel}>Size</span>
                                  <span className={classes.coordLabel}>w</span>
                                  <input type="number" className={classes.coordInput} value={shape.width ?? 0} step={1} min={1} onChange={e => handleUpdateShape(shape.uid, { width: +e.target.value })} />
                                  <span className={classes.coordLabel}>h</span>
                                  <input type="number" className={classes.coordInput} value={shape.height ?? 0} step={1} min={1} onChange={e => handleUpdateShape(shape.uid, { height: +e.target.value })} />
                                </div>
                              </>)}
                              {shape.type === 'line' && (<>
                                <div className={classes.shapeEditorRow}>
                                  <span className={classes.shapeEditorLabel}>Start</span>
                                  <span className={classes.coordLabel}>x</span>
                                  <input type="number" className={classes.coordInput} value={shape.x1 ?? 0} step={1} onChange={e => handleUpdateShape(shape.uid, { x1: +e.target.value })} />
                                  <span className={classes.coordLabel}>y</span>
                                  <input type="number" className={classes.coordInput} value={shape.y1 ?? 0} step={1} onChange={e => handleUpdateShape(shape.uid, { y1: +e.target.value })} />
                                </div>
                                <div className={classes.shapeEditorRow}>
                                  <span className={classes.shapeEditorLabel}>End</span>
                                  <span className={classes.coordLabel}>x</span>
                                  <input type="number" className={classes.coordInput} value={shape.x2 ?? 0} step={1} onChange={e => handleUpdateShape(shape.uid, { x2: +e.target.value })} />
                                  <span className={classes.coordLabel}>y</span>
                                  <input type="number" className={classes.coordInput} value={shape.y2 ?? 0} step={1} onChange={e => handleUpdateShape(shape.uid, { y2: +e.target.value })} />
                                </div>
                              </>)}
                              {shape.type === 'ellipse' && (<>
                                <div className={classes.shapeEditorRow}>
                                  <span className={classes.shapeEditorLabel}>Center</span>
                                  <span className={classes.coordLabel}>x</span>
                                  <input type="number" className={classes.coordInput} value={shape.x1 ?? 0} step={1} onChange={e => handleUpdateShape(shape.uid, { x1: +e.target.value })} />
                                  <span className={classes.coordLabel}>y</span>
                                  <input type="number" className={classes.coordInput} value={shape.y1 ?? 0} step={1} onChange={e => handleUpdateShape(shape.uid, { y1: +e.target.value })} />
                                </div>
                                <div className={classes.shapeEditorRow}>
                                  <span className={classes.shapeEditorLabel}>Radius</span>
                                  <span className={classes.coordLabel}>rx</span>
                                  <input type="number" className={classes.coordInput} value={shape.radiusX ?? 0} step={1} min={1} onChange={e => handleUpdateShape(shape.uid, { radiusX: +e.target.value })} />
                                  <span className={classes.coordLabel}>ry</span>
                                  <input type="number" className={classes.coordInput} value={shape.radiusY ?? 0} step={1} min={1} onChange={e => handleUpdateShape(shape.uid, { radiusY: +e.target.value })} />
                                </div>
                              </>)}
                              {(shape.type === 'polygon' || shape.type === 'polyline') && (
                                <div className={classes.shapeEditorRow}>
                                  <span className={classes.shapeEditorLabel}>Points</span>
                                  <span style={{ fontSize: FS.xs, opacity: 0.5 }}>{shape.points?.length ?? 0} vertices</span>
                                </div>
                              )}
                            </>)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {frameIndex === null && frames?.length > 0 && (
            <div className={classes.noFrameHint}>Select a frame above to edit its shapes.</div>
          )}
        </div>
      </div>
    );
  }

  // ── Play mode layout (existing behavior, + edit button) ──────────────────

  if (isLoadingData) {
    return (
      <div className={classes.root}>
        <div className={classes.enterTopBar}>
          <Tooltip title="Author / edit annotation frames">
            <IconButton size="small" className={classes.enterEditBtn} onClick={handleToggleEditMode}>
              <Edit style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </div>
        <div className={classes.enterScreen}>
          <CircularProgress size={36} style={{ opacity: 0.45 }} />
          <div className={classes.enterHint}>Loading annotation frames…</div>
        </div>
      </div>
    );
  }

  if (loadDataError) {
    return (
      <div className={classes.root}>
        <div className={classes.enterTopBar}>
          <Tooltip title="Author / edit annotation frames">
            <IconButton size="small" className={classes.enterEditBtn} onClick={handleToggleEditMode}>
              <Edit style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </div>
        <div className={classes.enterScreen}>
          <div className={classes.enterIcon}>
            <Warning style={{ fontSize: 44, color: '#f5a623' }} />
          </div>
          <div className={classes.enterLabel}>Failed to Load</div>
          <div className={classes.enterHint}>{loadDataError}</div>
          {dataUrl && (
            <div style={{ fontSize: FS.xs, opacity: 0.4, fontFamily: FONT_MONO, wordBreak: 'break-all', maxWidth: 220 }}>
              {dataUrl}
            </div>
          )}
          <Button size="small" variant="outlined" startIcon={<Edit fontSize="small" />} onClick={handleToggleEditMode}>
            Edit Annotations
          </Button>
        </div>
      </div>
    );
  }

  if (dataMode && !dataUrl) {
    return (
      <div className={classes.root}>
        <div className={classes.enterTopBar}>
          <Tooltip title="Author / edit annotation frames">
            <IconButton size="small" className={classes.enterEditBtn} onClick={handleToggleEditMode}>
              <Edit style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </div>
        <div className={classes.enterScreen}>
          <div className={classes.enterIcon}>
            <Info style={{ fontSize: 44 }} />
          </div>
          <div className={classes.enterLabel}>No URL Configured</div>
          <div className={classes.enterHint}>
            {'Set '}
            <code>annotationDataUrl</code>
            {' in your Vitessce config to load frames from a file.'}
          </div>
          <Button size="small" variant="outlined" startIcon={<Edit fontSize="small" />} onClick={handleToggleEditMode}>
            Edit Annotations
          </Button>
        </div>
      </div>
    );
  }

  if (!frames || frames.length === 0) {
    return (
      <div className={classes.root}>
        <div className={classes.enterTopBar}>
          <Tooltip title="Author / edit annotation frames">
            <IconButton size="small" className={classes.enterEditBtn} onClick={handleToggleEditMode}>
              <Edit style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </div>
        <div className={classes.enterScreen}>
          <div className={classes.enterIcon}>
            <MenuBook style={{ fontSize: 64 }} />
          </div>
          <div className={classes.enterLabel}>No Frames Yet</div>
          <div className={classes.enterHint}>
            Switch to edit mode to create your first annotation frame.
          </div>
          <Button size="small" variant="outlined" startIcon={<Edit fontSize="small" />} onClick={handleToggleEditMode}>
            Edit Annotations
          </Button>
        </div>
      </div>
    );
  }

  const activeFrame = frameIndex !== null ? frames[frameIndex] : null;
  const sliderValue = frameIndex !== null ? frameIndex : 0;

  if (frameIndex === null) {
    return (
      <div className={classes.root}>
        {/* Edit lives in the corner, well away from Begin */}
        <div className={classes.enterTopBar}>
          <Tooltip title="Author / edit annotation frames">
            <IconButton size="small" className={classes.enterEditBtn} onClick={handleToggleEditMode}>
              <Edit style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </div>

        <div className={classes.enterScreen}>
          {/* Elastic top spacer — caps at 80px so content stays near top on tall panels */}
          <div style={{ flex: 1, maxHeight: 80, minHeight: 0 }} />
          <div className={classes.enterIcon}>
            <MenuBook style={{ fontSize: 64 }} />
          </div>
          <div className={classes.enterLabel}>Guided Annotation</div>
          <div className={classes.enterCount}>
            {numFrames} frame{numFrames !== 1 ? 's' : ''}
          </div>
          {(() => {
            const desc = description ?? 'Step through annotated views with shapes and narrative text.';
            const isLong = desc.length > 220;
            return (
              <div className={classes.enterHint}>
                <div style={isLong && !hintExpanded
                  ? { maxHeight: 90, overflow: 'hidden' }
                  : isLong ? { maxHeight: 200, overflowY: 'auto' }
                  : {}}>
                  {desc}
                </div>
                {isLong && (
                  <button
                    onClick={() => setHintExpanded(e => !e)}
                    style={{
                      marginTop: 6, background: 'none', border: 'none',
                      cursor: 'pointer', color: 'inherit', padding: 0,
                      fontSize: FS.xs, opacity: 0.5, letterSpacing: '0.04em',
                    }}
                  >
                    {hintExpanded ? '↑ Show less' : '↓ Read more'}
                  </button>
                )}
              </div>
            );
          })()}
          <Button
            variant="contained"
            onClick={onEnter}
            className={classes.enterBeginBtn}
            startIcon={<MenuBook style={{ fontSize: 18 }} />}
          >
            Begin
          </Button>
          {/* Bottom spacer — slightly larger ratio to keep content slightly above mid */}
          <div style={{ flex: 1.5, minHeight: 0 }} />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>

      {/* Header: Exit on left · counter · Edit on right */}
      <div className={classes.playHeader}>
        <Tooltip title="Exit and return to original view">
          <IconButton size="small" className={classes.playExitBtn} onClick={onExit}>
            <Close style={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <span className={classes.playHeaderCenter}>
          {numFrames > 0 ? `${(frameIndex ?? 0) + 1} of ${numFrames}` : ''}
        </span>
        <Tooltip title="Edit annotation frames">
          <IconButton size="small" className={classes.playEditBtn} onClick={handleToggleEditMode}>
            <Edit style={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </div>

      {/* Navigation: arrows flanking slider */}
      <div className={classes.navRow}>
        <IconButton onClick={onBack} disabled={frameIndex === 0} title="Previous frame" style={{ width: 48, height: 48 }}>
          <ArrowLeft style={{ fontSize: 42 }} />
        </IconButton>
        <div className={classes.navSlider}>
          <Slider
            min={0}
            max={Math.max(0, numFrames - 1)}
            step={1}
            value={sliderValue}
            onChange={(_, v) => onFrameClick(v)}
            size="small"
            disabled={numFrames <= 1}
          />
        </div>
        <IconButton onClick={onForward} disabled={frameIndex === numFrames - 1} title="Next frame" style={{ width: 48, height: 48 }}>
          <ArrowRight style={{ fontSize: 42 }} />
        </IconButton>
      </div>

      {/* Utility: overlay toggle + recenter (+ diverged indicator) */}
      <div className={classes.utilityRow}>
        <Tooltip title={overlayVisible ? 'Hide annotation overlay' : 'Show annotation overlay'}>
          <IconButton onClick={onToggleOverlay}>
            {overlayVisible ? <Visibility style={{ fontSize: 26 }} /> : <VisibilityOff style={{ fontSize: 26 }} />}
          </IconButton>
        </Tooltip>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <Tooltip title={diverged ? 'View has drifted — click to recenter' : 'Recenter view'}>
            <IconButton onClick={onRecenter} className={diverged ? classes.recentBtnDiverged : undefined}>
              <CenterFocusStrong style={{ fontSize: 26 }} />
            </IconButton>
          </Tooltip>
          {diverged && (
            <span className={classes.divergedChip}>drifted</span>
          )}
        </div>
      </div>

      {activeFrame && (
        <div className={classes.activeFrame} ref={activeFrameRef}>
          {activeFrame.title && (
            <div className={classes.frameTitle}>{activeFrame.title}</div>
          )}
          {activeFrame.text && (
            <div className={classes.frameText}>{activeFrame.text}</div>
          )}
          <div className={classes.shapeCount}>
            {(activeFrame.shapes?.length ?? 0)} shape{(activeFrame.shapes?.length ?? 0) !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <div className={classes.frameList}>
        {(() => {
          const padLen = String(numFrames).length;
          return frames.map((frame, i) => {
            const isActive = i === frameIndex;
            return (
              <div
                key={frame.uid}
                className={cx(classes.frameItem, isActive && classes.frameItemActive)}
                onClick={() => onFrameClick(i)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onFrameClick(i)}
              >
                <span className={cx(classes.frameNum, isActive && classes.frameNumActive)}>
                  {String(i + 1).padStart(padLen, '0')}
                </span>
                {frame.title || `Frame ${i + 1}`}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
