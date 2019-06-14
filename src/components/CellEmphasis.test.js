import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import expect from 'expect';
import CellEmphasis from './CellEmphasis';

configure({ adapter: new Adapter() });

const fakeHoveredCellInfo = {
  cellId: '123',
  mappings: { xy: [1, 1], tsne: [2, 2] },
  uuid: 1,
  status: 'subcluster: Hippocampus; cluster: Excitatory neurons',
};

const fakeViewInfoInside = {
  width: 10,
  height: 10,
  viewport: {
    project() {
      return [5, 5];
    },
  },
};

const fakeViewInfoOutsideAbove = {
  width: 10,
  height: 10,
  viewport: {
    project() {
      return [0, -1];
    },
  },
};

const fakeViewInfoOutsideBelow = {
  width: 10,
  height: 10,
  viewport: {
    project() {
      return [0, 11];
    },
  },
};

const fakeViewInfoOutsideLeft = {
  width: 10,
  height: 10,
  viewport: {
    project() {
      return [-1, 0];
    },
  },
};

const fakeViewInfoOutsideRight = {
  width: 10,
  height: 10,
  viewport: {
    project() {
      return [11, 0];
    },
  },
};

describe('CellEmphasis.js', () => {
  describe('<CellEmphasis />', () => {
    it('crosshair appears if projected coordinates are within boundaries and uuid does not match', () => {
      const wrapper = shallow(<CellEmphasis
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={fakeViewInfoInside}
        uuid={2}
      />);
      expect(wrapper.find('div').children().length).toEqual(2);
    });

    it('tooltip appears if projected coordinates are within boundaries and uuid does match', () => {
      const wrapper = shallow(<CellEmphasis
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={fakeViewInfoInside}
        uuid={1}
      />);
      expect(wrapper.find('div').children().length).toEqual(1);
    });

    it('does not appear if projected coordinates are outside boundaries, below', () => {
      const wrapper = shallow(<CellEmphasis
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={fakeViewInfoOutsideBelow}
        uuid={2}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });

    it('does not appear if projected coordinates are outside boundaries, above', () => {
      const wrapper = shallow(<CellEmphasis
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={fakeViewInfoOutsideAbove}
        uuid={2}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });

    it('does not appear if projected coordinates are outside boundaries, left', () => {
      const wrapper = shallow(<CellEmphasis
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={fakeViewInfoOutsideLeft}
        uuid={2}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });

    it('does not appear if projected coordinates are outside boundaries, right', () => {
      const wrapper = shallow(<CellEmphasis
        hoveredCellInfo={fakeHoveredCellInfo}
        mapping="xy"
        viewInfo={fakeViewInfoOutsideRight}
        uuid={2}
      />);
      expect(wrapper.find('div').length).toEqual(0);
    });
  });
});
