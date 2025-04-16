import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable max-len */
/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import clsx from 'clsx';
import { TreeNode as RcTreeNode } from 'rc-tree';
import { getDataAndAria } from 'rc-tree/es/util.js';
import { range, isEqual } from 'lodash-es';
import { callbackOnKeyPress, colorArrayToString, getLevelTooltipText } from '@vitessce/sets-utils';
import { MenuSVG } from '@vitessce/icons';
import { getDefaultColor } from '@vitessce/utils';
import HelpTooltip from './HelpTooltip.js';
import PopoverMenu from './PopoverMenu.js';
import { useStyles } from './styles.js';
/**
 * Construct a `menuConfig` array for the PopoverMenu component.
 * @param {object} props The props for the TreeNode component.
 * @returns {object[]} An array of menu items to pass to PopoverMenu.
 */
function makeNodeViewMenuConfig(props) {
    const { path, level, height, onCheckNode, onNodeRemove, onNodeSetIsEditing, onExportLevelZeroNodeJSON, onExportLevelZeroNodeTabular, onExportSetJSON, checkable, editable, exportable, checked, } = props;
    return [
        ...(editable ? [
            {
                title: 'Rename',
                handler: () => { onNodeSetIsEditing(path, true); },
                handlerKey: 'r',
            },
            {
                title: 'Delete',
                confirm: true,
                handler: () => { onNodeRemove(path); },
                handlerKey: 'd',
            },
        ] : []),
        ...(level === 0 && exportable ? [
            {
                title: 'Export hierarchy',
                subtitle: '(to JSON file)',
                handler: () => { onExportLevelZeroNodeJSON(path); },
                handlerKey: 'j',
            },
            ...(height <= 1 ? [
                {
                    title: 'Export hierarchy',
                    subtitle: '(to CSV file)',
                    handler: () => { onExportLevelZeroNodeTabular(path); },
                    handlerKey: 't',
                },
            ] : []),
        ] : []),
        ...(level > 0 ? [
            ...(checkable ? [
                {
                    title: (checked ? 'Uncheck' : 'Check'),
                    handler: () => { onCheckNode(path, !checked); },
                    handlerKey: 's',
                },
            ] : []),
            ...(exportable ? [
                {
                    title: 'Export set',
                    subtitle: '(to JSON file)',
                    handler: () => { onExportSetJSON(path); },
                    handlerKey: 'e',
                },
            ] : []),
        ] : []),
    ];
}
/**
 * The "static" node component to render when the user is not renaming.
 * @param {object} props The props for the TreeNode component.
 */
function NamedSetNodeStatic(props) {
    const { title, path, nodeKey, level, height, color, checkbox, isChecking, isLeaf, onNodeSetColor, onNodeView, expanded, onCheckLevel, checkedLevelPath, checkedLevelIndex, disableTooltip, size, datatype, editable, theme, } = props;
    const shouldCheckNextLevel = (level === 0 && !expanded);
    const nextLevelToCheck = ((checkedLevelIndex && isEqual(path, checkedLevelPath) && checkedLevelIndex < height)
        ? checkedLevelIndex + 1
        : 1);
    const numberFormatter = new Intl.NumberFormat('en-US');
    const niceSize = numberFormatter.format(size);
    let tooltipText;
    if (shouldCheckNextLevel) {
        tooltipText = getLevelTooltipText(nextLevelToCheck);
    }
    else if (isLeaf || !expanded) {
        tooltipText = `Color individual set (${niceSize} ${datatype}${(size === 1 ? '' : 's')})`;
    }
    else {
        tooltipText = 'Color by expanded descendants';
    }
    // If this is a level zero node and is _not_ expanded, then upon click,
    // the behavior should be to color by the first or next cluster level.
    // If this is a level zero node and _is_ expanded, or if any other node,
    // click should trigger onNodeView.
    const onClick = (level === 0 && !expanded
        ? () => onCheckLevel(nodeKey, nextLevelToCheck)
        : () => onNodeView(path));
    const tooltipProps = (disableTooltip ? { visible: false } : {});
    const popoverMenuConfig = makeNodeViewMenuConfig(props);
    const classes = useStyles();
    return (_jsxs("span", { children: [_jsx(HelpTooltip, { title: tooltipText, ...tooltipProps, children: _jsx("button", { type: "button", onClick: onClick, onKeyPress: e => callbackOnKeyPress(e, 'v', () => onNodeView(path)), className: classes.titleButton, children: title }) }), popoverMenuConfig.length > 0 ? (_jsx(PopoverMenu, { menuConfig: makeNodeViewMenuConfig(props), color: level > 0 && editable ? (color || getDefaultColor(theme)) : null, setColor: c => onNodeSetColor(path, c), children: _jsx(MenuSVG, { className: classes.nodeMenuIcon }) })) : null, level > 0 && isChecking ? checkbox : null, level > 0 && (_jsx("span", { className: classes.nodeSizeLabel, children: niceSize }))] }));
}
/**
 * The "editing" node component to render when the user is renaming,
 * containing a text input field and a save button.
 * @param {object} props The props for the TreeNode component.
 */
