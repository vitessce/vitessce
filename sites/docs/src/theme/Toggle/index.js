/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useRef, memo } from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import useThemeContext from '@theme/hooks/useThemeContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './styles.module.css';

const Dark = () => (
  <span className={clsx(styles.toggle, styles.dark)}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={styles.toggleIcon}
    >
      <path
        transform="scale(-1, 1) translate(-24, 0)"
        d="M12.43 2.3c-2.38-.59-4.68-.27-6.63.64-.35.16-.41.64-.1.86C8.3 5.6 10 8.6 10 12c0 3.4-1.7 6.4-4.3 8.2-.32.22-.26.7.09.86 1.28.6 2.71.94 4.21.94 6.05 0 10.85-5.38 9.87-11.6-.61-3.92-3.59-7.16-7.44-8.1z"
      />
    </svg>
  </span>
);
const Light = () => (
  <span className={clsx(styles.toggle, styles.light)}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={styles.toggleIcon}
    >
      <path d="M6.05 4.14l-.39-.39c-.39-.39-1.02-.38-1.4 0l-.01.01c-.39.39-.39 1.02 0 1.4l.39.39c.39.39 1.01.39 1.4 0l.01-.01c.39-.38.39-1.02 0-1.4zM3.01 10.5H1.99c-.55 0-.99.44-.99.99v.01c0 .55.44.99.99.99H3c.56.01 1-.43 1-.98v-.01c0-.56-.44-1-.99-1zm9-9.95H12c-.56 0-1 .44-1 .99v.96c0 .55.44.99.99.99H12c.56.01 1-.43 1-.98v-.97c0-.55-.44-.99-.99-.99zm7.74 3.21c-.39-.39-1.02-.39-1.41-.01l-.39.39c-.39.39-.39 1.02 0 1.4l.01.01c.39.39 1.02.39 1.4 0l.39-.39c.39-.39.39-1.01 0-1.4zm-1.81 15.1l.39.39c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.39-.39c-.39-.39-1.02-.38-1.4 0-.4.4-.4 1.02-.01 1.41zM20 11.49v.01c0 .55.44.99.99.99H22c.55 0 .99-.44.99-.99v-.01c0-.55-.44-.99-.99-.99h-1.01c-.55 0-.99.44-.99.99zM12 5.5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-.01 16.95H12c.55 0 .99-.44.99-.99v-.96c0-.55-.44-.99-.99-.99h-.01c-.55 0-.99.44-.99.99v.96c0 .55.44.99.99.99zm-7.74-3.21c.39.39 1.02.39 1.41 0l.39-.39c.39-.39.38-1.02 0-1.4l-.01-.01a.9959.9959 0 00-1.41 0l-.39.39c-.38.4-.38 1.02.01 1.41z" />
    </svg>
  </span>
);

// Based on react-toggle (https://github.com/aaronshaf/react-toggle/).
const Toggle = memo(
  ({
    className, icons, checked: defaultChecked, disabled, onChange,
  }) => {
    const [checked, setChecked] = useState(defaultChecked);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef();

    return (
      <div
        className={clsx(styles.toggle, className, {
          [styles.toggleChecked]: checked,
          [styles.toggleFocused]: focused,
          [styles.toggleDisabled]: disabled,
        })}
      >
        <div
          className={styles.toggleTrack}
          role="button"
          tabIndex={-1}
          onClick={() => inputRef.current?.click()}
        >
          <div className={styles.toggleTrackCheck}>{icons.checked}</div>
          <div className={styles.toggleTrackX}>{icons.unchecked}</div>
          <div className={styles.toggleTrackThumb} />
        </div>

        <input
          ref={inputRef}
          checked={checked}
          type="checkbox"
          className={styles.toggleScreenReader}
          aria-label="Switch between dark and light mode"
          onChange={onChange}
          onClick={() => setChecked(!checked)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputRef && inputRef.current) {
              inputRef.current.click();
            }
          }}
        />
      </div>
    );
  },
);

function GitHubIcon(props) {
  const { className } = props;
  const { siteConfig = {} } = useDocusaurusContext();
  const { isDarkTheme } = useThemeContext();
  return (
    <a
      href={`https://github.com/${siteConfig.organizationName}/`}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx('ghLink', className)}
    >
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={clsx(styles.ghIcon, {
            ghDark: isDarkTheme,
            ghLight: !isDarkTheme,
          })}
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </span>
    </a>
  );
}

function VitessceToggle(props) {
  const isBrowser = useIsBrowser();

  return (
    <>
      <GitHubIcon {...props} />
      <Toggle
        disabled={!isBrowser}
        icons={{
          checked: <Dark />,
          unchecked: <Light />,
        }}
        {...props}
      />
    </>
  );
}

export default VitessceToggle;
