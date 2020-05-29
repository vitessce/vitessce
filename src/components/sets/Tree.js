import React from 'react';
import RcTree from 'rc-tree';
import classNames from 'classnames';

/**
 * A helper component around the rc-tree
 * library's tree component, to set
 * default props.
 */
const Tree = React.forwardRef((props, ref) => {
  const {
    prefixCls,
    className,
    showIcon,
    blockNode,
    children,
    checkable,
  } = props;
  return (
    <RcTree
      itemHeight={32}
      ref={ref}
      {...props}
      className={classNames(className, {
        [`${prefixCls}-icon-hide`]: !showIcon,
        [`${prefixCls}-block-node`]: blockNode,
      })}
      checkable={checkable ? <span className={`${prefixCls}-checkbox-inner`} /> : checkable}
    >
      {children}
    </RcTree>
  );
});

Tree.defaultProps = {
  virtual: false,
  checkable: false,
  showIcon: false,
  blockNode: true,
  prefixCls: 'rc-tree',
};

export default Tree;
