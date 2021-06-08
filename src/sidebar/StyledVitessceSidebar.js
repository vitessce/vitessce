/* eslint-disable */
import React from 'react';
import AddToPhotosIcon from '@material-ui/icons/AddToPhotos';
import LinkIcon from '@material-ui/icons/Link';
import { useStyles } from './styles';
import { ReactComponent as SidebarLogoSVG } from '../assets/sidebar-logo.svg';

export default function StyledVitessceSidebar(props) {
  const {
    children,
  } = props;
  
  const classes = useStyles();
  
  return (
    <div className={classes.appContainer}>
      <div className={classes.sidebarContainer}>
        <a href="http://vitessce.io" target="_blank">
          <SidebarLogoSVG title="Powered by Vitessce" />
        </a>
        <div className={classes.actionContainer}>
          <AddToPhotosIcon />
          <label>Add component</label>
        </div>
        <div  className={classes.actionContainer}>
          <LinkIcon />
          <label>Share via link</label>
        </div>
      </div>
      <div className={classes.mainContainer}>
        {children}
      </div>
    </div>
  );
}
