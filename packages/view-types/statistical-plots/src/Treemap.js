/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
import { treemap, treemapBinary, hierarchy as d3_hierarchy } from 'd3-hierarchy';
import { rollup as d3_rollup } from 'd3-array';
import { isEqual } from 'lodash-es';
import { colorArrayToString } from '@vitessce/sets-utils';
import { getDefaultColor, pluralize as plur } from '@vitessce/utils';

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

// Create a d3-scale ordinal scale mapping set paths to color strings.
function getColorScale(setSelectionArr, setColorArr, theme) {
  return scaleOrdinal()
    .domain(setSelectionArr || [])
    .range(
      setSelectionArr
        ?.map(setNamePath => (
          setColorArr?.find(d => isEqual(d.path, setNamePath))?.color
          || getDefaultColor(theme) // TODO: in light mode this is a dark foreground color. we want the inverse (light color in light mode)
        ))
        ?.map(colorArrayToString) || [],
    );
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
    obsSetSelection,
    sampleSetSelection,
    marginTop = 5,
    marginRight = 5,
    marginLeft = 80,
    marginBottom,
  } = props;


  const hierarchyData = useMemo(() => {
    // Support both sampleSet->obsSet and
    // obsSet->sampleSet hierarchy modes
    if (!obsCounts) {
      return null;
    }
    let map;
    if (isEqual(hierarchyLevels, ['sampleSet', 'obsSet'])) {
      map = d3_rollup(
        obsCounts,
        D => D[0].value,
        d => d.sampleSetPath,
        d => d.obsSetPath,
      );
    } else if (isEqual(hierarchyLevels, ['obsSet', 'sampleSet'])) {
      map = d3_rollup(
        obsCounts,
        D => D[0].value,
        d => d.obsSetPath,
        d => d.sampleSetPath,
      );
    } else {
      throw new Error('Unexpected levels value.');
    }
    return d3_hierarchy(map);
  }, [obsCounts, hierarchyLevels]);

  const [obsSetColorScale, sampleSetColorScale] = useMemo(() => [
      getColorScale(obsSetSelection, obsSetColor, theme),
      getColorScale(sampleSetSelection, sampleSetColor, theme),
    ], [obsSetSelection, sampleSetSelection, sampleSetColor, obsSetColor, theme]);

  const treemapLayout = useMemo(() => {
    const treemapFunc = treemap()
      .tile(treemapBinary)
      .size([width, height])
      .padding(1)
      .round(true);

    // When d3.hierarchy is passed a Map object,
    // the nodes are represented like [key, value] tuples.
    // So in `.sum` and `.sort` below,
    // `d[1]` accesses the value (i.e., cell count).
    // Reference: https://d3js.org/d3-hierarchy/hierarchy#hierarchy
    return treemapFunc(hierarchyData
      .sum(d => d[1])
      .sort((a, b) => b[1] - a[1]));
  }, [hierarchyData, width, height]);

  const svgRef = useRef();

  useEffect(() => {
    const domElement = svgRef.current;

    const svg = select(domElement);
    svg.selectAll('g').remove();
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    if (!treemapLayout?.leaves) {
      return;
    }

    // Add a group for each leaf of the hierarchy.
    const leaf = svg.selectAll('g')
      .data(treemapLayout.leaves())
      .join('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Append a tooltip.
    leaf.append('title')
        .text((d) => {
          const cellCount = d.data?.[1];
          const primaryPathString = JSON.stringify(d.data[0]);
          const secondaryPathString = JSON.stringify(d.parent.data[0]);
          return `${cellCount.toLocaleString()} ${plur(obsType, cellCount)} in ${primaryPathString} and ${secondaryPathString}`;
        });

    const getLeafUid = uidGenerator('leaf');
    const getClipUid = uidGenerator('clip');

    const colorScale = obsColorEncoding === 'sampleSetSelection'
      ? sampleSetColorScale
      : obsSetColorScale;
    const getPathForColoring = d => (
      // eslint-disable-next-line no-nested-ternary
      obsColorEncoding === 'sampleSetSelection'
        ? (hierarchyLevels[0] === 'obsSet' ? d.data?.[0] : d.parent?.data?.[0])
        : (hierarchyLevels[0] === 'sampleSet' ? d.data?.[0] : d.parent?.data?.[0])
    );

    // Append a color rectangle for each leaf.
    leaf.append('rect')
        .attr('id', (d) => {
          // eslint-disable-next-line no-param-reassign
          d.leafUid = getLeafUid();
          return d.leafUid.id;
        })
        .attr('fill', d => colorScale(getPathForColoring(d)))
        .attr('fill-opacity', 0.8)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0);

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
      .selectAll('tspan')
      .data(d => ([
        // Each element in this array corresponds to a line of text.
        d.data?.[0]?.at(-1),
        d.parent?.data?.[0]?.at(-1),
        `${d.data?.[1].toLocaleString()} ${plur(obsType, d.data?.[1])}`,
      ]))
      .join('tspan')
        .attr('x', 3)
        // eslint-disable-next-line no-unused-vars
        .attr('y', (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .text(d => d);
  }, [width, height, marginLeft, marginBottom, theme, marginTop, marginRight,
    obsType, sampleType, treemapLayout, sampleSetColor, sampleSetSelection,
    obsSetColorScale, sampleSetColorScale, obsColorEncoding, hierarchyLevels,
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
