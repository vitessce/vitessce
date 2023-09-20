import { describe, it, expect } from 'vitest';
import { ViewType } from '@vitessce/constants-internal';
import { arrayToString, ViewTypesToText, getAltText } from './generate-alt-text.js';

describe('Tests for generating an alt text from the vitessce config', () => {
  describe('Tests for arrayToString', () => {
    it('should return empty string for empty array', () => {
      const arr = [];
      const str = arrayToString(arr);
      expect(str).toEqual('');
    });

    it('should return the element if the araay only has one element', () => {
      const arr = ['one'];
      const str = arrayToString(arr);
      expect(str).toEqual('one');
    });

    it('should return the elements concatenated with "and" when the array has two elements', () => {
      const arr = ['one', 'two'];
      const str = arrayToString(arr);
      expect(str).toEqual('one and two');
    });

    it('should return the elements concatenated with ", " and the last two elements with "and" when the array has more than two elements', () => {
      const arr = ['one', 'two', 'three', 'four'];
      const str = arrayToString(arr);
      expect(str).toEqual('one, two, three and four');
    });
  });

  describe('Tests for (const) ViewTypesToText', () => {
    it('should have a natural language mapping for every defined viewtype', () => {
      expect(ViewTypesToText.length).toEqual(ViewType.length);
    });
  });

  describe('Tests for getAltTest', () => {
    const config = {
      coordinationSpace: {},
      datasets: {},
      description: 'Spatial organization of the somatosensory cortex revealed by osmFISH',
      initStrategy: 'auto',
      layout: [
        { component: 'description', props: { description: 'Codeluppi et al., Nature Methods 2018: Spatial organization of the somatosensory cortex revealed by osmFISH' }, x: 0, y: 0, w: 2 },
        { component: 'layerController', x: 0, y: 1, w: 2, h: 4 },
        { component: 'status', x: 0, y: 5, w: 2, h: 1 },
        { component: 'spatial', props: { channelNamesVisible: true }, x: 2, y: 0, w: 4 },
        { component: 'featureList', x: 9, y: 0, w: 3, h: 2 },
        { component: 'obsSets', x: 9, y: 3, w: 3, h: 2 },
        { component: 'heatmap', props: { transpose: true }, x: 2, y: 4, w: 5 },
        { component: 'obsSetFeatureValueDistribution', x: 7, y: 4, w: 5, h: 2 },
        { component: 'scatterplot', x: 6, y: 0, w: 3, h: 2 },
        { component: 'scatterplot', x: 6, y: 2, w: 3, h: 2 },
      ],
      name: 'Codeluppi et al., Nature Methods 2018',
      uid: 'A',
      version: '1.0.16',
    };
    const altText = getAltText(config);
    it('should return a string', () => {
      expect(typeof altText).toEqual('string');
    });
    it('should contain the number of views', () => {
      const hasNViews = altText.includes('10');
      expect(hasNViews).toEqual(true);
    });
    it('should contain mappings', () => {
      const hasHeatmap = altText.includes('heatmap') && altText.includes('spatial') && altText.includes('description') && altText.includes('scatterplot');
      expect(hasHeatmap).toEqual(true);
    });
  });
});
