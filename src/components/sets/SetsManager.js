/* eslint-disable */
import React, { useRef, useEffect, useState } from 'react';
import classNames from 'classnames';
import Tree from './Tree';
import SetsManagerActionBar from './SetsManagerActionBar';
import 'antd/es/tabs/style/index.css';

const NARROW_THRESHOLD = 250;

/**
 * A generic hierarchical set manager component.
 * @prop {SetsTree} tree An object representing set hierarchies
 * @prop {string} datatype The data type for sets (e.g. "cell")
 * @prop {function} clearPleaseWait A callback to signal that loading is complete.
 * @prop {boolean} checkable Whether to show checkboxes for selecting multiple sets.
 * @prop {boolean} editable Whether to show rename, delete, color options.
 * @prop {boolean} expandable Whether to allow hierarchies to be expanded to show the list or tree of sets contained.
 * @prop {boolean} operatable Whether to enable union, intersection, and complement operations. If true, checkable also must be true.
 */
export default function SetsManager(props) {
  const {
    tree,
    datatype,
    clearPleaseWait,
    checkable = true,
    editable = true,
    expandable = true,
    operatable = true,
  } = props;

  console.assert(!operatable || (operatable && checkable && expandable), "Must be checkable and expandable in order to be operatable.");

  if (clearPleaseWait && tree) {
    clearPleaseWait('cell_sets');
  }

  const divRef = useRef();
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if(divRef.current.offsetWidth < NARROW_THRESHOLD) {
      setIsNarrow(true);
    }
  })

  return (
    <div
      ref={divRef}
      className={classNames(
        "sets-manager",
        { 'sets-manager-narrow': isNarrow }
      )}
    >
      <Tree
        tree={tree}
        checkable={checkable}
        editable={editable}
        expandable={expandable}
        operatable={operatable}
      />
    </div>
  );
}
