import { createTheme } from '@mui/material';

export const COLOR_HOVER = '#bdd7e1';
export const COLOR_PRIMARY = '#050b26';
export const COLOR_PRIMARY_LIGHT = '#5C5D73';
export const COLOR_LOGO_LIGHT = '#24bfd3';
export const COLOR_SECONDARY = '#0e7d9f';
export const COLOR_SECONDARY_LIGHT = '#FFF';
export const COLOR_HIGHLIGHT = '#B6D8E2';
export const COLOR_GRAY = '#f2f7f8';

export const Light = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: COLOR_PRIMARY,
          boxShadow: 'none',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255,255, 0)',
          // backdropFilter: 'blur(2px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: 'none',
          backgroundColor: COLOR_GRAY,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.8rem',
          color: COLOR_PRIMARY,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        secondary: {
          fontSize: '0.8rem',
          color: COLOR_PRIMARY_LIGHT,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
    },
    MuiListItemAvatar: {
      styleOverrides: {
        root: {
          color: COLOR_SECONDARY,
          minWidth: '40px',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 0,
          fontSize: 'small',
          marginRight: '.8rem',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: COLOR_SECONDARY,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingLeft: 0,
          cursor: 'pointer',
        },
      },
      defaultProps: {
        sx: {
          pl: 4,
        },
      },
    },
    MuiRadio: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small',
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '.8rem',
        },
        filledPrimary: {
          justifyContent: 'left',
          borderRadius: '3px',
          border: '0px solid',
          color: COLOR_PRIMARY,
          background: 'rgba(255,255,255,0)',
          ':focus': {
            background: COLOR_HIGHLIGHT,
          },
          ':hover': {
            background: COLOR_HIGHLIGHT,
          },
        },
        filledSecondary: {
          color: COLOR_PRIMARY,
          border: '0px solid',
          pt: 1,
          pb: 1,
          background: '#FFF',
          ':focus': {
            background: COLOR_HIGHLIGHT,
          },
          ':hover': {
            background: COLOR_HIGHLIGHT,
          },
        },
        iconColorSecondary: {
          color: COLOR_SECONDARY,
          fontSize: '1.2rem',
        },
        iconColorPrimary: {
          color: COLOR_SECONDARY,
        },
        deleteIconFilledColorPrimary: {
          color: COLOR_SECONDARY,
          ':hover': {
            color: COLOR_SECONDARY,
          },
        },
        deleteIconFilledColorSecondary: {
          color: COLOR_SECONDARY,
          ':hover': {
            color: COLOR_SECONDARY,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          height: '5px',
          paddingLeft: '0.25em',
          paddingRight: '0.25em',
        },
      },
      defaultProps: {
        color: 'secondary',
        size: 'small',
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          border: 'none',
          borderWidth: '0px',
          borderRadius: '3px',
          // backgroundColor: '#FFF',
        },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontSize: '.8rem',
          textTransform: 'none',
          cursor: 'pointer',
          color: '#000',
          // backgroundColor: COLOR_SECONDARY_LIGHT,
          borderWidth: '0px',
          '&.Mui-hover': {
            backgroundColor: COLOR_HOVER,
          },
          '&.Mui-selected': {
            color: COLOR_SECONDARY,
            backgroundColor: '#FFF',

          },

        },

      },

    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '12.8px',
          textTransform: 'none',
          fontWeight: 400,
          cursor: 'pointer',
          color: COLOR_PRIMARY,
        },

        startIcon: {
          color: COLOR_SECONDARY,
        },
        containedPrimary: {
          color: '#FFF',
        },
        containedSecondary: {
          color: '#FFF',
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        li: {
          root: {

            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.2,
            letterSpacing: '0em',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '.8rem',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderColor: 'green',
          borderWidth: 4,

        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        root: {
          zIndex: 1199,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          height: '28px',
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        fullWidth: true,
        size: 'small',
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: 'small',
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
        },
        row: {
          ':hover': {
            background: COLOR_HIGHLIGHT,
          },
        },
        cell: {
          color: COLOR_PRIMARY,
          ':focus': { outline: 0, background: COLOR_HIGHLIGHT },
        },
        columnHeader: {
          borderColor: COLOR_GRAY,
          color: COLOR_SECONDARY,
          fontWeight: 'normal',
          ':focus': { outline: 0, background: COLOR_HIGHLIGHT },
        },
      },
    },
  },
  palette: {
    primary: {
      main: COLOR_PRIMARY,
      light: COLOR_PRIMARY_LIGHT,
    },
    secondary: {
      main: COLOR_SECONDARY,
      light: COLOR_SECONDARY_LIGHT,
    },
    warning: {
      main: '#7D2D65',
    },
    background: {
      default: '#FFFFFF',
    },
    divider: COLOR_PRIMARY_LIGHT,
  },
  typography: {
    fontFamily: 'Inter, "-apple-system", "BlinkMacSystemFont", sans-serif',
    fontSize: 18,
    fontWeightRegular: 400,
    fontWeightBold: 800,
    body1: {
      fontSize: '.8rem',
      lineHeight: 1.5,
      letterSpacing: '0',
      color: COLOR_PRIMARY,
    },
    body2: {
      fontSize: '.8rem',
      lineHeight: 1.5,
      letterSpacing: '0',
      color: COLOR_PRIMARY_LIGHT,
    },
    h1: {
      fontFamily: '"DM Serif Display", serif',
      lineHeight: 1.2,
      letterSpacing: 1.5,
      color: COLOR_PRIMARY,
      mb: 3,
    },
    h2: {
      fontFamily: '"DM Serif Display", serif',
      fontSize: '68px',
      lineHeight: 1.2,
      letterSpacing: '0em',
      color: COLOR_PRIMARY,
    },
    h3: {
      fontSize: '1.2rem',
      lineHeight: 1.2,
      letterSpacing: '0em',
      color: COLOR_SECONDARY,
    },
    h4: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0em',
      color: COLOR_SECONDARY,
    },
    h5: {
      fontSize: '.8rem',
      lineHeight: 1,
      letterSpacing: '0em',
      color: COLOR_SECONDARY,
    },
    h6: {
      fontSize: '.8rem',
      lineHeight: 1.2,
      letterSpacing: '0em',
      color: COLOR_PRIMARY,
    },
    subtitle2: {
      fontSize: '.8rem',
    },
    caption: {
      fontSize: '.8rem',
    },
  },
});
