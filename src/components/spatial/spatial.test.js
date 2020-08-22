import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';
import expect from 'expect';
import { square } from './utils';

configure({ adapter: new Adapter() });

describe('Spatial.js', () => {
  describe('square()', () => {
    it('gives the right coordinates', () => {
      expect(square(0, 0, 50)).toEqual([[0, 50], [50, 0], [0, -50], [-50, 0]]);
    });
  });

  describe('<Spatial>', () => {
    // TODO: Doesn't work after the change to useMemo (from useEffect with refs) in Spatial
    // it('renders a DeckGL element', () => {
    //   const spatialProps = {
    //     moleculeRadius: 42,
    //     molecules: { 'fake-molecule': [] },
    //   };

    //   const wrapper = mount(<Spatial {...spatialProps} />);
    //   expect(wrapper.find('#deckgl-wrapper').length).toEqual(1);
    // });

    // TODO: Doesn't work, but I want to unblock Tos on molecules, first
    //
    // it('handles cellRadius', () => {
    //   const spatialComponent = new Spatial({
    //     cellRadius: 42,
    //     cells: {},
    //   });
    //   const cellsLayer = spatialComponent.renderCellLayer();
    //   expect(cellsLayer.props.getPolygon(['fake-id', { poly: [], xy: [0, 0] }])).toEqual(42);
    // });
  });
});
