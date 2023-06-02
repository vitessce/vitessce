/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useColorMode } from '@docusaurus/theme-common';
import Highlight, { defaultProps } from 'prism-react-renderer';
import copy from 'copy-text-to-clipboard';
import { getHighlightTheme } from './_highlight-theme.js';
import { JSON_TRANSLATION_KEY } from './_editor-utils.js';

import styles from './styles.module.css';

export default function JsonHighlight(props) {
  const { json } = props;
  const { colorMode } = useColorMode();
  const isDarkTheme = (colorMode === 'dark');
  const highlightTheme = getHighlightTheme(isDarkTheme);
  const [showCopied, setShowCopied] = useState(false);

  const jsonCode = JSON.stringify(json, null, 2);

  const handleCopyCode = () => {
    copy(jsonCode);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  useEffect(() => {
    // Put the current translation on the window for easy retrieval.
    // There is probably a cleaner way to do this.
    window[JSON_TRANSLATION_KEY] = jsonCode;
  });

  // Adapted from https://github.com/FormidableLabs/prism-react-renderer/blob/master/README.md#usage
  return (
    <Highlight {...defaultProps} code={jsonCode} language="json" theme={highlightTheme}>
      {({
        className, style, tokens, getLineProps, getTokenProps,
      }) => (
        <div className={styles.copyButtonContainer}>
          <pre className={clsx(className, styles.viewConfigPreviewJSCode)} style={style}>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
          <button
            type="button"
            aria-label="Copy code to clipboard"
            className={styles.copyButton}
            onClick={handleCopyCode}
          >
            {showCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </Highlight>
  );
}