function NamedSetNodeEditing(props) {
    const { title, path, onNodeSetName, onNodeCheckNewName, } = props;
    const [currentTitle, setCurrentTitle] = useState(title);
    // Do not allow the user to save a potential name if it conflicts with
    // another name in the hierarchy.
    const hasConflicts = onNodeCheckNewName(path, currentTitle);
    function trySetName() {
        if (!hasConflicts) {
            onNodeSetName(path, currentTitle, true);
        }
    }
    const classes = useStyles();
    return (_jsxs("span", { className: classes.titleButtonWithInput, children: [_jsx("input", { 
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus: true, className: classes.titleInput, type: "text", value: currentTitle, onChange: (e) => { setCurrentTitle(e.target.value); }, onKeyPress: e => callbackOnKeyPress(e, 'Enter', trySetName), onFocus: e => e.target.select() }), !hasConflicts && (_jsx("button", { type: "button", className: classes.titleSaveButton, onClick: trySetName, children: "Save" }))] }));
}
/**
 * A "delegation" component, to decide whether to render
 * an "editing" vs. "static" node component.
 * @param {object} props The props for the TreeNode component.
 */
function NamedSetNode(props) {
    const { isEditing, isCurrentSet, } = props;
    return ((isEditing || isCurrentSet)
        ? (_jsx(NamedSetNodeEditing, { ...props }))
        : (_jsx(NamedSetNodeStatic, { ...props })));
}
/**
 * Buttons for viewing each hierarchy level,
 * rendered below collapsed level zero nodes.
 * @param {object} props The props for the (level zero) TreeNode component.
 */
function LevelsButtons(props) {
    const { nodeKey, path, height, onCheckLevel, checkedLevelPath, checkedLevelIndex, hasColorEncoding, } = props;
    function onCheck(event) {
        if (event.target.checked) {
            const newLevel = parseInt(event.target.value, 10);
            onCheckLevel(nodeKey, newLevel);
        }
    }
    const classes = useStyles();
    return (_jsx("div", { className: classes.levelButtonsContainer, children: range(1, height + 1).map((i) => {
            const isChecked = isEqual(path, checkedLevelPath) && i === checkedLevelIndex;
            return (_jsx("div", { children: _jsx(HelpTooltip, { title: getLevelTooltipText(i), children: _jsx("input", { className: clsx(classes.levelRadioButton, { [classes.levelRadioButtonChecked]: isChecked && !hasColorEncoding }), type: "checkbox", value: i, checked: isChecked && hasColorEncoding, onChange: onCheck }) }) }, i));
        }) }));
}
/**
 * Render the "switcher" icon.
 * Arrow for collapsed/expanded non-leaf nodes,
 * or square for leaf nodes.
 * @param {object} props The props for the TreeNode component.
 */
function SwitcherIcon(props) {
    const { isLeaf, isOpen, color, } = props;
    const hexColor = (color ? colorArrayToString(color) : undefined);
    if (isLeaf) {
        return (_jsx("i", { className: "anticon anticon-circle rc-tree-switcher-icon", children: _jsx("svg", { viewBox: "0 0 1024 1024", focusable: "false", "data-icon": "caret-down", width: "1em", height: "1em", "aria-hidden": "true", children: _jsx("rect", { fill: hexColor, x: 600 / 2, y: 600 / 2, width: 1024 - 600, height: 1024 - 600 }) }) }));
    }
    return (_jsx("i", { className: "anticon anticon-caret-down rc-tree-switcher-icon", children: _jsx("svg", { viewBox: "0 0 1024 1024", focusable: "false", "data-icon": "caret-down", width: "1em", height: "1em", "aria-hidden": "true", children: _jsx("path", { fill: (isOpen ? '#444' : hexColor), d: "M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z" }) }) }));
}
/**
 * A custom TreeNode component.
 * @extends {RcTreeNode} TreeNode from the rc-tree library.
 */
