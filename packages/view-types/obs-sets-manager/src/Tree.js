import React from 'react';
import RcTree from 'rc-tree/es/Tree.js';
import clsx from 'clsx';

/**
 * A helper component around the rc-tree
 * library's tree component, to set
 * default props.
 */
const Tree = React.forwardRef((props, ref) => {
  const {
    prefixCls = 'rc-tree',
    className,
    showIcon = false,
    blockNode = true,
    children,
    checkable = false,
    virtual = false,
  } = props;
  // Do not render RcTree if the tree nodes have not yet loaded.
  return (children?.length > 0 ? (
    <RcTree
      itemHeight={32}
      ref={ref}
      {...props}
      virtual={virtual}
      showIcon={showIcon}
      blockNode={blockNode}
      prefixCls={prefixCls}
      className={clsx(className, {
        [`${prefixCls}-icon-hide`]: !showIcon,
        [`${prefixCls}-block-node`]: blockNode,
      })}
      checkable={checkable ? <span className={`${prefixCls}-checkbox-inner`} /> : checkable}
      checkStrictly={false}
    >
      {children}
    </RcTree>
  ) : null);
});
Tree.displayName = 'Tree';

export default Tree;
