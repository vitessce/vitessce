import { describe, it, expect } from 'vitest';
import { parseBiomarkerParam, serializeBiomarkerParam } from './url-params.js';

describe('feature URL param', () => {
  it('parses and serializes genes and pathways', () => {
    expect(parseBiomarkerParam('gene:UMOD')).toEqual({ nodeType: 'gene', label: 'UMOD' });
    const pathway = { nodeType: 'pathway', label: 'Cell Cycle R-HSA-1640170' };
    expect(parseBiomarkerParam(serializeBiomarkerParam(pathway))).toEqual(pathway);
  });

  it('splits at the first colon, since labels may contain colons', () => {
    expect(parseBiomarkerParam('pathway:A: B')).toEqual({ nodeType: 'pathway', label: 'A: B' });
  });

  it('returns null for malformed values', () => {
    expect(parseBiomarkerParam('UMOD')).toBeNull();
    expect(parseBiomarkerParam(':UMOD')).toBeNull();
    expect(parseBiomarkerParam('gene:')).toBeNull();
  });
});
