/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { treemap, treemapBinary, hierarchy as d3_hierarchy } from 'd3-hierarchy';
import { rollup as d3_rollup } from 'd3-array';
import { isEqual } from 'lodash-es';
import { colorArrayToString } from '@vitessce/sets-utils';
import { pluralize as plur, getDefaultColor } from '@vitessce/utils';
import { getColorScale } from './utils.js';

// Rectangles which meet the selection criteria are emphasized,
// while those which are filter-included but un-selected are
// still rendered, but de-emphasized.
const SELECTED_FILL_OPACITY = 0.8;
const UNSELECTED_FILL_OPACITY = 0.3;
const SELECTED_TEXT_OPACITY = 1.0;
const UNSELECTED_TEXT_OPACITY = 0.5;
const HIGHLIGHT_STROKE_WIDTH = 2;

// Based on Observable's built-in DOM.uid function.
// This is intended to be used with SVG clipPaths
// which require a unique href value to reference
// other elements contained in the DOM.
function uidGenerator(prefix) {
  let i = 0;
  return () => {
    i += 1;
    return { id: `${prefix}-${i}`, href: `#${prefix}-${i}` };
  };
}

/**
 * Renders a treemap plot using D3.
 * References:
 * - https://observablehq.com/@d3/treemap-component
 * - https://observablehq.com/@d3/treemap-stratify
 * - https://observablehq.com/@d3/json-treemap
 * - https://observablehq.com/@d3/nested-treemap
 * @returns
 */
