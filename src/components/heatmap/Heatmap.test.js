
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import expect from 'expect';
import Heatmap from './Heatmap';
import { expressionMatrix, cellColors } from './Heatmap.test.fixtures';

configure({ adapter: new Adapter() });

describe('<Heatmap/>', () => {
  it('renders a DeckGL element', () => {
    const wrapper = mount(
      <Heatmap
        uuid="heatmap-0"
        theme="dark"
        width={100}
        height={100}
        expressionMatrix={expressionMatrix}
        cellColors={cellColors}
        transpose
        viewState={{ zoom: 0, target: [0, 0] }}
      />,
    );
    expect(wrapper.find('#deckgl-wrapper').length).toEqual(1);
  });
});
