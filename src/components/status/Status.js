/* eslint-disable */
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';


import Navigation from '@material-ui/icons/Navigation';
import Add from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import Update from '@material-ui/icons/Update';



const useStyles = makeStyles((theme) => ({
  tabRoot: {
    color: 'rgba(0, 0, 0, 0.54)',
    padding: '4px 0',
    fontSize: '14px',
    fontWeight: 400,
    '& svg': {
      width: '18px',
      height: '18px',
    }
  },
  tabSelected: {
    color: '#1976d2',
  },
  tabLabelIcon: {
    minHeight: 0
  },
  tabsIndicator: {
    backgroundColor: '#1976d2',
  },
  circularProgressRoot: {
    color: '#1976d2',
  },
  circularProgressText: {
    fontSize: '12px !important',
    lineHeight: '12px !important',
    marginTop: '-3px'
  },
  updateButtonRoot: {
    color: '#fff',
    backgroundColor: '#1976d2',
    '&:hover': {
      backgroundColor: '#115293',
    },
  },
}));

function CircularProgressWithLabel(props) {
  const classes = useStyles();
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} classes={{ root: classes.circularProgressRoot }} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography classes={{ root: classes.circularProgressText }} variant="caption" component="div" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function Status(props) {
  const { info, warn } = props;
  const classes = useStyles();

  const [value, setValue] = useState(0);
  const [progress, setProgress] = useState(90);

  const valueToInstructions = [
    'Use the Cell Sets view to confirm, reject, or edit anchor sets.',
    'To add an anchor set, use the Lasso tool in the Comparison View.',
    'To edit an anchor set, click the three-dot menu next to a set of interest in the Cell Sets view.'

  ]

  const messages = [];
  if (info) {
    messages.push(<p className="details" key="info">{info}</p>);
  }
  if (warn) {
    messages.push(<p className="alert alert-warning my-0 details" key="warn">{warn}</p>);
  }
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabClasses = { root: classes.tabRoot, selected: classes.tabSelected, labelIcon: classes.tabLabelIcon };


  return (
    <div className="qrStatus">
      <div className="qrStatusCompletion">
        <CircularProgressWithLabel value={progress} />
        <Box position="relative" display="inline-flex">
          <span className="qrStatusCompletionInfo">
            You have confirmed n of N anchor sets, comprising m of M query cells.
          </span>
        </Box>
      </div>
      <div className="qrStatusMode">
        <Tabs
          value={value}
          onChange={handleChange}
          classes={{ indicator: classes.tabsIndicator }}
        >
          <Tab label="Explore" icon={<Navigation />} classes={tabClasses} />
          <Tab label="Add" icon={<Add />} classes={tabClasses} />
          <Tab label="Edit" icon={<Edit />} disabled classes={tabClasses} />
        </Tabs>
      </div>
      <div className="qrStatusInstructions">
        {valueToInstructions[value]}
      </div>
      <div className="qrStatusModel">
        <Button
          classes={{ root: classes.updateButtonRoot }}
          variant="contained"
          startIcon={<Update />}
          disableElevation
        >
          Update Model
        </Button>
      </div>
    </div>
  );
}
