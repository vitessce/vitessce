import expect from 'expect';
import AbstractSelectableComponent from './AbstractSelectableComponent';

describe('AbstractSelectableComponent', () => {
  describe('getDragRectangle()', () => {
    it('gives the right coordinates', () => {
      const component = new AbstractSelectableComponent();
      component.dragStartCoordinate = [5, 10];
      const dragEvent = {
        coordinate: [10, 20],
      };
      expect(component.getDragRectangle(dragEvent)).toEqual({
        xMax: 10,
        xMin: 5,
        yMax: 20,
        yMin: 10,
      });
    });
  });

  describe('onDragStart()', () => {
    it('gives the right coordinates', () => {
      const component = new AbstractSelectableComponent();
      component.componentName = 'placeholder';
      component.dragStartCoordinate = [5, 10];
      const dragEvent = {
        coordinate: [10, 20],
      };
      expect(component.getDragRectangle(dragEvent)).toEqual({
        xMax: 10,
        xMin: 5,
        yMax: 20,
        yMin: 10,
      });
    });
  });

  describe('renderSelectionRectangleLayers()', () => {
    it('gives the right layers', () => {
      const component = new AbstractSelectableComponent();
      component.componentName = 'placeholder';
      component.dragStartCoordinate = [0, 0];
      component.state = {
        selectionRectangle: {
          xMax: 10,
          xMin: 0,
          yMax: 10,
          yMin: 0,
        },
      };
      const layers = component.renderSelectionRectangleLayers();
      expect(layers.length).toEqual(1);
      expect(layers[0].constructor.name).toEqual('PolygonLayer');
    });
  });
});