export default class TreeNode extends RcTreeNode {
    /**
     * Override the main node text elements.
     */
    renderSelector = () => {
        const { title, isCurrentSet, isSelected, isEditing, onDragStart: onDragStartProp, } = this.props;
        const { rcTree: { prefixCls: prefixClass, draggable, }, } = this.context;
        const onDragStart = (e) => {
            onDragStartProp();
            this.onDragStart(e);
        };
        const wrapClass = `${prefixClass}-node-content-wrapper`;
        const isDraggable = (!isCurrentSet && !isEditing && draggable);
        return (_jsxs("span", { ref: this.setSelectHandle, title: title, className: clsx(wrapClass, `${wrapClass}-${this.getNodeState() || 'normal'}`, isSelected && `${prefixClass}-node-selected`, isDraggable && 'draggable'), draggable: isDraggable, "aria-grabbed": isDraggable, onDragStart: isDraggable ? onDragStart : undefined, children: [_jsx(NamedSetNode, { ...this.props, prefixClass: prefixClass, checkbox: this.renderCheckbox() }), this.renderLevels()] }));
    };
    /**
     * Render the LevelsButtons component if this node
     * is a collapsed level zero node.
     */
    renderLevels = () => {
        const { level, expanded } = this.props;
        if (level !== 0 || expanded) {
            return null;
        }
        return (_jsx(LevelsButtons, { ...this.props }));
    };
    /**
     * Override the switcher element.
     */
    renderSwitcher = () => {
        const { expanded, isLeaf, color } = this.props;
        const { rcTree: { prefixCls: prefixClass, onNodeExpand, }, } = this.context;
        const onNodeExpandWrapper = (e) => {
            // Do not call onNodeExpand if the node is a leaf node.
            if (!isLeaf) {
                onNodeExpand(e, this);
            }
        };
        const switcherClass = clsx(`${prefixClass}-switcher`, { [`${prefixClass}-switcher_${(expanded ? 'open' : 'close')}`]: !isLeaf });
        return (_jsx("span", { className: switcherClass, onClick: onNodeExpandWrapper, onKeyPress: e => callbackOnKeyPress(e, 'd', onNodeExpandWrapper), role: "button", tabIndex: "0", children: _jsx(SwitcherIcon, { isLeaf: isLeaf, isOpen: expanded, color: color }) }));
    };
    /**
     * Override main render function,
     * to enable overriding the sub-render functions
     * for switcher, selector, etc.
     */
    render() {
        const { style, loading, level, dragOver, dragOverGapTop, dragOverGapBottom, isLeaf, expanded, selected, checked, halfChecked, onDragEnd: onDragEndProp, expandable, ...otherProps } = this.props;
        const { rcTree: { prefixCls: prefixClass, filterTreeNode, draggable, }, } = this.context;
        const disabled = this.isDisabled();
        const dataAndAriaAttributeProps = getDataAndAria(otherProps);
        const onDragEnd = (e) => {
            onDragEndProp();
            this.onDragEnd(e);
        };
        return (_jsxs("li", { className: clsx('rc-tree-treenode', `level-${level}-treenode`, {
                [`${prefixClass}-treenode-disabled`]: disabled,
                [`${prefixClass}-treenode-switcher-${expanded ? 'open' : 'close'}`]: !isLeaf,
                [`${prefixClass}-treenode-checkbox-checked`]: checked,
                [`${prefixClass}-treenode-checkbox-indeterminate`]: halfChecked,
                [`${prefixClass}-treenode-selected`]: selected,
                [`${prefixClass}-treenode-loading`]: loading,
                'drag-over': !disabled && dragOver,
                'drag-over-gap-top': !disabled && dragOverGapTop,
                'drag-over-gap-bottom': !disabled && dragOverGapBottom,
                'filter-node': filterTreeNode && filterTreeNode(this),
            }), style: style, role: "treeitem", "aria-selected": selected, onDragEnter: draggable ? this.onDragEnter : undefined, onDragOver: draggable ? this.onDragOver : undefined, onDragLeave: draggable ? this.onDragLeave : undefined, onDrop: draggable ? this.onDrop.bind(this) : undefined, onDragEnd: draggable ? onDragEnd : undefined, ...dataAndAriaAttributeProps, children: [expandable ? this.renderSwitcher() : null, this.renderSelector(), this.renderChildren()] }));
    }
}
