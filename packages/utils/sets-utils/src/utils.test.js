import { describe, it, expect } from 'vitest';
import { getObsInfoFromDataWithinRange } from './utils.js';


describe('getObsInfoFromDataWithinRange', () => {
  it('should return the correct obs info with no gene defined', () => {
    const data = [
      { value: 107.84313725490196, gene: null, cellId: '778' },
      { value: 75.29411764705883, gene: null, cellId: '1409' },
      { value: 111.76470588235294, gene: null, cellId: '3642' },
      { value: 34.11764705882353, gene: null, cellId: '1302' },
      { value: 75.68627450980392, gene: null, cellId: '1285' },
    ];
    const range = [0, 100];
    const expectedObsInfo = ['1409', '1302', '1285'];

    const actualObsInfo = getObsInfoFromDataWithinRange(range, data);

    actualObsInfo.forEach((item) => {
      expect(expectedObsInfo).toContain(item);
    });

    expectedObsInfo.forEach((item) => {
      expect(actualObsInfo).toContain(item);
    });
  });

  it('should return the correct obs info when gene is defined', () => {
    const data = [
      { value: 107.84313725490196, gene: 'ABC', cellId: '778' },
      { value: 75.29411764705883, gene: 'ABC', cellId: '1409' },
      { value: 111.76470588235294, gene: 'ABC', cellId: '3642' },
      { value: 34.11764705882353, gene: 'ABC', cellId: '1302' },
      { value: 75.68627450980392, gene: 'ABC', cellId: '1285' },
    ];
    const range = [0, 100];
    const expectedObsInfo = ['1409', '1302', '1285'];

    const actualObsInfo = getObsInfoFromDataWithinRange(range, data);

    actualObsInfo.forEach((item) => {
      expect(expectedObsInfo).toContain(item);
    });

    expectedObsInfo.forEach((item) => {
      expect(actualObsInfo).toContain(item);
    });
  });
});
