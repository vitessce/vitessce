/* eslint-disable */
import React from 'react';
import { Vega as VegaComponent } from 'react-vega';
import * as vl from 'vega-lite-api';
import * as Vega from 'vega';
import * as VegaLite from 'vega-lite';
import { Handler } from 'vega-tooltip';

const lightColor = '#fff';
const medColor = '#888';

const darkThemeConfig = {
    background: null,
  
    title: { color: lightColor },
  
    style: {
      'guide-label': {
        fill: lightColor,
      },
      'guide-title': {
        fill: lightColor,
      },
    },
  
    axis: {
      domainColor: lightColor,
      gridColor: medColor,
      tickColor: lightColor,
    },
};

vl.register(Vega, VegaLite);

function handleHover(...args) {
    console.log(args);
}
  
const signalListeners = { sel1_tuple: handleHover };

const highlight = vl.selectSingle().resolve('highlight')
    .on('mouseover');

const vlspec = {
    ...vl
        .markBar()
        .encode(
            vl.x().fieldN('a'),
            vl.y().fieldQ('b'),
            vl.color().if(highlight, vl.value("red")).value("pink"),
            vl.tooltip().fieldQ('b')
        )
        .select(
            highlight
        )
        .width(300)
        .height(200)
        .config(darkThemeConfig)
        .autosize('fit')
        .toJSON(),
    data: { name: 'table' },
};

const vspec = vl.vegalite.compile(vlspec).spec;

export default function VegaPlot(props) {
    const barData = {
        table: [
          { a: 'A', b: 28 },
          { a: 'B', b: 55 },
          { a: 'C', b: 43 },
          { a: 'D', b: 91 },
          { a: 'E', b: 81 },
          { a: 'F', b: 53 },
          { a: 'G', b: 19 },
          { a: 'H', b: 87 },
          { a: 'I', b: 52 },
        ],
    };
    return (
        <VegaComponent
            spec={vspec}
            data={barData}
            signalListeners={signalListeners}
            tooltip={new Handler().call}
            onNewView={(view) => {
                console.log(view.getState().signals);
                view
                    .signal(
                        "sel1_tuple", 
                        {"unit":"","fields":[{"type":"E","field":"_vgsid_"}],"values":[3]}
                    )
                    .runAsync();
            }}
            renderer="canvas"
            scaleFactor={3}
        />
    );
};