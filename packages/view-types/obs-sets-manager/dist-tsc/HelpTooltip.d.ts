/**
 * This is a small wrapper around the Tooltip component from the rc-tooltip library,
 * which is required to be able to apply theme styles to the tooltip.
 * The default `getTooltipContainer` function used by rc-tooltip
 * just returns `document.body` (see https://github.com/react-component/tooltip#props),
 * We want theme styles to be applied relative to the closest `.vitessce-container`
 * ancestor element.
 * https://github.com/vitessce/vitessce/pull/494#discussion_r395957914
 * @param {object} props Props are passed through to the <RcTooltip/> from the library.
 */
declare function HelpTooltip(props: object): JSX.Element;
declare namespace HelpTooltip {
    namespace defaultProps {
        let overlayClassName: string;
        let placement: string;
        let trigger: string;
        let mouseEnterDelay: number;
        let mouseLeaveDelay: number;
        let destroyTooltipOnHide: boolean;
    }
}
export default HelpTooltip;
//# sourceMappingURL=HelpTooltip.d.ts.map