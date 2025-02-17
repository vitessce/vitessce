/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
import { treemap, treemapBinary, hierarchy } from 'd3-hierarchy';
import { colorArrayToString } from '@vitessce/sets-utils';

function uidGenerator(prefix) {
  let i = 0;
  return () => {
    i += 1;
    return { id: `${prefix}-${i}`, href: `#${prefix}-${i}` };
  };
}

export default function Treemap(props) {
  const {
    obsCounts,
    sampleCounts,
    theme,
    width,
    height,
    obsType,
    sampleType,
    sampleSetColor,
    sampleSetSelection,
    marginTop = 5,
    marginRight = 5,
    marginLeft = 80,
    marginBottom,
    // TODO: waffle vs. treemap?
    // TODO: sample vs. obs-mode?
    // TODO: sampleSet->obsSet vs. obsSet->sampleSet hierarchy mode?
  } = props;

  const data = useMemo(() => {
    const result = {
      name: 'root',
      children: [],
    };
    if (obsCounts) {
      // TODO: support sampleSet->obsSet also
      Array.from(obsCounts.entries()).forEach(([cellSetKey, firstLevelInternMap]) => {
        const cellSetObj = { name: cellSetKey?.join(','), children: [] };
        Array.from(firstLevelInternMap.entries()).forEach(([sampleSetKey, value]) => {
          // TODO: also store full key paths in this object.
          cellSetObj.children.push({
            name: `${sampleSetKey?.at(-1)}, ${cellSetKey?.at(-1)}`,
            value,
          });
        });
        result.children.push(cellSetObj);
      });
    }
    return result;
  }, [obsCounts, sampleCounts]);

  const treemapLayout = useMemo(() => {
    const treemapFunc = treemap()
      .tile(treemapBinary)
      .size([width, height])
      .padding(1)
      .round(true);

    return treemapFunc(hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value));
  }, [data, width, height]);

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

    const sampleSetNames = sampleSetSelection?.map(path => path.at(-1));
    const colorScale = scaleOrdinal()
      .domain(sampleSetNames)
      .range(
        // TODO: check for full path equality here.
        sampleSetNames
          .map(name => (
            sampleSetColor?.find(d => d.path.at(-1) === name)?.color
            || [125, 125, 125]
          ))
          .map(colorArrayToString),
      );

    // Add a cell for each leaf of the hierarchy.
    const leaf = svg.selectAll('g')
      .data(treemapLayout.leaves())
      .join('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Append a tooltip.
    leaf.append('title')
        .text(d => d.data.name + d.value);

    const getLeafUid = uidGenerator('leaf');
    const getClipUid = uidGenerator('clip');

    // Append a color rectangle.
    leaf.append('rect')
        .attr('id', d => (d.leafUid = getLeafUid()).id)
        .attr('fill', d => colorScale(d.data.name))
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0);

    // Append a clipPath to ensure text does not overflow.
    leaf.append('clipPath')
        .attr('id', d => (d.clipUid = getClipUid()).id)
      .append('use')
        .attr('xlink:href', d => d.leafUid.href);

    // Append multiline text. The last line shows the value and has a specific formatting.
    leaf.append('text')
        .attr('clip-path', d => `url(${d.clipUid.href})`)
      .selectAll('tspan')
      .data(d => ([...d.data.name.split(', '), `${d.value.toLocaleString()} ${obsType}s`]))
      .join('tspan')
        .attr('x', 3)
        .attr('y', (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .attr('fill-opacity', (d, i, nodes) => (i === nodes.length - 1 ? 0.7 : null))
        .text(d => d);
  }, [width, height, data, marginLeft, marginBottom, theme, marginTop, marginRight,
    obsType, sampleType, treemapLayout, sampleSetColor, sampleSetSelection,
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
