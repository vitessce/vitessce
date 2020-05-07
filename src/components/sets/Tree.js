import React from 'react';
import RcTree from 'rc-tree';
import classNames from 'classnames';

// Collapse motion
const getCollapsedHeight = () => ({ height: 0, opacity: 0 });
const getRealHeight = node => ({ height: node.scrollHeight, opacity: 1 });
const getCurrentHeight = node => ({ height: node.offsetHeight });

const collapseMotion = {
  motionName: 'ant-motion-collapse',
  onAppearStart: getCollapsedHeight,
  onEnterStart: getCollapsedHeight,
  onAppearActive: getRealHeight,
  onEnterActive: getRealHeight,
  onLeaveStart: getCurrentHeight,
  onLeaveActive: getCollapsedHeight,
  motionDeadline: 500,
};


const Tree = React.forwardRef((props, ref) => {
  const {
    prefixCls,
    blockNode,
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
        [`${prefixCls}-block-node`]: blockNode
      })}
      checkable={checkable ? <span className={`${prefixCls}-checkbox-inner`} /> : checkable}
    >
      {children}
    </RcTree>
  );
});

Tree.defaultProps = {
  checkable: false,
  showIcon: false,
  motion: {
    ...collapseMotion,
    motionAppear: false,
  },
  blockNode: true,
  prefixCls: "rc-tree",
};

export default Tree;
