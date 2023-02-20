import React, { useEffect, useRef, useState } from 'react';
import * as Plot from "@observablehq/plot";
import seedrandom from 'seedrandom';
import { max, min, quantile, extent, bin as d3_bin, group as d3_group } from 'd3-array';

const upperQuartile = d => quantile(d, 0.75);
const lowerQuartile = d => quantile(d, 0.25);
const iqr = d => upperQuartile(d) - lowerQuartile(d);
const upperWhisker = d => Math.min(max(d), upperQuartile(d) + 1.5 * iqr(d));
const lowerWhisker = d => Math.max(min(d), lowerQuartile(d) - 1.5 * iqr(d));

const groupBy = "group";
const data2 = [
  {"species":"Adelie","island":"Torgersen","culmen_length_mm":39.1,"culmen_depth_mm":18.7,"flipper_length_mm":181,"body_mass_g":3750,"sex":"MALE"},
  {"species":"Adelie","island":"Torgersen","culmen_length_mm":39.5,"culmen_depth_mm":17.4,"flipper_length_mm":186,"body_mass_g":3800,"sex":"FEMALE"},
  {"species":"Adelie","island":"Torgersen","culmen_length_mm":40.3,"culmen_depth_mm":18,"flipper_length_mm":195,"body_mass_g":3250,"sex":"FEMALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":36.7,"culmen_depth_mm":19.3,"flipper_length_mm":193,"body_mass_g":3450,"sex":"FEMALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":39.3,"culmen_depth_mm":20.6,"flipper_length_mm":190,"body_mass_g":3650,"sex":"MALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":38.9,"culmen_depth_mm":17.8,"flipper_length_mm":181,"body_mass_g":3625,"sex":"FEMALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":39.2,"culmen_depth_mm":19.6,"flipper_length_mm":195,"body_mass_g":4675,"sex":"MALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":34.1,"culmen_depth_mm":18.1,"flipper_length_mm":193,"body_mass_g":3475,"sex":null},{"species":"Adelie","island":"Torgersen","culmen_length_mm":42,"culmen_depth_mm":20.2,"flipper_length_mm":190,"body_mass_g":4250,"sex":null},{"species":"Adelie","island":"Torgersen","culmen_length_mm":37.8,"culmen_depth_mm":17.1,"flipper_length_mm":186,"body_mass_g":3300,"sex":null},{"species":"Adelie","island":"Torgersen","culmen_length_mm":37.8,"culmen_depth_mm":17.3,"flipper_length_mm":180,"body_mass_g":3700,"sex":null},{"species":"Adelie","island":"Torgersen","culmen_length_mm":41.1,"culmen_depth_mm":17.6,"flipper_length_mm":182,"body_mass_g":3200,"sex":"FEMALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":38.6,"culmen_depth_mm":21.2,"flipper_length_mm":191,"body_mass_g":3800,"sex":"MALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":34.6,"culmen_depth_mm":21.1,"flipper_length_mm":198,"body_mass_g":4400,"sex":"MALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":36.6,"culmen_depth_mm":17.8,"flipper_length_mm":185,"body_mass_g":3700,"sex":"FEMALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":38.7,"culmen_depth_mm":19,"flipper_length_mm":195,"body_mass_g":3450,"sex":"FEMALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":42.5,"culmen_depth_mm":20.7,"flipper_length_mm":197,"body_mass_g":4500,"sex":"MALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":34.4,"culmen_depth_mm":18.4,"flipper_length_mm":184,"body_mass_g":3325,"sex":"FEMALE"},{"species":"Adelie","island":"Torgersen","culmen_length_mm":46,"culmen_depth_mm":21.5,"flipper_length_mm":194,"body_mass_g":4200,"sex":"MALE"},{"species":"Adelie","island":"Biscoe","culmen_length_mm":37.8,"culmen_depth_mm":18.3,"flipper_length_mm":174,"body_mass_g":3400,"sex":"FEMALE"}];

export default function StratifiedFeaturePlot(props) {
  const {
    data,
    theme,
    width,
    height,
    marginRight = 90,
    marginBottom = 120,
    keyLength = 36,
    obsType,
  } = props;

  const headerRef = useRef();

  useEffect(() => {
    if (data === undefined) return;
    const dimension = "value";
    const showBoxPlot = true;
    const seed = 1;
    const thresholds = 30;
    const boxPlotSize = 15;
    const boxPlotOffset = 250;
    const rawDataSize = 15;
    const rawDataOffset = 10;

    const bins = d3_bin()
      .domain(extent(data, d => d[dimension]))
      .thresholds(thresholds);

    const maxTotal = max(
      Array.from(
        d3_group(data, d => d[groupBy])
        .values()
      )
      .flatMap(g => bins(g.map(d => d[dimension])))
      .map(bin => bin.length)
    );

    const jitter = () => {
      const rng = seedrandom(seed);
      return data.map(() => -(rng() * rawDataSize + rawDataOffset) * maxTotal / 100);
    };
    
    

    const rawDataY = Plot.dot(
      data,
      {
        y: dimension,
        x: jitter(),
        fill: groupBy,
        stroke: null,
        r: 1.5,
      },
    );

    const halfViolinY = Plot.areaX(
      data,
      Plot.binY(
        {
          x: 'count',
        },
        {
          y: dimension,
          fill: groupBy,
          thresholds: thresholds,
          curve: 'basis',
        },
      ),
    );

    const boxPlotY = [
      Plot.ruleY(
        data,
        Plot.groupZ(
          {
            y: 'median',
          },
          {
            y: dimension,
            x1: -boxPlotOffset - boxPlotSize * maxTotal / 100 / 2,
            x2: -boxPlotOffset + boxPlotSize * maxTotal / 100 / 2,
            strokeWidth: 2,
            stroke: '#333333',
          },
        ),
      ),
      Plot.rectY(
        data,
        Plot.groupZ(
          {
            y1: lowerQuartile,
            y2: upperQuartile,
          },
          {
            y: dimension,
            x1: -boxPlotOffset - boxPlotSize * maxTotal / 100 / 2,
            x2: -boxPlotOffset + boxPlotSize * maxTotal / 100 / 2,
            stroke: '#333333',
          },
        ),
      ),
      Plot.ruleX(
        data,
        Plot.groupX(
          {
            y1: lowerWhisker,
            y2: lowerQuartile,
          },
          {
            y: dimension,
            x: -boxPlotOffset,
            stroke: '#333333',
          },
        ),
      ),
      Plot.ruleX(
        data,
        Plot.groupX(
          {
            y1: upperQuartile,
            y2: upperWhisker,
          },
          {
            y: dimension,
            x: -boxPlotOffset,
            stroke: '#333333',
          },
        ),
      ),
    ];

    const raincloudY = {
      marks: [
        Plot.ruleY([Math.floor(min(data.map(d => d[dimension])))]),
        halfViolinY,
        rawDataY,
        showBoxPlot ? boxPlotY : [],
      ],
      facet: {
        data: data,
        x: groupBy,
        marginBottom: 40,
      },
      x: {
        ticks: 2,
        tickFormat: d => d < 0 ? '' : d,
      },
      marginTop: 40,
      marginBottom: 60,
      marginRight: 60,
      width: 380,
      height: 440,
    };

    const chart = Plot.plot(raincloudY);
    headerRef.current.append(chart);

    return () => chart.remove();
  }, [data]);

  return (
    <div ref={headerRef} />
  );
}
