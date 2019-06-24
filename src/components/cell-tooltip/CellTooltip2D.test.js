import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import CellTooltip2D from './CellTooltip2D';

configure({ adapter: new Adapter() });

const fakeHoveredCellInfo = {
  cellId: '123',
  mappings: { xy: [1, 1], tsne: [2, 2] },
  uuid: 1,
  status: 'subcluster: Hippocampus; cluster: Excitatory neurons',
};

const makeFakeViewInfo = (x, y) => ({
  width: 10,
  height: 10,
  viewport: {
    project() {
      return [x, y];
    },
  },
});

describe('CellTooltip2D.js', () => {
  describe('<CellTooltip2D />', () => {
    it('crosshair appears if projected coordinates are within boundaries and uuid does not match', () => {
      const wrapper = shallow(<CellTooltip2D
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={makeFakeViewInfo(5, 5)}
        uuid={2}
      />);
      expect(wrapper.find('.cell-emphasis-crosshair').length).toEqual(2);
    });

    it('does not appear if projected coordinates are within boundaries and uuid does match', () => {
      const wrapper = shallow(<CellTooltip2D
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={makeFakeViewInfo(5, 5)}
        uuid={1}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });

    it('does not appear if projected coordinates are outside boundaries, below', () => {
      const wrapper = shallow(<CellTooltip2D
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={makeFakeViewInfo(0, 11)}
        uuid={2}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });

    it('does not appear if projected coordinates are outside boundaries, above', () => {
      const wrapper = shallow(<CellTooltip2D
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={makeFakeViewInfo(0, -1)}
        uuid={2}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });

    it('does not appear if projected coordinates are outside boundaries, left', () => {
      const wrapper = shallow(<CellTooltip2D
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={makeFakeViewInfo(-1, 0)}
        uuid={2}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });

    it('does not appear if projected coordinates are outside boundaries, right', () => {
      const wrapper = shallow(<CellTooltip2D
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={makeFakeViewInfo(11, 0)}
        uuid={2}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });
  });
});
