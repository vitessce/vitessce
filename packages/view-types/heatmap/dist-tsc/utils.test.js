import { describe, it, expect } from 'vitest';
import { mouseToHeatmapPosition, heatmapToMousePosition } from './utils.js';
describe('heatmap tooltip utils', () => {
    it('transforms mouse coordinates to row and column indices when zoomed out', () => {
        const mouseX = 35;
        const mouseY = 78;
        const [colI, rowI] = mouseToHeatmapPosition(mouseX, mouseY, {
            offsetLeft: 10,
            offsetTop: 10,
            targetX: 0,
            targetY: 0,
            scaleFactor: 1,
            matrixWidth: 100,
            matrixHeight: 100,
            numRows: 5,
            numCols: 4,
        });
        expect(colI).toEqual(1);
        expect(rowI).toEqual(3);
    });
    it('transforms mouse coordinates to row and column indices when zoomed in', () => {
        const mouseX = 35;
        const mouseY = 78;
        const [colI, rowI] = mouseToHeatmapPosition(mouseX, mouseY, {
            offsetLeft: 10,
            offsetTop: 10,
            targetX: 21,
            targetY: -11,
            scaleFactor: 4,
            matrixWidth: 100,
            matrixHeight: 100,
            numRows: 5,
            numCols: 4,
        });
        expect(colI).toEqual(2);
        expect(rowI).toEqual(2);
    });
    it('transforms row and column indices when zoomed out', () => {
        const colI = 1;
        const rowI = 3;
        const [mouseX, mouseY] = heatmapToMousePosition(colI, rowI, {
            offsetLeft: 10,
            offsetTop: 10,
            targetX: 0,
            targetY: 0,
            scaleFactor: 1,
            matrixWidth: 100,
            matrixHeight: 100,
            numRows: 5,
            numCols: 4,
        });
        expect(mouseX).toEqual(47.5);
        expect(mouseY).toEqual(80);
    });
    it('transforms row and column indices when zoomed in', () => {
        const colI = 2;
        const rowI = 2;
        const [mouseX, mouseY] = heatmapToMousePosition(colI, rowI, {
            offsetLeft: 10,
            offsetTop: 10,
            targetX: 21,
            targetY: -11,
            scaleFactor: 4,
            matrixWidth: 100,
            matrixHeight: 100,
            numRows: 5,
            numCols: 4,
        });
        expect(mouseX).toEqual(26);
        expect(mouseY).toEqual(104);
    });
});
