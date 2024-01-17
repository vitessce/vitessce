/* eslint-disable indent */
/* eslint-disable camelcase */
import React, {useMemo, useEffect, useRef} from 'react';
import {scaleLinear} from 'd3-scale';
import {scale as vega_scale} from 'vega-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {format} from 'd3-format';
import {ascending} from 'd3-array';
import {select} from 'd3-selection';
import {capitalize} from '@vitessce/utils';

const scaleBand = vega_scale('band');

const OBS_KEY = 'obsId';
const FEATURE_KEY = 'value';

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(color) {
    return "#" + componentToHex(color[0]) + componentToHex(color[1]) + componentToHex(color[2]);
}

export default function FeatureBarPlot(props) {
    const {
        yMin,
        yMax,
        yUnits,
        jitter,
        colors,
        data,
        theme,
        width,
        height,
        marginTop = 5,
        marginRight = 5,
        marginLeft = 80,
        marginBottom,
        obsType,
        cellHighlight,
        cellSetSelection,
        additionalCellSets,
        cellSetColor,
        featureType,
        featureValueType,
        featureName,
        onBarSelect,
        onBarHighlight,
    } = props;

    // console.log(cellSetSelection)
    // console.log(additionalCellSets)
    // console.log(cellSetColor)
    let setsSave = new Map();
    let info = {name: "", id: "", color: []}
    for (let index in cellSetSelection) {
        let info = {name: "", id: "", color: []}

        let selectedElement = cellSetSelection[index][1];
        info.name = selectedElement
        //console.log(sets.tree[0].children);
        for (let subIndex in additionalCellSets.tree[0].children) {
            let child = additionalCellSets.tree[0].children[subIndex]
            if (child.name === selectedElement) {
                info.id = child.set[0][0];
                break;
            }
        }
        for (let subIndex in cellSetColor) {
            let color = cellSetColor[subIndex]
            if (color.path[1] === selectedElement) {
                info.color = color.color;
                break;
            }
        }
        setsSave.set(info.id, info);
    }
    // console.log(setsSave)


    const svgRef = useRef();

    // Get the max characters in an axis label for autsizing the bottom margin.
    const maxCharactersForLabel = useMemo(() => data.reduce((acc, val) => {
        // eslint-disable-next-line no-param-reassign
        acc = acc === undefined || val[OBS_KEY].length > acc ? val[OBS_KEY].length : acc;
        return acc;
    }, 0), [data]);

    useEffect(() => {
        const domElement = svgRef.current;

        const unitSuffix = yUnits ? ` (${yUnits})` : '';
        const yTitle = `${capitalize(featureName)}${unitSuffix}`;

        const xTitle = `${capitalize(obsType)}`;

        // Use a square-root term because the angle of the labels is 45 degrees (see below)
        // so the perpendicular distance to the bottom of the labels is proportional to the
        // square root of the length of the labels along the imaginary hypotenuse.
        // 30 is an estimate of the pixel size of a given character and seems to work well.
        const autoMarginBottom = marginBottom
            || 30 + Math.sqrt(maxCharactersForLabel / 2) * 30;

        const foregroundColor = (theme === 'dark' ? 'lightgray' : 'black');

        data.sort(function (a, b) {
            return ascending(a[FEATURE_KEY], b[FEATURE_KEY])
        });

        const svg = select(domElement);
        svg.selectAll('g').remove();
        svg
            .attr('width', width)
            .attr('height', height);

        const g = svg
            .append('g')
            .attr('width', width)
            .attr('height', height);

        const innerWidth = width - marginLeft;
        const innerHeight = height - autoMarginBottom;

        const xScale = scaleBand()
            .range([marginLeft, width - marginRight])
            .domain(data.map(d => d[OBS_KEY]))
            .padding(0.1);

        // For the y domain, use the yMin prop
        // to support a use case such as 'Aspect Ratio',
        // where the domain minimum should be 1 rather than 0.
        const yScale = scaleLinear()
            .domain([yMin, yMax])
            .range([innerHeight, marginTop])

        // Bar areas
        g
            .selectAll('bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d[OBS_KEY]))
            .attr('y', d => yScale(d[FEATURE_KEY]))
            .attr('width', xScale.bandwidth())
            .attr('height', d => innerHeight - yScale(d[FEATURE_KEY]))
            .style('fill', d => {
                if(d[OBS_KEY] === cellHighlight)
                    return "purple"
                if(setsSave.has(d[OBS_KEY])){
                    let color = setsSave.get(d[OBS_KEY]).color;
                    return rgbToHex(color)
                }
                return foregroundColor
            })
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                onBarSelect(d[OBS_KEY]);
            })
            .on('mouseover', (event, d) => {
                onBarHighlight(d[OBS_KEY]);
            })
            .on('mouseout', (event, d) => {
                onBarHighlight(null);
            });


        let axis = axisLeft(yScale);
        axis.tickFormat(function (d) {
            return Math.round(d * 10000000) + " µm";
        });
        // Y-axis ticks
        g
            .append('g')
            .attr('transform', `translate(${marginLeft},0)`)
            .call(axis)
            .selectAll('text')
            .style('font-size', '11px');

        // X-axis ticks
        g
            .append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .style('font-size', '14px')
            .call(axisBottom(xScale))
            .selectAll('text')
            .style('font-size', '11px')
            .attr('dx', '-6px')
            .attr('dy', '6px')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        // Y-axis title
        g
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('x', -innerHeight / 2)
            .attr('y', 15)
            .attr('transform', 'rotate(-90)')
            .text(yTitle)
            .style('font-size', '12px')
            .style('fill', foregroundColor);

        // X-axis title
        g
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('x', marginLeft + innerWidth / 2)
            .attr('y', height - 10)
            .text(xTitle)
            .style('font-size', '12px')
            .style('fill', foregroundColor);
    }, [width, height, data, marginLeft, marginBottom, colors,
        jitter, theme, yMin, marginTop, marginRight, featureType,
        featureValueType, yUnits, obsType,
        maxCharactersForLabel, yMax, featureName, onBarSelect, onBarHighlight,
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