export default function Treemap(props) {
  const {
    obsCounts,
    obsColorEncoding,
    hierarchyLevels,
    theme,
    width,
    height,
    obsType,
    sampleType,
    obsSetColor,
    sampleSetColor,
    // The set paths which meet the filtering criteria.
    obsSetPaths,
    sampleSetPaths,
    // The set paths which are currently highlighted, if any.
    highlightedObsSetPath,
    highlightedSampleSetPath,
    marginTop = 5,
    marginRight = 5,
    marginLeft = 80,
    marginBottom,
    onNodeClick,
    onNodeHighlight,
  } = props;

  const hierarchyData = useMemo(() => {
    // Support both sampleSet->obsSet and
    // obsSet->sampleSet hierarchy modes
    if (!obsCounts || obsCounts.length === 0) {
      return null;
    }
    let map;
    if (isEqual(hierarchyLevels, ['sampleSet', 'obsSet'])) {
      map = d3_rollup(
        obsCounts,
        D => D[0],
        d => d.sampleSetPath,
        d => d.obsSetPath,
      );
    } else if (isEqual(hierarchyLevels, ['obsSet', 'sampleSet'])) {
      map = d3_rollup(
        obsCounts,
        D => D[0],
        d => d.obsSetPath,
        d => d.sampleSetPath,
      );
    } else {
      throw new Error('Unexpected levels value.');
    }
    return d3_hierarchy(map);
  }, [obsCounts, hierarchyLevels]);

  // The leaf node key corresponds to the second hierarchy level,
  // and the parent node key corresponds to the first hierarchy level.
  const [getObsSetPath, getSampleSetPath] = useMemo(() => {
    const isObsSetPrimary = hierarchyLevels[0] === 'obsSet';
    return [
      d => (isObsSetPrimary ? d.parent?.data?.[0] : d.data?.[0]),
      d => (isObsSetPrimary ? d.data?.[0] : d.parent?.data?.[0]),
    ];
  }, [hierarchyLevels]);

  // Sets which meet the filtering criteria still need colors,
  // even when they are un-selected, so the color scale domains
  // are the filter-included set paths.
  const [obsSetColorScale, sampleSetColorScale] = useMemo(() => [
      getColorScale(obsSetPaths, obsSetColor, theme),
      getColorScale(sampleSetPaths, sampleSetColor, theme),
    ], [obsSetPaths, sampleSetPaths, sampleSetColor, obsSetColor, theme]);

  const treemapLeaves = useMemo(() => {
    if (!hierarchyData) {
      return null;
    }
    const treemapFunc = treemap()
      .tile(treemapBinary)
      .size([width, height])
      .padding(1)
      .round(true);

    // When d3.hierarchy is passed a Map object,
    // the nodes are represented like [key, value] tuples.
    // So in `.sum` below, `d[1]` accesses the value
    // (i.e., the object containing the observation count).
    // Reference: https://d3js.org/d3-hierarchy/hierarchy#hierarchy
    const treemapLayout = treemapFunc(hierarchyData
      .sum(d => d[1]?.value || 0)
      // Note: unlike `.sum`, `.sort` receives nodes rather than node data,
      // and `.sum` has already run, so `node.value` is available here.
      .sort((a, b) => b.value - a.value));
    return treemapLayout.leaves();
  }, [hierarchyData, width, height]);

  const svgRef = useRef();

  // Render the treemap. Note that highlighting is intentionally _not_
  // handled here, so that hovering does not cause the elements
  // being hovered to be removed and re-created.
  useEffect(() => {
    const domElement = svgRef.current;

    if (!width || !height) {
      return;
    }

    const svg = select(domElement);
    svg.selectAll('g').remove();
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'font: 10px sans-serif');

    // Note: when no filtering criteria are in effect, there is a single
    // rectangle representing all of the observations, since "no criteria"
    // means that every observation is included.
    if (!treemapLeaves) {
      return;
    }

    const getIsSelected = d => Boolean(d.data?.[1]?.isSelected);

    // Add a group for each leaf of the hierarchy.
    const leaf = svg.selectAll('g')
      .data(treemapLeaves)
      .join('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Append a tooltip.
    leaf.append('title')
        .text((d) => {
          const obsCount = d.data?.[1]?.value || 0;
          const setPathStrings = [getObsSetPath(d), getSampleSetPath(d)]
            .filter(Boolean)
            .map(setPath => JSON.stringify(setPath));
          const inClause = setPathStrings.length > 0
            ? ` in ${setPathStrings.join(' and ')}`
            : '';
          const selectionClause = getIsSelected(d) ? '' : ' (not selected)';
          return `${obsCount.toLocaleString()} ${plur(obsType, obsCount)}${inClause}${selectionClause}`;
        });

    const getLeafUid = uidGenerator('leaf');
    const getClipUid = uidGenerator('clip');

    const colorScale = obsColorEncoding === 'sampleSetSelection'
      ? sampleSetColorScale
      : obsSetColorScale;
    const getPathForColoring = obsColorEncoding === 'sampleSetSelection'
      ? getSampleSetPath
      : getObsSetPath;

    // De-emphasized rectangles use the theme's default (gray) color.
    const deemphasizedColor = colorArrayToString(getDefaultColor(theme));
    const highlightColor = (theme === 'dark' ? 'white' : 'black');

    // Append a color rectangle for each leaf.
    leaf.append('rect')
        .attr('id', (d) => {
          // eslint-disable-next-line no-param-reassign
          d.leafUid = getLeafUid();
          return d.leafUid.id;
        })
        .attr('cursor', 'pointer')
        .attr('fill', d => (getIsSelected(d)
          ? (colorScale(getPathForColoring(d)) || deemphasizedColor)
          : deemphasizedColor
        ))
        .attr('fill-opacity', d => (getIsSelected(d)
          ? SELECTED_FILL_OPACITY
          : UNSELECTED_FILL_OPACITY
        ))
        // The stroke width is set by the highlighting effect below.
        .attr('stroke', highlightColor)
        .attr('stroke-width', 0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .on('click', (e, d) => {
          onNodeClick(getObsSetPath(d));
        })
        .on('mouseenter', (e, d) => {
          onNodeHighlight(getObsSetPath(d));
        })
        .on('mouseleave', () => {
          onNodeHighlight(null);
        });

    // Append a clipPath to ensure text does not overflow.
    leaf.append('clipPath')
        .attr('id', (d) => {
          // eslint-disable-next-line no-param-reassign
          d.clipUid = getClipUid();
          return d.clipUid.id;
        })
      .append('use')
        .attr('xlink:href', d => d.leafUid.href);

    // Append multiline text.
    leaf.append('text')
        .attr('clip-path', d => `url(${d.clipUid.href})`)
        .attr('fill-opacity', d => (getIsSelected(d)
          ? SELECTED_TEXT_OPACITY
          : UNSELECTED_TEXT_OPACITY
        ))
      .selectAll('tspan')
      // Each element in this array corresponds to a line of text,
      // ordered from the primary to the secondary hierarchy level.
      // Null set names (i.e., when there are no obsSets or sampleSets
      // to partition by) are omitted.
      .data((d) => {
        const obsCount = d.data?.[1]?.value || 0;
        return [
          ...(hierarchyLevels[0] === 'obsSet'
            ? [getSampleSetPath(d)?.at(-1), getObsSetPath(d)?.at(-1)]
            : [getObsSetPath(d)?.at(-1), getSampleSetPath(d)?.at(-1)]
          ),
          `${obsCount.toLocaleString()} ${plur(obsType, obsCount)}`,
        ].filter(Boolean);
      })
      .join('tspan')
        .attr('x', 3)
        // eslint-disable-next-line no-unused-vars
        .attr('y', (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .text(d => d);
  }, [width, height, marginLeft, marginBottom, theme, marginTop, marginRight,
    obsType, sampleType, treemapLeaves, sampleSetColor, sampleSetPaths,
    obsSetPaths, obsSetColor, obsSetColorScale, sampleSetColorScale,
    obsColorEncoding, hierarchyLevels, onNodeClick, onNodeHighlight,
    getObsSetPath, getSampleSetPath,
  ]);

  // Highlighting: outline the rectangles which correspond to the
  // highlighted set(s). This runs after the rendering effect above,
  // so it also applies to newly-created rectangles.
  useEffect(() => {
    const domElement = svgRef.current;
    if (!domElement) {
      return;
    }
    // A leaf is highlighted when it matches every non-null highlighted path.
    const getIsHighlighted = d => Boolean(
      (highlightedObsSetPath || highlightedSampleSetPath)
      && (!highlightedObsSetPath || isEqual(highlightedObsSetPath, getObsSetPath(d)))
      && (!highlightedSampleSetPath || isEqual(highlightedSampleSetPath, getSampleSetPath(d))),
    );
    select(domElement)
      .selectAll('g rect')
        .attr('stroke-width', d => (getIsHighlighted(d) ? HIGHLIGHT_STROKE_WIDTH : 0));
  }, [highlightedObsSetPath, highlightedSampleSetPath,
    getObsSetPath, getSampleSetPath, treemapLeaves,
  ]);

  return (
    <svg
      ref={svgRef}
      style={{
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
      }}
    />
  );
}
