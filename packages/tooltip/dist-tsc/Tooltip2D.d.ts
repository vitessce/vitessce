/**
 * A tooltip component that also incorporates a crosshair element.
 * @param {object} props
 * @param {string} props.parentUuid A unique identifier corresponding to the plot
 * with which this scatterplot is associated.
 * @param {string} props.sourceUuid A unique identifier corresponding to the plot
 * from which this tooltip originated.
 * @param {number} props.x The x coordinate for the tooltip.
 * @param {number} props.y The y coordinate for the tooltip.
 * @param {number} props.parentWidth The width of the parent plot container element.
 * @param {number} props.parentHeight The height of the parent plot container element.
 * @param {React.Component} props.children The tooltip contents as a react component.
 */
export default function Tooltip2D(props: {
    parentUuid: string;
    sourceUuid: string;
    x: number;
    y: number;
    parentWidth: number;
    parentHeight: number;
    children: React.Component;
}): JSX.Element | null;
//# sourceMappingURL=Tooltip2D.d.ts.map