import expect from 'expect';
import {
  encodeConfAsURLParams,
  decodeURLParamsToConf,
} from './export-utils';

const fakeConfig = {
  version: '0.1.0',
  public: false,
  layers: [
    {
      name: 'cells',
      type: 'CELLS',
      fileType: 'cells.json',
      url: 'http://example.com/cells.json',
    },
  ],
  name: 'Just scatterplot',
  staticLayout: [
    {
      component: 'scatterplot',
      props: {
        mapping: 't-SNE',
        view: {
          zoom: 0.75,
          target: [0, 0, 0],
        },
      },
      x: 0,
      y: 0,
      w: 12,
      h: 2,
    },
  ],
};

describe('src/app/export-utils.js', () => {
  describe('encodeConfAsURLParams', () => {
    it('encodes a view config for a URL', () => {
      const urlParams1 = encodeConfAsURLParams({});
      expect(urlParams1).toEqual('vitessce_conf=N4XyA&version=0.0.1');

      const urlParams2 = encodeConfAsURLParams(fakeConfig);
      expect(urlParams2).toEqual('vitessce_conf=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA&version=0.0.1');
    });

    it('decodes a view config for a URL', () => {
      const viewConfig1 = decodeURLParamsToConf('vitessce_conf=N4XyA&version=0.0.1');
      expect(viewConfig1).toEqual({});

      const viewConfig2 = decodeURLParamsToConf('vitessce_conf=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA&version=0.0.1');
      expect(viewConfig2).toEqual(fakeConfig);
    });
  });
});
