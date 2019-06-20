import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import CellTooltipVertical from './CellTooltipVertical';

configure({ adapter: new Adapter() });

const fakeHoveredCellInfo = {
  cellId: '123',
  mappings: { xy: [1, 1], tsne: [2, 2] },
  uuid: 1,
  status: 'subcluster: Hippocampus; cluster: Excitatory neurons',
};

describe('CellTooltipVertical.js', () => {
  describe('<CellTooltipVertical />', () => {
    it('vertical highlight appears if uuid does not match', () => {
      const wrapper = shallow(<CellTooltipVertical
        hoveredCellInfo={fakeHoveredCellInfo}
        cellX={10}
        uuid={2}
      />);
      expect(wrapper.find('.cell-emphasis-vertical').length).toEqual(1);
    });

    it('does not appear if uuid does match', () => {
      const wrapper = shallow(<CellTooltipVertical
        hoveredCellInfo={fakeHoveredCellInfo}
        cellX={10}
        uuid={1}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });

    it('does not appear if cellX prop was not provided', () => {
      const wrapper = shallow(<CellTooltipVertical
        hoveredCellInfo={fakeHoveredCellInfo}
        uuid={1}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });
  });
});
