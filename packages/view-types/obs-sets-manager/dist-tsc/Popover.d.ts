/**
 * This is a wrapper around the HelpTooltip component, to style it as a popover,
 * and change the trigger to "click" rather than "hover".
 * @param {*} props Props are passed through to the HelpTooltip component.
 */
declare function Popover(props: any): JSX.Element;
declare namespace Popover {
    namespace defaultProps {
        let overlayClassName: string;
        let placement: string;
        let trigger: string;
        let mouseEnterDelay: number;
        let mouseLeaveDelay: number;
    }
}
export default Popover;
//# sourceMappingURL=Popover.d.ts.map