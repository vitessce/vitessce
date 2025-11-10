import React, { useCallback } from 'react';
import {
  makeStyles,
  IconButton,
  Code as CodeIcon,
  InvertColors as InvertColorsIcon,
} from '@vitessce/styles';

const useStyles = makeStyles()(() => ({
  sidebarContainer: {
    backgroundColor: 'silver',
    width: '30px',
    height: '100%',
  },
  sidebarUl: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  sidebarLi: {

  },
  sidebarIconButton: {
    padding: '3px',
  },
  sidebarIcon: {
    color: 'black',
    width: '24px',
    height: '24px',
  },
}));

export function Sidebar(props) {
  const {
    theme,
    setTheme,
    configEditable,
    themeEditable,
  } = props;
  const { classes } = useStyles();

  const onToggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light2' : 'dark');
  }, [theme]);

  return (
    <div className={classes.sidebarContainer}>
      <ul className={classes.sidebarUl}>
        {themeEditable ? (
          <li className={classes.sidebarLi}>
            <IconButton
              alt="Change theme"
              onClick={onToggleTheme}
              aria-label="Change theme"
              className={classes.sidebarIconButton}
            >
              <InvertColorsIcon
                className={classes.sidebarIcon}
              />
            </IconButton>
          </li>
        ) : null}
        {configEditable ? (
          <li className={classes.sidebarLi}>
            <IconButton
              alt="Edit configuration"
              onClick={() => {}}
              aria-label="Edit configuration"
              className={classes.sidebarIconButton}
            >
              <CodeIcon
                className={classes.sidebarIcon}
              />
            </IconButton>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
