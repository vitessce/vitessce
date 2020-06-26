import expect from 'expect';
import { toRgbUIString } from './ChannelController';

const GREY = [220, 220, 220];

describe('layer-controller/ChannelController.js', () => {
  describe('toRgbUIString()', () => {
    it('Maps color value to itself when colormap off and not white with dark theme', () => {
      expect(toRgbUIString(false, [200, 200, 200], 'dark')).toEqual(`rgb(${[200, 200, 200]})`);
    });
    it('Maps color value to grey when colormap on with dark theme', () => {
      expect(toRgbUIString(true, [200, 200, 200], 'dark')).toEqual(`rgb(${GREY})`);
    });
    it('Maps color value to grey when colormap on with light theme', () => {
      expect(toRgbUIString(true, [200, 200, 200], 'light')).toEqual(`rgb(${GREY})`);
    });
    it('Maps color value to grey when colormap off and white with light theme', () => {
      expect(toRgbUIString(false, [255, 255, 255], 'light')).toEqual(`rgb(${GREY})`);
    });
    it('Maps color value to grey when colormap off and white with light theme', () => {
      expect(toRgbUIString(false, [200, 200, 200], 'light')).toEqual(`rgb(${[200, 200, 200]})`);
    });
  });
});
