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
      expect(urlParams1).toEqual('version=0.0.1#vitessce_conf=N4XyA');

      const urlParams2 = encodeConfAsURLParams(fakeConfig);
      expect(urlParams2).toEqual('version=0.0.1#vitessce_conf=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA');
    });

    it('decodes a view config for a URL', () => {
      const viewConfig1 = decodeURLParamsToConf('version=0.0.1#vitessce_conf=N4XyA');
      expect(viewConfig1).toEqual({});

      const viewConfig2 = decodeURLParamsToConf('version=0.0.1#vitessce_conf=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA');
      expect(viewConfig2).toEqual(fakeConfig);
    });
  });
  describe('encodeConfAsURLParams with custom param', () => {
    it('encodes a view config for a URL', () => {
      const urlParams1 = encodeConfAsURLParams({}, 'foo');
      expect(urlParams1).toEqual('version=0.0.1#foo=N4XyA');

      const urlParams2 = encodeConfAsURLParams(fakeConfig, 'foo');
      expect(urlParams2).toEqual('version=0.0.1#foo=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA');
    });

    it('decodes a view config for a URL', () => {
      const viewConfig1 = decodeURLParamsToConf('version=0.0.1#foo=N4XyA', 'foo');
      expect(viewConfig1).toEqual({});

      const viewConfig2 = decodeURLParamsToConf('version=0.0.1#foo=N4IgbgpgTgzglgewHYgFwgAwDoCMWMgA0IADgK4BGANnAMZoBmAhlTBMVUwJ7QxoDaoJEwC2ENCFoQqrIiAAuXEuPQBhAKIAZTQGU5DOFQgAVJSsnTWWAFYxkcslCoSAFvPklUAei8QAHqIkRli0CCJeUjIwNnYoAL4AusTCYhIAUmQw8gAEMLRM7tBBCPJyWQV0mtwIZKWogpJhJMgQSHUgeQXyRVQlciRQCCR8qKAiTCQkcEgA5hLyALQ6AHLqcmBwEADuaKAAXghhaNgA7ACsxPJMUDMQdfwYhI8YCXFxxH7HxFxfIDuoOAATMQXGhAYk4kA', 'foo');
      expect(viewConfig2).toEqual(fakeConfig);
    });
  });
});
