import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@vitessce/styles';
import { formatBytes, formatExtent } from './volume-info.js';

const useStyles = makeStyles()(theme => ({
  volumeInfoPanel: {
    position: 'absolute',
    right: '8px',
    bottom: '8px',
    zIndex: 1,
    maxWidth: 'calc(100% - 16px)',
    maxHeight: 'calc(100% - 16px)',
    overflowY: 'auto',
    padding: '2px 4px 2px 8px',
    borderRadius: '4px',
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
    opacity: 0.9,
  },
  volumeInfoHeader: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4px',
  },
  // One line next to the expand button, rather than wrapping under it.
  volumeInfoHeaderText: {
    whiteSpace: 'nowrap',
  },
  // No taller than a line of text, so the box fits its text.
  volumeInfoExpandButton: {
    flexShrink: 0,
    padding: 0,
    fontSize: '16px',
  },
  volumeInfoText: {
    margin: 0,
    fontSize: '11px',
    lineHeight: 1.4,
  },
  volumeInfoWarning: {
    color: theme.palette.error.main,
  },
  // Source levels too large to render. Set on the cells, since MUI gives
  // table cells their own text color.
  volumeInfoDroppedCell: {
    '&&': {
      color: theme.palette.error.main,
    },
  },
  volumeInfoQueuedRow: {
    backgroundColor: theme.palette.action.selected,
  },
  volumeInfoCell: {
    padding: '1px 6px 1px 0',
    fontSize: '11px',
    borderBottom: 'none',
    whiteSpace: 'nowrap',
    color: 'inherit',
  },
}));

function formatSpacing(spacing, unit) {
  // ZYX to XYZ, as the extents.
  const sizes = [...spacing].reverse().map(size => Number(size.toPrecision(3))).join(' × ');
  return unit ? `${sizes} ${unit}` : sizes;
}

/**
 * Size and shape of the volume, the levels it is rendered from, and the bricks
 * waiting to load. Collapsed to a summary; expanded to a table of levels.
 * @param {object} props
 * @param {object} props.dataManager An initialized VolumeDataManager.
 */
export function VolumeInfoPanel({ dataManager }) {
  const { classes } = useStyles();
  const cellClass = classes.volumeInfoCell;
  const [isExpanded, setIsExpanded] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);

  // Only the table shows the queue, so it is only polled while expanded.
  useEffect(() => {
    if (!isExpanded) return undefined;
    const update = () => setQueueStatus(dataManager.getQueueStatus());
    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [dataManager, isExpanded]);

  const info = dataManager.volumeInfo;
  if (!info) return null;

  const { sourceLevels, renderLevels, firstSource } = info;
  const queuedByLevel = queueStatus?.queuedByLevel ?? [];
  const hasSpacing = info.spacing.some(size => size !== 1);
  // With one channel, per channel and total are the same size.
  const hasChannels = info.channelCount > 1;
  const columns = [
    'Level', 'Extent', 'Source', 'Chunk',
    ...(hasChannels ? ['Per channel', 'Total'] : ['Data']),
    'Queued',
  ];
  const droppedClass = `${cellClass} ${classes.volumeInfoDroppedCell}`;
  const sizeCells = (sourceLevel, isShown, className = cellClass) => (hasChannels
    ? [sourceLevel.channelBytes, sourceLevel.bytes] : [sourceLevel.bytes]
  ).map((bytes, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <TableCell key={`size-${i}`} className={className}>{isShown ? formatBytes(bytes) : '–'}</TableCell>
  ));

  // A source level's data size goes on its first render level only: logical
  // levels (Z reduced on the fly) and the overview read the same source.
  const seenSources = new Set();

  return (
    <div className={classes.volumeInfoPanel}>
      <div className={classes.volumeInfoHeader}>
        <Typography className={`${classes.volumeInfoText} ${classes.volumeInfoHeaderText}`}>
          {formatExtent(sourceLevels[0].shape)}
          {` · ${info.channelCount} ch · ${info.dtype} · ${formatBytes(sourceLevels[0].bytes)}`}
        </Typography>
        <IconButton
          size="small"
          className={classes.volumeInfoExpandButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Hide volume levels' : 'Show volume levels'}
        >
          {isExpanded ? <ExpandMoreIcon fontSize="inherit" /> : <ExpandLessIcon fontSize="inherit" />}
        </IconButton>
      </div>
      {firstSource > 0 ? (
        <Typography className={`${classes.volumeInfoText} ${classes.volumeInfoWarning}`}>
          {`Too large for full resolution: finest shown is source level ${firstSource}`
            + ` (${formatExtent(sourceLevels[firstSource].shape)})`}
        </Typography>
      ) : null}
      {isExpanded ? (
        <>
          {hasSpacing ? (
            <Typography className={classes.volumeInfoText}>
              {`Voxel size (level 0): ${formatSpacing(info.spacing, info.spacingUnit)}`}
            </Typography>
          ) : null}
          <Table size="small">
            <TableBody>
              <TableRow>
                {columns.map(column => (
                  <TableCell key={column} className={cellClass}>
                    <b>{column}</b>
                  </TableCell>
                ))}
              </TableRow>
              {sourceLevels.slice(0, firstSource).map((sourceLevel, source) => (
                // eslint-disable-next-line react/no-array-index-key
                <TableRow key={`dropped-${source}`}>
                  <TableCell className={droppedClass}>–</TableCell>
                  <TableCell className={droppedClass}>{formatExtent(sourceLevel.shape)}</TableCell>
                  <TableCell className={droppedClass}>{source}</TableCell>
                  <TableCell className={droppedClass}>{formatExtent(sourceLevel.chunks)}</TableCell>
                  {sizeCells(sourceLevel, true, droppedClass)}
                  <TableCell className={droppedClass}>too large</TableCell>
                </TableRow>
              ))}
              {renderLevels.map((renderLevel, level) => {
                const sourceLevel = sourceLevels[renderLevel.source];
                const isFirstOfSource = !seenSources.has(renderLevel.source);
                seenSources.add(renderLevel.source);
                const isQueued = queuedByLevel[level] > 0;
                return (
                  <TableRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={`level-${level}`}
                    className={isQueued ? classes.volumeInfoQueuedRow : undefined}
                  >
                    <TableCell className={cellClass}>{`L${level}`}</TableCell>
                    <TableCell className={cellClass}>{formatExtent(renderLevel.shape)}</TableCell>
                    <TableCell className={cellClass}>
                      {renderLevel.zFactor > 1
                        ? `${renderLevel.source}, Z ÷${renderLevel.zFactor} (${renderLevel.zMode})`
                        : renderLevel.source}
                    </TableCell>
                    <TableCell className={cellClass}>{formatExtent(sourceLevel.chunks)}</TableCell>
                    {sizeCells(sourceLevel, isFirstOfSource)}
                    <TableCell className={cellClass}>{queuedByLevel[level] || ''}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      ) : null}
    </div>
  );
}
