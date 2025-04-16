/**
 * Helper component to create a popover component with a list of buttons.
 * If the color, setColor, and palette props are provided then a color picker
 * will be rendered at the top of the button list.
 * @param {object} props
 * @param {object[]} props.menuConfig The list of button definition objects.
 * `{ title, subtitle, confirm, handler, handlerKey }`
 * @param {string} placement Where to place the popover (top, bottom, left, right).
 * @param {number[]} props.color The current color. Optional.
 * @param {string} props.palette The color palette for the color picker. Optional.
 * @param {boolean} props.setColor The handler to call when a color has been selected. Optional.
 * @param {Element|React.Component} props.children Children to render,
 * which will trigger the popover on click.
 */
export default function PopoverMenu(props: {
    menuConfig: object[];
}): JSX.Element;
//# sourceMappingURL=PopoverMenu.d.ts.map