/**
 * A force function to be used with d3.forceSimulation.
 * This has been adapted for use here, with comments explaining each part.
 * Reference: https://bl.ocks.org/cmgiven/547658968d365bcc324f3e62e175709b
 */
export function forceCollideRects(): {
    (): void;
    initialize(v: any): void;
    iterations(...v: any[]): number | any;
    strength(...v: any[]): number | any;
    size(...v: any[]): () => any;
};
//# sourceMappingURL=force-collide-rects.d.ts.map