/**
 * A custom TreeNode component.
 * @extends {RcTreeNode} TreeNode from the rc-tree library.
 */
export default class TreeNode {
    /**
     * Override the main node text elements.
     */
    renderSelector: () => JSX.Element;
    /**
     * Render the LevelsButtons component if this node
     * is a collapsed level zero node.
     */
    renderLevels: () => JSX.Element | null;
    /**
     * Override the switcher element.
     */
    renderSwitcher: () => JSX.Element;
    /**
     * Override main render function,
     * to enable overriding the sub-render functions
     * for switcher, selector, etc.
     */
    render(): JSX.Element;
}
//# sourceMappingURL=TreeNode.d.ts.map