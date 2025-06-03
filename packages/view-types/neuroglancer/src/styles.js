import { makeStyles, GlobalStyles, ScopedGlobalStyles } from '@vitessce/styles';

// Reference: https://github.com/vitessce/vitessce/blob/tkakar/cat-1107-create-neuroglancer-view/sites/demo/neuro-styles.css

export const useStyles = makeStyles()(() => ({
  neuroglancerWrapper: {
    position: 'relative',
    height: '100%',
  },
}));

// We define a subset of styles as a string,
// and render with <style></style>
// since Neuroglancer renders them outside of the
// .neuroglancer-container DOM element.
// Instead, these elements are prepended/appended
// directly to the `document` by neuroglancer,
// so we cannot scope them as children of the
// .neuroglancer-container class.
const globalNeuroglancerCss = `

.neuroglancer-position-widget, 
.neuroglancer-viewer-top-row,
.neuroglancer-layer-panel, 
.neuroglancer-side-panel-column,
.neuroglancer-data-panel-layout-controls button{
    display: none !important;
}
    
.neuroglancer-segment-list-header-label {
  display: none !important;
}
.overlay {
  height:100%;
  width:100%;
  position:fixed;
  z-index:99;
  top:0;
  left:0;
  background-color:#000c;
}
.overlay-content {
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  background-color:#fff;
  z-index:100;
  color:#000;
  padding:1em;
}
.neuroglancer-state-editor {
  width: 80%
}
.close-button {
  position: absolute;
  right: 15px
}

.CodeMirror {
  font-family: monospace;
  height: 300px;
  color: #000;
  direction: ltr
}

.CodeMirror-lines {
  padding: 4px 0
}

.CodeMirror pre.CodeMirror-line,
.CodeMirror pre.CodeMirror-line-like {
  padding: 0 4px
}

.CodeMirror-scrollbar-filler,
.CodeMirror-gutter-filler {
  background-color: #fff
}

.CodeMirror-gutters {
  border-right: 1px solid #ddd;
  background-color: #f7f7f7;
  white-space: nowrap
}

.CodeMirror-linenumber {
  padding: 0 3px 0 5px;
  min-width: 20px;
  text-align: right;
  color: #999;
  white-space: nowrap
}

.CodeMirror-guttermarker {
  color: #000
}

.CodeMirror-guttermarker-subtle {
  color: #999
}

.CodeMirror-cursor {
  border-left: 1px solid black;
  border-right: none;
  width: 0
}

.CodeMirror div.CodeMirror-secondarycursor {
  border-left: 1px solid silver
}

.cm-fat-cursor .CodeMirror-cursor {
  width: auto;
  border: 0 !important;
  background: #7e7
}

.cm-fat-cursor div.CodeMirror-cursors {
  z-index: 1
}

.cm-fat-cursor-mark {
  background-color: #14ff1480;
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite
}

.cm-animate-fat-cursor {
  width: auto;
  border: 0;
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
  background-color: #7e7
}

@-moz-keyframes blink {
  50% {
    background-color: transparent
  }
}

@-webkit-keyframes blink {
  50% {
    background-color: transparent
  }
}

@keyframes blink {
  50% {
    background-color: transparent
  }
}

.cm-tab {
  display: inline-block;
  text-decoration: inherit
}

.CodeMirror-rulers {
  position: absolute;
  left: 0;
  right: 0;
  top: -50px;
  bottom: 0;
  overflow: hidden
}

.CodeMirror-ruler {
  border-left: 1px solid #ccc;
  top: 0;
  bottom: 0;
  position: absolute
}

.cm-s-default .cm-header {
  color: #00f
}

.cm-s-default .cm-quote {
  color: #090
}

.cm-negative {
  color: #d44
}

.cm-positive {
  color: #292
}

.cm-header,
.cm-strong {
  font-weight: bold
}

.cm-em {
  font-style: italic
}

.cm-link {
  text-decoration: underline
}

.cm-strikethrough {
  text-decoration: line-through
}

.cm-s-default .cm-keyword {
  color: #708
}

.cm-s-default .cm-atom {
  color: #219
}

.cm-s-default .cm-number {
  color: #164
}

.cm-s-default .cm-def {
  color: #00f
}

.cm-s-default .cm-variable-2 {
  color: #05a
}

.cm-s-default .cm-variable-3,
.cm-s-default .cm-type {
  color: #085
}

.cm-s-default .cm-comment {
  color: #a50
}

.cm-s-default .cm-string {
  color: #a11
}

.cm-s-default .cm-string-2 {
  color: #f50
}

.cm-s-default .cm-meta {
  color: #555
}

.cm-s-default .cm-qualifier {
  color: #555
}

.cm-s-default .cm-builtin {
  color: #30a
}

.cm-s-default .cm-bracket {
  color: #997
}

.cm-s-default .cm-tag {
  color: #170
}

.cm-s-default .cm-attribute {
  color: #00c
}

.cm-s-default .cm-hr {
  color: #999
}

.cm-s-default .cm-link {
  color: #00c
}

.cm-s-default .cm-error {
  color: red
}

.cm-invalidchar {
  color: red
}

.CodeMirror-composing {
  border-bottom: 2px solid
}

div.CodeMirror span.CodeMirror-matchingbracket {
  color: #0b0
}

div.CodeMirror span.CodeMirror-nonmatchingbracket {
  color: #a22
}

.CodeMirror-matchingtag {
  background: rgba(255, 150, 0, .3)
}

.CodeMirror-activeline-background {
  background: #e8f2ff
}

.CodeMirror {
  position: relative;
  overflow: hidden;
  background: white
}

.CodeMirror-scroll {
  overflow: scroll !important;
  margin-bottom: -50px;
  margin-right: -50px;
  padding-bottom: 50px;
  height: 100%;
  outline: none;
  position: relative
}

.CodeMirror-sizer {
  position: relative;
  border-right: 50px solid transparent
}

.CodeMirror-vscrollbar,
.CodeMirror-hscrollbar,
.CodeMirror-scrollbar-filler,
.CodeMirror-gutter-filler {
  position: absolute;
  z-index: 6;
  display: none;
  outline: none
}

.CodeMirror-vscrollbar {
  right: 0;
  top: 0;
  overflow-x: hidden;
  overflow-y: scroll
}

.CodeMirror-hscrollbar {
  bottom: 0;
  left: 0;
  overflow-y: hidden;
  overflow-x: scroll
}

.CodeMirror-scrollbar-filler {
  right: 0;
  bottom: 0
}

.CodeMirror-gutter-filler {
  left: 0;
  bottom: 0
}

.CodeMirror-gutters {
  position: absolute;
  left: 0;
  top: 0;
  min-height: 100%;
  z-index: 3
}

.CodeMirror-gutter {
  white-space: normal;
  height: 100%;
  display: inline-block;
  vertical-align: top;
  margin-bottom: -50px
}

.CodeMirror-gutter-wrapper {
  position: absolute;
  z-index: 4;
  background: none !important;
  border: none !important
}

.CodeMirror-gutter-background {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 4
}

.CodeMirror-gutter-elt {
  position: absolute;
  cursor: default;
  z-index: 4
}

.CodeMirror-gutter-wrapper ::selection {
  background-color: transparent
}

.CodeMirror-gutter-wrapper ::-moz-selection {
  background-color: transparent
}

.CodeMirror-lines {
  cursor: text;
  min-height: 1px
}

.CodeMirror pre.CodeMirror-line,
.CodeMirror pre.CodeMirror-line-like {
  -moz-border-radius: 0;
  -webkit-border-radius: 0;
  border-radius: 0;
  border-width: 0;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  margin: 0;
  white-space: pre;
  word-wrap: normal;
  line-height: inherit;
  color: inherit;
  z-index: 2;
  position: relative;
  overflow: visible;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-variant-ligatures: contextual;
  font-variant-ligatures: contextual
}

.CodeMirror-wrap pre.CodeMirror-line,
.CodeMirror-wrap pre.CodeMirror-line-like {
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: normal
}

.CodeMirror-linebackground {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 0
}

.CodeMirror-linewidget {
  position: relative;
  z-index: 2;
  padding: .1px
}

.CodeMirror-rtl pre {
  direction: rtl
}

.CodeMirror-code {
  outline: none
}

.CodeMirror-scroll,
.CodeMirror-sizer,
.CodeMirror-gutter,
.CodeMirror-gutters,
.CodeMirror-linenumber {
  -moz-box-sizing: content-box;
  box-sizing: content-box
}

.CodeMirror-measure {
  position: absolute;
  width: 100%;
  height: 0;
  overflow: hidden;
  visibility: hidden
}

.CodeMirror-cursor {
  position: absolute;
  pointer-events: none
}

.CodeMirror-measure pre {
  position: static
}

div.CodeMirror-cursors {
  visibility: hidden;
  position: relative;
  z-index: 3
}

div.CodeMirror-dragcursors {
  visibility: visible
}

.CodeMirror-focused div.CodeMirror-cursors {
  visibility: visible
}

.CodeMirror-selected {
  background: #d9d9d9
}

.CodeMirror-focused .CodeMirror-selected {
  background: #d7d4f0
}

.CodeMirror-crosshair {
  cursor: crosshair
}

.CodeMirror-line::selection,
.CodeMirror-line>span::selection,
.CodeMirror-line>span>span::selection {
  background: #d7d4f0
}

.CodeMirror-line::-moz-selection,
.CodeMirror-line>span::-moz-selection,
.CodeMirror-line>span>span::-moz-selection {
  background: #d7d4f0
}

.cm-searching {
  background-color: #ffa;
  background-color: #ff06
}

.cm-force-border {
  padding-right: .1px
}

@media print {
  .CodeMirror div.CodeMirror-cursors {
    visibility: hidden
  }
}

.cm-tab-wrap-hack:after {
  content: ""
}

span.CodeMirror-selectedtext {
  background: none
}

.CodeMirror-foldmarker {
  color: #00f;
  text-shadow: #b9f 1px 1px 2px, #b9f -1px -1px 2px, #b9f 1px -1px 2px, #b9f -1px 1px 2px;
  font-family: arial;
  line-height: .3;
  cursor: pointer
}

.CodeMirror-foldgutter {
  width: .7em
}

.CodeMirror-foldgutter-open,
.CodeMirror-foldgutter-folded {
  cursor: pointer
}

.CodeMirror-foldgutter-open:after {
  content: "\\25be"
}

.CodeMirror-foldgutter-folded:after {
  content: "\\25b8"
}

.CodeMirror-lint-markers {
  width: 16px
}

.CodeMirror-lint-tooltip {
  background-color: #ffd;
  border: 1px solid black;
  border-radius: 4px;
  color: #000;
  font-family: monospace;
  font-size: 10pt;
  overflow: hidden;
  padding: 2px 5px;
  position: fixed;
  white-space: pre;
  white-space: pre-wrap;
  z-index: 100;
  max-width: 600px;
  opacity: 0;
  transition: opacity .4s;
  -moz-transition: opacity .4s;
  -webkit-transition: opacity .4s;
  -o-transition: opacity .4s;
  -ms-transition: opacity .4s
}

.CodeMirror-lint-mark {
  background-position: left bottom;
  background-repeat: repeat-x
}

.CodeMirror-lint-mark-warning {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJFhQXEbhTg7YAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAMklEQVQI12NkgIIvJ3QXMjAwdDN+OaEbysDA4MPAwNDNwMCwiOHLCd1zX07o6kBVGQEAKBANtobskNMAAAAASUVORK5CYII=)
}

.CodeMirror-lint-mark-error {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJDw4cOCW1/KIAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAHElEQVQI12NggIL/DAz/GdA5/xkY/qPKMDAwAADLZwf5rvm+LQAAAABJRU5ErkJggg==)
}

.CodeMirror-lint-marker {
  background-position: center center;
  background-repeat: no-repeat;
  cursor: pointer;
  display: inline-block;
  height: 16px;
  width: 16px;
  vertical-align: middle;
  position: relative
}

.CodeMirror-lint-message {
  padding-left: 18px;
  background-position: top left;
  background-repeat: no-repeat
}

.CodeMirror-lint-marker-warning,
.CodeMirror-lint-message-warning {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAANlBMVEX/uwDvrwD/uwD/uwD/uwD/uwD/uwD/uwD/uwD6twD/uwAAAADurwD2tQD7uAD+ugAAAAD/uwDhmeTRAAAADHRSTlMJ8mN1EYcbmiixgACm7WbuAAAAVklEQVR42n3PUQqAIBBFUU1LLc3u/jdbOJoW1P08DA9Gba8+YWJ6gNJoNYIBzAA2chBth5kLmG9YUoG0NHAUwFXwO9LuBQL1giCQb8gC9Oro2vp5rncCIY8L8uEx5ZkAAAAASUVORK5CYII=)
}

.CodeMirror-lint-marker-error,
.CodeMirror-lint-message-error {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAHlBMVEW7AAC7AACxAAC7AAC7AAAAAAC4AAC5AAD///+7AAAUdclpAAAABnRSTlMXnORSiwCK0ZKSAAAATUlEQVR42mWPOQ7AQAgDuQLx/z8csYRmPRIFIwRGnosRrpamvkKi0FTIiMASR3hhKW+hAN6/tIWhu9PDWiTGNEkTtIOucA5Oyr9ckPgAWm0GPBog6v4AAAAASUVORK5CYII=)
}

.CodeMirror-lint-marker-multiple {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAMAAADzjKfhAAAACVBMVEUAAAAAAAC/v7914kyHAAAAAXRSTlMAQObYZgAAACNJREFUeNo1ioEJAAAIwmz/H90iFFSGJgFMe3gaLZ0od+9/AQZ0ADosbYraAAAAAElFTkSuQmCC);
  background-repeat: no-repeat;
  background-position: right bottom;
  width: 100%;
  height: 100%
}
`;


const globalNeuroglancerStyles = {
  '.neuroglancer-container': {
    position: 'relative',
    height: '100%',
  },
  // Converted neuro-styles.css using transform.tools
  '#statusContainer': {
    position: 'absolute',
    bottom: '0px',
    zIndex: 100,
    backgroundColor: 'gray',
    color: '#fff',
    margin: '0',
    padding: '0',
    font: '10pt sans-serif',
  },
  '#statusContainer li': {
    width: '100vw',
    maxHeight: '25vh',
    overflowY: 'auto',
  },
  '.neuroglancer-status-header': {
    display: 'inline-block',
    font: '10pt sans-serif',
    fontWeight: 'bold',
    backgroundColor: '#333',
    padding: '2px',
  },
  '.neuroglancer-selection-details-body': {
    height: '0px',
    flex: 1,
    overflowY: 'auto',
    flexBasis: '0px',
    minHeight: '0px',
  },
  '.neuroglancer-selection-details-position': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyItems: 'left',
    fontFamily: 'monospace',
    fontSize: 'medium',
  },
  '.neuroglancer-selection-details-position-dimension+.neuroglancer-selection-details-position-dimension': {
    marginLeft: '8px',
  },
  '.neuroglancer-selection-details-position-dimension-name': { color: '#ff6' },
  '.neuroglancer-selection-details-position-dimension-coordinate': {
    marginLeft: '5px',
    userSelect: 'text',
  },
  '.neuroglancer-selection-details-layer': {
    marginTop: '4px',
    marginBottom: '4px',
    border: '1px solid #222',
  },
  '.neuroglancer-selection-details-layer-title': {
    cursor: 'pointer',
    backgroundColor: '#222',
    fontFamily: 'sans-serif',
    fontSize: '10pt',
  },
  '.neuroglancer-selection-details-layer-title:hover': {
    backgroundColor: '#333',
  },
  '.neuroglancer-selection-details-layer-body': {
    padding: '2px',
    display: 'flex',
    flexDirection: 'column',
  },
  '.neuroglancer-side-panel-column': {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0px',
  },
  '.neuroglancer-side-panel-row': {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '0px',
  },
  '.neuroglancer-side-panel': {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0px',
    overflow: 'hidden',
  },
  '.neuroglancer-side-panel-titlebar': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'sans-serif',
    fontSize: '10pt',
    backgroundColor: '#03c',
    padding: '2px',
    color: '#fff',
  },
  '.neuroglancer-side-panel-title': {
    flex: 1,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  '.neuroglancer-side-panel-drop-zone': { zIndex: 1000, display: 'none' },
  '[data-neuroglancer-side-panel-drag] .neuroglancer-side-panel-drop-zone': {
    display: 'block',
  },
  '.neuroglancer-resize-gutter-vertical': {
    height: '1px',
    backgroundColor: '#333',
    backgroundClip: 'content-box',
    paddingTop: '2px',
    paddingBottom: '2px',
    cursor: 'row-resize',
  },
  '.neuroglancer-resize-gutter-horizontal': {
    width: '1px',
    backgroundColor: '#333',
    backgroundClip: 'content-box',
    paddingRight: '2px',
    paddingLeft: '2px',
    cursor: 'col-resize',
  },
  '.neuroglancer-drag-status': {
    position: 'absolute',
    top: '0px',
    zIndex: 1000,
    backgroundColor: '#ff0',
    color: '#000',
    font: '10pt sans-serif',
    padding: '2px',
  },
  '.neuroglancer-icon': {
    display: 'inline-flex',
    textDecoration: 'none',
    alignSelf: 'center',
    whiteSpace: 'nowrap',
    paddingLeft: '2px',
    paddingRight: '2px',
    minWidth: '18px',
    minHeight: '18px',
    borderRadius: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    font: '12px sans-serif',
    cursor: 'pointer',
    fontWeight: 900,
    marginLeft: '1px',
    marginRight: '1px',
  },
  '.neuroglancer-icon svg': {
    width: '16px',
    height: '16px',
    fill: 'transparent',
    stroke: '#fff',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  '.neuroglancer-icon:hover': { backgroundColor: '#db4437' },
  '.neuroglancer-checkbox-icon.light-background[data-checked=true]': {
    backgroundColor: '#00000080',
  },
  '.neuroglancer-checkbox-icon.dark-background[data-checked=true]': {
    backgroundColor: '#fff3',
  },
  '.neuroglancer-image-dropdown': {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    height: '0px',
  },
  '.neuroglancer-image-dropdown .neuroglancer-shader-code-widget': {
    flexShrink: 0,
    height: '8em',
    border: '1px solid transparent',
  },
  '.neuroglancer-image-dropdown-top-row': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  '.neuroglancer-image-layer-shader-overlay .neuroglancer-shader-code-widget': {
    width: '80vw',
    height: '80vh',
  },
  '.neuroglancer-selection-details-value-grid': {
    display: 'grid',
    gridAutoRows: 'auto',
    fontFamily: 'monospace',
    fontSize: 'medium',
    alignItems: 'center',
  },
  '.neuroglancer-selection-details-value-grid-dim': {
    gridColumn: 'dim',
    color: '#ff6',
  },
  '.neuroglancer-selection-details-value-grid-dim:after': {
    content: '"="',
    color: '#aaa',
  },
  '.neuroglancer-selection-details-value-grid-coord': {
    gridColumn: 'coord',
    color: '#aaa',
    marginRight: '1ch',
  },
  '.neuroglancer-selection-details-value-grid-value': {
    gridColumn: 'value',
    userSelect: 'text',
  },
  '.neuroglancer-layer-data-sources-tab': {
    display: 'flex',
    flexDirection: 'column',
  },
  '.neuroglancer-layer-data-sources-container': {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '0px',
  },
  '.neuroglancer-layer-data-source-url-input input.autocomplete-input': {
    color: '#fff',
  },
  '.neuroglancer-layer-data-source-url-input input.autocomplete-hint': {
    color: '#aaa',
  },
  '.neuroglancer-layer-data-source-url-input .autocomplete-dropdown': {
    backgroundColor: '#333',
  },
  '.neuroglancer-layer-data-sources-source-id': { fontWeight: 'bold' },
  '.neuroglancer-layer-data-sources-source-id:not(:empty):before': {
    content: '"["',
  },
  '.neuroglancer-layer-data-sources-source-id:not(:empty):after': {
    content: '"]"',
  },
  '.neuroglancer-layer-data-sources-source-id:not(:empty)': {
    marginRight: '4px',
    color: '#0ff',
  },
  '.neuroglancer-layer-data-sources-source-messages:empty': { display: 'none' },
  '.neuroglancer-layer-data-sources-source-messages': {
    marginTop: '0',
    listStyle: 'none',
    paddingLeft: '0',
  },
  'li.neuroglancer-message': { wordWrap: 'break-word', userSelect: 'text' },
  'li.neuroglancer-message-error': { color: 'red' },
  'li.neuroglancer-message-warning': { color: '#ff0' },
  'li.neuroglancer-message-info': { color: '#ccc' },
  '.neuroglancer-layer-data-sources-source-default': {
    display: 'block',
    marginBottom: '4px',
  },
  '.neuroglancer-layer-data-sources-info-line[data-is-active=false]': {
    textDecoration: 'solid line-through #caa',
  },
  '.neuroglancer-layer-data-sources-tab-type-detection': {
    position: 'sticky',
    bottom: '0px',
    backgroundColor: '#ff9',
    color: '#000',
    textAlign: 'center',
    cursor: 'pointer',
  },
  '.neuroglancer-layer-data-sources-tab-type-detection:hover': {
    backgroundColor: '#ffc',
  },
  '.neuroglancer-layer-data-sources-tab-type-detection-type': {
    fontWeight: 'bold',
  },
  '.neuroglancer-coordinate-space-transform-widget': {
    display: 'grid',
    justifyItems: 'stretch',
  },
  '.neuroglancer-coordinate-space-transform-widget input': {
    fontFamily: 'monospace',
    justifySelf: 'stretch',
    backgroundColor: '#000',
    color: '#fff',
    padding: '2px',
  },
  '.neuroglancer-coordinate-space-transform-widget *[data-will-be-deleted=true]': {
    color: '#666',
  },
  '.neuroglancer-coordinate-space-transform-label': {
    fontStyle: 'italic',
    color: '#fcc',
    alignSelf: 'center',
  },
  '.neuroglancer-coordinate-space-transform-input-lower-label': {
    gridRow: 'sourceLower',
    gridColumn: 'outputLabel / sourceDim 1',
  },
  '.neuroglancer-coordinate-space-transform-translation-label': {
    gridRow: 'sourceLabel / outputDim 1',
    gridColumn: 'sourceDim -1',
    writingMode: 'vertical-lr',
    textOrientation: 'mixed',
    alignSelf: 'end',
    justifySelf: 'center',
    marginBottom: '2px',
  },
  '.neuroglancer-coordinate-space-transform-input-lower-label, .neuroglancer-coordinate-space-transform-input-upper-label, .neuroglancer-coordinate-space-transform-input-scale-label': {
    textAlign: 'right',
    marginRight: '4px',
  },
  '.neuroglancer-coordinate-space-transform-input-upper-label': {
    gridRow: 'sourceUpper',
    gridColumn: 'headerStart / headerEnd',
  },
  '.neuroglancer-coordinate-space-transform-input-scale-label': {
    gridRow: '5',
    gridColumn: 'headerStart / headerEnd',
  },
  '.neuroglancer-coordinate-space-transform-source-label': {
    gridRow: 'sourceLabel',
    gridColumn: 'sourceDim 1 / sourceDim -1',
    textAlign: 'center',
  },
  '.neuroglancer-coordinate-space-transform-output-label': {
    gridRow: 'outputDim 1 / outputDim -1',
    gridColumn: 'outputLabel',
    writingMode: 'vertical-lr',
    textOrientation: 'mixed',
    alignSelf: 'center',
    justifySelf: 'end',
    marginRight: '2px',
  },
  '.neuroglancer-coordinate-space-transform-input-name': {
    textAlign: 'center',
  },
  '.neuroglancer-coordinate-space-transform-input-name, input.neuroglancer-coordinate-space-transform-output-name': {
    fontFamily: 'monospace',
    color: '#ff6',
  },
  '.neuroglancer-coordinate-space-transform-scale': { textAlign: 'right' },
  '.neuroglancer-coordinate-space-transform-input-bounds, .neuroglancer-coordinate-space-transform-output-bounds': {
    whiteSpace: 'nowrap',
    fontFamily: 'monospace',
    fontSize: 'small',
    textAlign: 'right',
    paddingLeft: '2px',
    paddingRight: '2px',
    color: '#aff',
  },
  '.neuroglancer-coordinate-space-transform-input-bounds.neuroglancer-coordinate-space-transform-singleton:not(*[data-will-be-deleted="true"])': {
    color: '#fa6',
  },
  '.neuroglancer-coordinate-space-transform-widget input[data-is-valid=false], .neuroglancer-coordinate-space-transform-widget input[data-is-valid=false]::placeholder': {
    textDecoration: 'solid underline red',
  },
  '.neuroglancer-coordinate-space-transform-output-extend': {
    gridRow: 'outputDim -1',
    gridColumn: 'outputNames',
    display: 'flex',
    flexDirection: 'column',
  },
  '.neuroglancer-coordinate-space-transform-output-extend input': {
    alignSelf: 'stretch',
  },
  '.neuroglancer-coordinate-space-transform-output-extend[data-is-active=false] input': {
    display: 'none',
  },
  '.neuroglancer-coordinate-space-transform-output-extend[data-is-active=true] .neuroglancer-icon': {
    display: 'none',
  },
  '.neuroglancer-coordinate-space-transform-output-extend .neuroglancer-icon': {
    alignSelf: 'start',
  },
  '.neuroglancer-coordinate-space-transform-translation-coeff': {
    marginLeft: '3px',
  },
  '.neuroglancer-coordinate-space-transform-output-scale-container': {
    marginRight: '3px',
  },
  '.neuroglancer-coordinate-space-transform-input-scale-container, .neuroglancer-coordinate-space-transform-input-scale-label': {
    marginBottom: '3px',
  },
  '.neuroglancer-coordinate-space-transform-widget input, .neuroglancer-coordinate-space-transform-output-name-container, .neuroglancer-coordinate-space-transform-scale-container': {
    border: '1px solid #333',
  },
  '.neuroglancer-coordinate-space-transform-widget .neuroglancer-coordinate-space-transform-output-name, .neuroglancer-coordinate-space-transform-widget .neuroglancer-coordinate-space-transform-scale': {
    border: '0px',
  },
  '.neuroglancer-coordinate-space-transform-output-name-container': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginRight: '3px',
  },
  '.neuroglancer-coordinate-space-transform-scale-container': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  '.neuroglancer-coordinate-space-transform-scale-suggestion': {
    fontFamily: 'monospace',
    cursor: 'pointer',
    borderRadius: '20%',
    border: '1px solid #333',
    alignSelf: 'flex-end',
    margin: '2px',
    color: '#aaa',
  },
  '.neuroglancer-coordinate-space-transform-scale-suggestion svg': {
    width: '16px',
    height: '16px',
    fill: 'transparent',
    stroke: '#aaa',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  '.neuroglancer-coordinate-space-transform-scale-suggestion:hover': {
    backgroundColor: '#db4437',
    border: '1px solid transparent',
    color: '#fff',
  },
  '.neuroglancer-coordinate-space-transform-scale-suggestion:hover svg': {
    stroke: '#fff',
  },
  '.neuroglancer-coordinate-space-transform-widget-reset-buttons': {
    gridRow: 'outputDim -1',
    gridColumn: 'headerEnd / -1',
    justifySelf: 'start',
  },
  '.neuroglancer-multiline-autocomplete': {
    marginTop: '2px',
    padding: '2px',
    position: 'relative',
    backgroundColor: '#222',
  },
  '.neuroglancer-multiline-autocomplete-hint, .neuroglancer-multiline-autocomplete-input': {
    fontFamily: 'monospace',
    color: '#fff',
    wordWrap: 'break-word',
  },
  '.neuroglancer-multiline-autocomplete-input:focus': { outline: '0px' },
  '.neuroglancer-multiline-autocomplete-input:not(:focus):empty:before': {
    content: 'attr(data-placeholder)',
    color: '#aaa',
  },
  '.neuroglancer-multiline-autocomplete-hint': { color: '#aaa' },
  '.neuroglancer-multiline-autocomplete-hint, .neuroglancer-multiline-autocomplete-input, .neuroglancer-multiline-autocomplete-completion': {
    fontFamily: 'monospace',
    fontSize: 'medium',
  },
  '.neuroglancer-multiline-autocomplete-dropdown': {
    color: '#fff',
    backgroundColor: '#181818',
    position: 'fixed',
    display: 'block',
    outline: '0',
    margin: '0',
    padding: '0',
    left: '0px',
    right: '0px',
    textAlign: 'left',
    cursor: 'default',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#aaa',
    overflowY: 'scroll',
    wordWrap: 'break-word',
  },
  '.neuroglancer-multiline-autocomplete-completion:nth-of-type(even):not(.neuroglancer-multiline-autocomplete-completion-active)': {
    backgroundColor: '#2b2b2b',
  },
  '.neuroglancer-multiline-autocomplete-completion:hover': {
    outline: '1px solid #ddd',
  },
  '.neuroglancer-multiline-autocomplete-completion-active': {
    backgroundColor: '#666',
  },
  '.neuroglancer-multiline-autocomplete-completion-description': {
    fontStyle: 'italic',
    color: '#f9f',
  },
  '.neuroglancer-tab-view': { display: 'flex', flexDirection: 'column' },
  '.neuroglancer-tab-view-bar': {
    display: 'block',
    backgroundColor: '#333',
    borderBottom: '1px solid white',
  },
  '.neuroglancer-tab-label': {
    display: 'inline-block',
    borderTop: '1px solid transparent',
    borderLeft: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderBottom: 'none',
    marginRight: '4px',
    paddingTop: '1px',
    paddingLeft: '2px',
    paddingRight: '2px',
    font: '10pt sans-serif',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  '.neuroglancer-tab-label:hover': { color: '#daa520' },
  '.neuroglancer-tab-label.neuroglancer-selected-tab-label': {
    backgroundColor: '#000',
    borderTop: '1px solid white',
    borderLeft: '1px solid white',
    borderRight: '1px solid white',
    borderBottom: '1px solid black',
    paddingBottom: '1px',
    marginBottom: '-1px',
  },
  '.neuroglancer-stack-view': { display: 'contents' },
  '.neuroglancer-tab-view>.neuroglancer-stack-view>.neuroglancer-tab-content': {
    flex: 1,
    flexBasis: '0px',
    height: '0px',
    minHeight: '0px',
    padding: '2px',
  },
  '.neuroglancer-tool-key-binding': {
    display: 'inline-block',
    color: '#0ff',
    font: '9pt monospace',
    whiteSpace: 'pre',
  },
  '.neuroglancer-tool-key-binding:hover': { outline: '1px solid #fff' },
  '.neuroglancer-tool-key-binding:before': { content: '"["' },
  '.neuroglancer-tool-key-binding:after': { content: '"]"' },
  '.neuroglancer-tool-key-binding:before, .neuroglancer-tool-key-binding:after': {
    color: '#999',
  },
  '.neuroglancer-tool-button': { display: 'inline-flex', flexDirection: 'row' },
  '#statusContainer li.neuroglancer-tool-status': { maxHeight: '50vh' },
  '.neuroglancer-tool-status-bindings': { backgroundColor: '#333' },
  '.neuroglancer-tool-status-content': {
    display: 'flex',
    flexDirection: 'row',
  },
  '.neuroglancer-tool-status-header-container': {
    backgroundColor: '#555',
    width: 'min-content',
    padding: '3px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  '.neuroglancer-tool-status-header': { alignSelf: 'center' },
  '.neuroglancer-tool-status-body': { flex: 1, padding: '2px' },
  '.neuroglancer-viewer': { outline: '0px' },
  '.neuroglancer-viewer-top-row': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    marginBottom: '3px',
    paddingRight: '2px',
  },
  '.neuroglancer-viewer-side-panel': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    maxWidth: '80%',
    color: '#fff',
  },
  '.neuroglancer-noselect': {
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    KhtmlUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none',
  },
  '.neuroglancer-select-text': {
    WebkitTouchCallout: 'default',
    WebkitUserSelect: 'text',
    KhtmlUserSelect: 'text',
    MozUserSelect: 'text',
    msUserSelect: 'text',
    userSelect: 'text',
  },
  '.neuroglancer-data-panel-layout-controls': {
    position: 'absolute',
    top: '2px',
    right: '2px',
    display: 'flex',
    alignItems: 'start',
  },
  '.neuroglancer-data-panel-layout-controls>button': {
    display: 'flex',
    margin: '2px',
    border: ['0px', '1px solid white'],
    backgroundColor: '#00000080',
    flexDirection: 'row',
    alignSelf: 'top',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    width: '18px',
    height: '18px',
    color: '#fff',
  },
  '.neuroglancer-data-panel-layout-controls>button>div': {
    display: 'inline-block',
    textAlign: 'center',
    lineHeight: '12px',
    width: '15px',
    height: '15px',
  },
  '.neuroglancer-data-panel-layout-controls>button:hover': { color: '#6ff' },
  'label.perspective-panel-show-slice-views': {
    pointerEvents: 'none',
    position: 'absolute',
    right: '2px',
    bottom: '2px',
    fontFamily: 'sans-serif',
    fontSize: 'small',
  },
  'input.perspective-panel-show-slice-views': { pointerEvents: 'all' },
  '.neuroglancer-rendered-data-panel': {
    cursor: 'crosshair',
    position: 'relative',
    outline: '0',
    touchAction: 'none',
    color: '#fff',
    textAlign: 'left',
  },
  '.neuroglancer-display-dimensions-widget': {
    position: 'absolute',
    cursor: 'default',
    top: '2px',
    left: '2px',
    backgroundColor: '#0000004d',
  },
  '.neuroglancer-display-dimensions-widget-dimension-grid': {
    display: 'grid',
    gridTemplateRows: '0fr 0fr 0fr 0fr',
    gridTemplateColumns: '0fr 0fr 0fr',
  },
  '.neuroglancer-display-dimensions-widget input': {
    outline: '0px',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    margin: '0',
    border: '0',
    padding: '2px',
  },
  '.neuroglancer-display-dimensions-widget input, .neuroglancer-display-dimensions-widget': {
    fontFamily: 'monospace',
    color: '#fff',
  },
  '.neuroglancer-display-dimensions-widget-dimension:hover': {
    outline: '1px solid black',
  },
  '.neuroglancer-display-dimensions-widget-name[data-is-valid=false]': {
    textDecoration: 'solid underline red',
  },
  '.neuroglancer-display-dimensions-widget-scale-factor': {
    textAlign: 'right',
    alignItems: 'end',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    marginLeft: '2px',
  },
  '.neuroglancer-display-dimensions-widget-scale': {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    paddingLeft: '10px',
    textAlign: 'right',
    marginLeft: '5px',
  },
  '.neuroglancer-display-dimensions-widget-scale:not(:empty):before': {
    content: '"("',
  },
  '.neuroglancer-display-dimensions-widget-scale:not(:empty):after': {
    content: '")"',
  },
  '.neuroglancer-display-dimensions-widget-scale-factor:after': {
    content: '"\\d7"',
  },
  '.neuroglancer-display-dimensions-widget:not(:hover):not([data-active="true"]) .neuroglancer-display-dimensions-widget-scale-factor, .neuroglancer-display-dimensions-widget:not(:hover):not([data-active="true"]) .neuroglancer-display-dimensions-widget-scale, .neuroglancer-display-dimensions-widget:not(:hover):not([data-active="true"]) .neuroglancer-display-dimensions-widget-default, .neuroglancer-display-dimensions-widget:not(:hover):not([data-active="true"]) .neuroglancer-depth-range-widget-grid, .neuroglancer-display-dimensions-widget:not(:hover):not([data-active="true"]) .neuroglancer-depth-range-relative-checkbox-label': {
    display: 'none',
  },
  '.neuroglancer-display-dimensions-widget-dimension[data-is-modified=true] .neuroglancer-display-dimensions-widget-scale-factor, .neuroglancer-display-dimensions-widget-dimension[data-is-modified=true] .neuroglancer-display-dimensions-widget-scale': {
    visibility: 'hidden',
  },
  '.neuroglancer-display-dimensions-widget *:focus': { outline: '0px' },
  '.neuroglancer-display-dimensions-widget-default': {
    gridRow: '4',
    gridColumnStart: '1',
    gridColumnEnd: '3',
    display: 'inline-block',
    whiteSpace: 'nowrap',
  },
  '.neuroglancer-display-dimensions-widget-default input': {
    marginRight: '3px',
  },
  '.neuroglancer-depth-range-widget-grid': {
    marginTop: '1em',
    display: 'grid',
    gridTemplateColumns: '0fr 0fr 0fr',
    gridAutoRows: '0fr',
  },
  '.neuroglancer-depth-range-widget-dimension-names:not(:empty):before': {
    content: '"("',
  },
  '.neuroglancer-depth-range-widget-dimension-names:not(:empty):after': {
    content: '")"',
  },
  '.neuroglancer-depth-range-widget-dimension-names': {
    marginLeft: '1ch',
    whiteSpace: 'nowrap',
  },
  '.neuroglancer-help-body': {
    flexBasis: '0px',
    flex: 1,
    height: '0px',
    minHeight: '0px',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  '.neuroglancer-help-scroll-container': {
    flex: 1,
    flexBasis: '0px',
    position: 'relative',
    overflow: 'auto',
  },
  '.neuroglancer-help-scroll-container div+h2': { marginTop: '1em' },
  '.neuroglancer-help-scroll-container h2': {
    fontSize: '10pt',
    padding: '4px',
    position: 'sticky',
    top: '0',
    backgroundColor: '#333',
    marginTop: '0',
  },
  '.neuroglancer-help-scroll-container .dt': {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#ff0',
  },
  '.neuroglancer-help-scroll-container .dd': {
    fontSize: '10pt',
    marginLeft: '4ex',
  },
  '.neuroglancer-layout-split-drop-zone': {
    position: 'absolute',
    zIndex: 1000,
  },
  '.neuroglancer-drag-over': { backgroundColor: '#0000ff80' },
  '.neuroglancer-stack-layout-row>.neuroglancer-stack-layout-drop-placeholder': {
    paddingLeft: '4px',
    paddingRight: '4px',
    width: '1px',
  },
  '.neuroglancer-stack-layout-column>.neuroglancer-stack-layout-drop-placeholder': {
    paddingTop: '4px',
    paddingBottom: '4px',
    height: '1px',
  },
  '.neuroglancer-stack-layout-drop-placeholder': {
    backgroundClip: 'content-box',
    backgroundColor: '#666',
    zIndex: 1,
  },
  '.neuroglancer-stack-layout-drop-placeholder.neuroglancer-drag-over': {
    backgroundClip: 'border-box',
    backgroundColor: '#8080ff80',
  },
  '.neuroglancer-stack-layout-drop-placeholder:first-of-type, .neuroglancer-stack-layout-drop-placeholder:last-of-type': {
    display: 'none',
  },
  '.neuroglancer-panel': { flex: 1 },
  '.neuroglancer-show-panel-borders .neuroglancer-panel': {
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: '2px',
  },
  '.neuroglancer-panel:focus-within': { borderColor: '#fff' },
  '.neuroglancer-layer-group-viewer': { outline: '0px' },
  '.neuroglancer-layer-group-viewer-context-menu': {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  '.neuroglancer-layer-group-viewer-context-menu label': {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  '.neuroglancer-layer-group-viewer-context-menu select:before': {
    flex: 1,
    content: '" "',
  },
  '.neuroglancer-layer-group-viewer-context-menu select': { marginLeft: '5px' },
  '.neuroglancer-context-menu': {
    position: 'absolute',
    zIndex: 100,
    border: '1px solid white',
    backgroundColor: '#000',
    boxShadow: '5px 5px 2px 1px #00000080',
    fontFamily: 'sans-serif',
    fontSize: '11pt',
    padding: '5px',
    color: '#fff',
    outline: '0px',
  },
  ':root': {
    '--layer-number-color': '#9a7518',
    '--neuroglancer-segment-list-width': 'auto',
  },
  '.neuroglancer-layer-panel': {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    marginLeft: '-5px',
    marginTop: '-1px',
    zIndex: -0.1,
    overflow: 'hidden',
  },
  '.neuroglancer-layer-item': {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    cursor: 'pointer',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ccc',
    fontFamily: 'sans-serif',
    fontSize: '10pt',
    backgroundColor: '#000',
    padding: '1px',
  },
  '.neuroglancer-layer-item, .neuroglancer-layer-add-button': {
    margin: '1px 1px 1px 5px',
  },
  '.neuroglancer-layer-item[data-selected=true]': { borderColor: '#8c8' },
  '.neuroglancer-layer-item[data-selected=true]:hover': { borderColor: '#3c3' },
  '.neuroglancer-layer-item:hover': { borderColor: '#daa520' },
  '.neuroglancer-layer-item[data-pick=true] .neuroglancer-layer-item-label': {
    backgroundColor: '#939',
  },
  '.neuroglancer-layer-item-label': {
    display: 'inline-block',
    position: 'relative',
    backgroundColor: '#222',
    paddingRight: '3px',
  },
  '.neuroglancer-layer-item-number': {
    display: 'inline-block',
    backgroundColor: 'var(--layer-number-color)',
    fontWeight: 'bold',
    paddingLeft: '1px',
    paddingRight: '1px',
  },
  '.neuroglancer-layer-panel[data-show-hover-values=true] .neuroglancer-layer-item-value': {
    display: 'inline-block',
    fontFamily: 'monospace',
    fontSize: 'medium',
    maxWidth: '50ch',
    marginLeft: '1ch',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipses',
    textAlign: 'center',
  },
  '.neuroglancer-layer-panel[data-show-hover-values=false] .neuroglancer-layer-item-value': {
    display: 'none',
  },
  '.neuroglancer-layer-item[data-visible=false] .neuroglancer-layer-item-label': {
    textDecoration: 'line-through',
  },
  '.neuroglancer-layer-item[data-visible=false]': { color: '#bbb' },
  '.neuroglancer-layer-panel-drop-zone': { display: 'inline-block', flex: 1 },
  '.neuroglancer-layer-item-visible-progress, .neuroglancer-layer-item-prefetch-progress': {
    position: 'absolute',
    left: '0px',
    height: '2px',
    backgroundColor: '#666',
  },
  '.neuroglancer-layer-item-visible-progress': { top: '0px' },
  '.neuroglancer-layer-item-prefetch-progress': { bottom: '0px' },
  '.neuroglancer-layer-item-value-container': {
    display: 'grid',
    gridTemplateColumns: 'min-content',
    alignItems: 'center',
  },
  '.neuroglancer-layer-item-value': {
    gridRow: '1',
    gridColumn: '1',
    visibility: 'visible',
  },
  '.neuroglancer-layer-item-button-container': {
    gridRow: '1',
    gridColumn: '1',
    whiteSpace: 'nowrap',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    visibility: 'hidden',
    justifySelf: 'right',
  },
  '.neuroglancer-layer-panel:hover .neuroglancer-layer-item-value': {
    visibility: 'hidden',
  },
  '.neuroglancer-layer-panel:hover .neuroglancer-layer-item-button-container': {
    visibility: 'visible',
  },
  '.neuroglancer-position-widget': {
    display: 'inline-flex',
    alignItems: 'center',
  },
  '.neuroglancer-position-widget input:disabled': { pointerEvents: 'none' },
  '.neuroglancer-position-widget .neuroglancer-copy-button:first-of-type': {
    display: 'none',
  },
  '.neuroglancer-position-dimension-coordinate, .neuroglancer-position-dimension-name, .neuroglancer-position-dimension-scale': {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    border: '0',
    margin: '0',
    fontFamily: 'monospace',
    fontSize: 'medium',
  },
  '.neuroglancer-position-dimension[data-coordinate-array=valid] .neuroglancer-position-dimension-scale': {
    display: 'none',
  },
  '.neuroglancer-position-dimension[data-coordinate-array=invalid] .neuroglancer-position-dimension-scale': {
    textDecorationLine: 'underline',
    textDecorationStyle: 'wavy',
    textDecorationColor: 'red',
  },
  '.neuroglancer-position-dimension-coordinate': { color: '#fff' },
  '.neuroglancer-position-widget input:invalid, .neuroglancer-position-widget input::placeholder, .neuroglancer-position-widget input[data-is-valid=false]': {
    textDecoration: 'solid underline red',
  },
  '.neuroglancer-position-widget *:focus': { outline: '0px' },
  '.neuroglancer-position-dimension[data-dropdown-visible=true]:after': {
    content: '""',
    display: 'block',
    left: '0px',
    right: '0px',
    bottom: '-1px',
    position: 'absolute',
    borderBottom: '1px solid black',
    zIndex: 100,
    height: '0px',
  },
  '.neuroglancer-position-dimension-dropdown, .neuroglancer-position-dimension-coordinate-dropdown': {
    position: 'absolute',
    minWidth: 'calc(100% + 2px)',
    border: '1px solid #aaa',
    boxSizing: 'border-box',
    padding: '2px',
    left: '-1px',
    zIndex: 100,
    backgroundColor: '#000',
  },
  '.neuroglancer-position-dimension-dropdown': {
    display: 'grid',
    gridTemplateAreas: '"labels . graph"',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '0fr 3px 0fr',
  },
  '.neuroglancer-position-dimension-coordinate-dropdown': {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  '.neuroglancer-dimension-dropdown-coordinate-entry': {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  '.neuroglancer-dimension-dropdown-coordinate-entry:hover': {
    backgroundColor: '#333',
  },
  '.neuroglancer-dimension-dropdown-coordinate-label': {
    width: 'var(--neuroglancer-coordinate-label-width)',
    color: '#0ff',
  },
  '.neuroglancer-position-dimension-dropdown:focus, .neuroglancer-position-dimension-coordinate-dropdown:focus': {
    outline: '0px',
  },
  '.neuroglancer-position-dimension-dropdown-lowerbound, .neuroglancer-position-dimension-dropdown-upperbound, .neuroglancer-position-dimension-dropdown-hoverposition': {
    gridArea: 'labels',
    textAlign: 'right',
  },
  '.neuroglancer-position-dimension-dropdown canvas': {
    marginTop: '.5em',
    marginBottom: '.5em',
    gridArea: 'graph',
  },
  '.neuroglancer-position-dimension:focus-within, .neuroglancer-position-dimension[data-dropdown-visible=true]': {
    border: '1px solid #aaa',
    backgroundColor: '#000',
  },
  '.neuroglancer-position-dimension': {
    border: '1px solid transparent',
    position: 'relative',
    display: 'inline-block',
    fontFamily: 'monospace',
    fontSize: 'medium',
    whiteSpace: 'nowrap',
  },
  '.neuroglancer-position-dimension-name': {
    color: '#ff6',
    paddingLeft: '2px',
  },
  '.neuroglancer-position-dimension-scale-container[data-is-empty=false]:before': {
    content: '"("',
    color: '#aaa',
  },
  '.neuroglancer-position-dimension-scale-container[data-is-empty=false]:after': {
    content: '")"',
    color: '#aaa',
  },
  '.neuroglancer-position-dimension-scale-container[data-is-empty=false]': {
    marginRight: '5px',
  },
  '.neuroglancer-position-dimension-scale': { color: '#bbb' },
  '.neuroglancer-position-dimension-scale-container': {
    marginRight: '2px',
    marginLeft: '4px',
  },
  '.neuroglancer-mouse-position-widget': {
    marginLeft: '1ch',
    verticalAlign: 'center',
    fontFamily: 'monospace',
    fontSize: 'medium',
    color: 'orange',
    whiteSpace: 'pre',
  },
  '.neuroglancer-position-dimension-coordinate-label': {
    display: 'inline-block',
    color: '#0ff',
  },
  '.neuroglancer-position-dimension-coordinate-label:not(:empty):before': {
    content: '"["',
    color: '#aaa',
  },
  '.neuroglancer-position-dimension-coordinate-label:not(:empty):after': {
    content: '"]"',
    color: '#aaa',
  },
  '.neuroglancer-layer-list-panel-items': {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    height: '0px',
    minHeight: '0px',
    flexBasis: '0px',
  },
  '.neuroglancer-layer-list-panel-item': {
    display: 'flex',
    flexDirection: 'row',
    padding: '2px',
    border: '1px solid #aaa',
    margin: '2px',
  },
  '.neuroglancer-layer-list-panel-item[data-selected=true]': {
    borderColor: '#3c3',
  },
  '.neuroglancer-layer-list-panel-item[data-archived=true]': {
    borderColor: '#666',
  },
  '.neuroglancer-layer-list-panel-item[data-archived=true] .neuroglancer-layer-side-panel-name, .neuroglancer-layer-list-panel-item[data-archived=true] .neuroglancer-icon svg': {
    color: '#999',
    stroke: '#999',
  },
  '.neuroglancer-layer-list-panel-item:hover': { backgroundColor: '#333' },
  '.neuroglancer-layer-list-panel-item-number': {
    fontFamily: 'sans-serif',
    backgroundColor: 'var(--layer-number-color)',
    color: '#fff',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  '.neuroglancer-layer-list-panel-item:not(:hover)>.neuroglancer-layer-list-panel-item-delete': {
    display: 'none',
  },
  '.neuroglancer-layer-list-panel-item:not(:hover)>.neuroglancer-layer-list-panel-item-controls': {
    display: 'none',
  },
  '[data-neuroglancer-layer-panel-pinned=false] .neuroglancer-side-panel-titlebar.neuroglancer-layer-side-panel-title': {
    backgroundColor: '#393',
  },
  '[data-neuroglancer-layer-visible=false] .neuroglancer-side-panel-titlebar.neuroglancer-layer-side-panel-title input': {
    textDecoration: 'line-through',
  },
  '.neuroglancer-layer-side-panel-name': {
    flex: 1,
    backgroundColor: 'transparent',
    border: '0px',
    color: '#fff',
    outline: '0px',
    width: '0px',
    minWidth: '0px',
  },
  '.neuroglancer-layer-side-panel-tab-view': {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    font: '10pt sans-serif',
  },
  '.neuroglancer-layer-side-panel-type-measure': {
    position: 'absolute',
    visibility: 'hidden',
    top: '0px',
    height: 'auto',
    width: 'auto',
    whiteSpace: 'nowrap',
  },
  '.neuroglancer-layer-side-panel-type, .neuroglancer-layer-side-panel-type-measure': {
    paddingLeft: '3px',
    paddingRight: '3px',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    fontSize: '10pt',
    boxSizing: 'border-box',
  },
  '.neuroglancer-layer-side-panel-type': {
    WebkitAppearance: 'none',
    color: '#fff',
    cursor: 'pointer',
    backgroundColor: '#00000080',
    marginRight: '5px',
    border: '0px',
    outline: '0px',
  },
  '.neuroglancer-layer-side-panel-type option': { backgroundColor: '#000' },
  '.neuroglancer-statistics-panel-body': {
    flex: 1,
    flexBasis: '0px',
    minWidth: '0px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    font: '10pt sans-serif',
  },
  '.neuroglancer-statistics-panel-body>table': {
    position: 'relative',
    flex: 1,
    width: '100%',
  },
  '.neuroglancer-statistics-panel-body>table>thead td': {
    position: 'sticky',
    top: '0px',
    zIndex: 2,
    backgroundColor: '#333',
    fontWeight: 'bold',
  },
  '.neuroglancer-statistics-panel-body>table>tbody tr:hover': {
    backgroundColor: '#336',
  },
  '.neuroglancer-settings-body': {
    flexBasis: '0px',
    flex: 1,
    height: '0px',
    minHeight: '0px',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '10pt',
  },
  '.neuroglancer-settings-body input[type=text], .neuroglancer-settings-body input[type=number]': {
    backgroundColor: '#333',
    color: '#fff',
    border: '0px',
  },
  '.neuroglancer-settings-scroll-container': {
    flex: 1,
    flexBasis: '0px',
    position: 'relative',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  '.neuroglancer-settings-scroll-container>*': { marginTop: '3px' },
  '.neuroglancer-settings-title': { alignSelf: 'stretch' },
  '.neuroglancer-settings-scroll-container>label': {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  '.neuroglancer-settings-scroll-container>label>input:before': {
    flex: 1,
    content: '" "',
  },
  '.neuroglancer-settings-scroll-container>label>input': {
    marginLeft: '5px',
    width: '11ch',
  },
  '.neuroglancer-settings-limit-widget>input': { width: '11ch' },
  '.neuroglancer-annotation-tool-status': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    overflowX: 'scroll',
    scrollbarWidth: 'none',
  },
  '.neuroglancer-annotation-tool-status::-webkit-scrollbar': {
    display: 'none',
  },
  '.neuroglancer-annotation-tool-status-widget+.neuroglancer-annotation-tool-status-widget': {
    marginLeft: '3px',
  },
  '.neuroglancer-annotation-tool-status-widget:hover': {
    outline: '1px solid #fff',
  },
  '.neuroglancer-annotation-tool-status-widget': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  '.neuroglancer-annotation-tool-status-widget-layer-number': {
    display: 'inline-block',
    font: '10pt sans-serif',
    fontWeight: 'bold',
    backgroundColor: '#9a7518',
  },
  '.neuroglancer-annotation-tool-status-widget-key': {
    display: 'inline-block',
    font: '9pt monospace',
    color: '#0ff',
  },
  '.neuroglancer-annotation-tool-status-widget-key:before': { content: '"["' },
  '.neuroglancer-annotation-tool-status-widget-key:after': { content: '"]"' },
  '.neuroglancer-annotation-tool-status-widget-key:before, .neuroglancer-annotation-tool-status-widget-key:after': {
    color: '#999',
  },
  '.neuroglancer-annotation-tool-status-widget-description': {
    display: 'inline-block',
    color: '#3c3',
    font: '10pt sans-serif',
    whiteSpace: 'nowrap',
  },
  '.neuroglancer-annotation-tool-status-widget-delete': {
    visibility: 'hidden',
  },
  '.neuroglancer-annotation-tool-status-widget:hover>.neuroglancer-annotation-tool-status-widget-delete': {
    visibility: 'inherit',
  },
  '.neuroglancer-annotations-tab': {
    display: 'flex',
    alignItems: 'stretch',
    flex: 1,
    flexDirection: 'column',
  },
  '.neuroglancer-annotation-list': {
    position: 'relative',
    margin: '2px 0 0',
    padding: '0',
    overflowY: 'auto',
    height: '0px',
    flex: 1,
    flexBasis: '0px',
    minHeight: '0px',
  },
  '.neuroglancer-annotation-list-entry': {
    display: 'grid',
    gridAutoRows: 'min-content',
    cursor: 'pointer',
    justifyContent: 'start',
  },
  '.neuroglancer-annotation-position': { display: 'contents' },
  '.neuroglancer-annotation-layer-view': {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'stretch',
  },
  '.neuroglancer-annotation-list-header': {
    gridAutoRows: 'min-content',
    display: 'grid',
    paddingBottom: '2px',
    justifyContent: 'start',
  },
  '.neuroglancer-annotation-coordinate': {
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  '.neuroglancer-annotation-icon': {
    gridColumn: 'symbol',
    paddingRight: '5px',
  },
  '.neuroglancer-annotation-description': {
    gridColumn: 'dim / -1',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  '.neuroglancer-annotation-list-entry-delete': {
    gridColumn: 'delete',
    marginLeft: '1ch',
    alignSelf: 'start',
    visibility: 'hidden',
  },
  '.neuroglancer-annotation-list-entry:hover>.neuroglancer-annotation-list-entry-delete': {
    visibility: 'visible',
  },
  '.neuroglancer-annotation-hover': { backgroundColor: '#333' },
  '.neuroglancer-annotation-selected': { backgroundColor: '#939' },
  '.neuroglancer-annotation-hover.neuroglancer-annotation-selected': {
    backgroundColor: '#969',
  },
  '.neuroglancer-tab-content.neuroglancer-annotation-details': {
    flex: '0 0 auto',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    WebkitTouchCallout: 'default',
    WebkitUserSelect: 'text',
    KhtmlUserSelect: 'text',
    MozUserSelect: 'text',
    msUserSelect: 'text',
    userSelect: 'text',
  },
  '.neuroglancer-annotation-details-title': {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#03c',
    alignSelf: 'stretch',
    padding: '2px',
  },
  '.neuroglancer-voxel-coordinates-link': { cursor: 'pointer' },
  '.neuroglancer-voxel-coordinates-link:hover': { backgroundColor: '#db4437' },
  '.neuroglancer-annotation-details-icon': {
    display: 'inline-block',
    marginRight: '5px',
  },
  '.neuroglancer-annotation-details-title-text': {
    display: 'inline-block',
    flex: 1,
  },
  'textarea.neuroglancer-annotation-details-description': {
    alignSelf: 'stretch',
    backgroundColor: '#222',
    color: '#fff',
    font: '10pt sans-serif',
    border: '0px',
    outline: '0px',
    resize: 'none',
    overflowY: 'scroll',
  },
  'div.neuroglancer-annotation-details-description': {
    alignSelf: 'stretch',
    color: '#fff',
    font: '10pt sans-serif',
  },
  '.neuroglancer-annotation-toolbox': {
    display: 'flex',
    alignItems: 'stretch',
  },
  '.neuroglancer-annotation-segment-item': {
    color: '#000',
    backgroundColor: '#fff',
  },
  '.neuroglancer-annotations-view-dimension': {
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  '.neuroglancer-annotations-view-dimension-name': { color: '#ff6' },
  '.neuroglancer-annotations-view-dimension-scale': { color: '#bbb' },
  '.neuroglancer-annotations-view-dimension-scale:not(:empty):before': {
    content: '"("',
    marginLeft: '1ch',
  },
  '.neuroglancer-annotations-view-dimension-scale:not(:empty):after': {
    content: '")"',
  },
  '.neuroglancer-annotation-relationship-label, .neuroglancer-annotation-property-label': {
    marginRight: '5px',
  },
  '.neuroglancer-selected-annotation-details-position-grid': {
    display: 'grid',
    gridAutoRows: 'auto',
    fontFamily: 'monospace',
    fontSize: 'medium',
    gridAutoFlow: 'dense',
  },
  '.neuroglancer-selected-annotation-details-icon': {
    gridRows: '1 / -1',
    gridColumn: 'icon',
    alignSelf: 'start',
  },
  '.neuroglancer-selected-annotation-details-delete': {
    gridRows: '1 / -1',
    gridColumn: 'delete',
    alignSelf: 'start',
  },
  '.neuroglancer-selected-annotation-details-position-dim': {
    color: '#ff6',
    marginLeft: '1ch',
  },
  '.neuroglancer-selected-annotation-details-position-coord': {
    textAlign: 'right',
    marginLeft: '.5ch',
  },
  '.neuroglancer-related-segment-list-title': {
    fontFamily: 'sans-serif',
    fontSize: 'small',
    backgroundColor: '#333',
  },
  '.neuroglancer-related-segment-list-header': {
    display: 'flex',
    flexDirection: 'row',
  },
  '.neuroglancer-annotation-property': {
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'sans-serif',
    fontSize: 'small',
  },
  '.neuroglancer-annotation-property-label': { color: '#999' },
  '.neuroglancer-annotation-property-value': {
    textAlign: 'right',
    fontFamily: 'monospace',
    fontSize: 'medium',
    flex: 1,
  },
  'input.neuroglancer-segment-list-entry-id': {
    outline: '0px',
    border: '0px',
    textAlign: 'left',
  },
  '.neuroglancer-segment-list-entry-new>.neuroglancer-segment-list-entry-copy': {
    visibility: 'hidden',
  },
  '.neuroglancer-segment-list-entry-new>input[type=checkbox]': {
    visibility: 'hidden',
  },
  '.neuroglancer-segment-list-entry-delete': { order: 0 },
  '.neuroglancer-selection-annotation-status': {
    fontFamily: 'sans-serif',
    fontSize: 'small',
  },
  '.neuroglancer-channel-dimensions-widget-dim': { display: 'contents' },
  '.neuroglancer-channel-dimensions-widget': {
    display: 'grid',
    gridTemplateColumns:
        '[name] min-content [lower] min-content [upper] min-content',
  },
  '.neuroglancer-channel-dimensions-widget-name-container': {
    gridColumn: 'name',
  },
  '.neuroglancer-channel-dimensions-widget-name[data-is-valid=false], .neuroglancer-channel-dimensions-widget-name::placeholder': {
    textDecoration: 'solid underline red',
  },
  '.neuroglancer-channel-dimensions-widget-name': {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    border: '0',
    margin: '0',
    fontFamily: 'monospace',
    fontSize: 'medium',
    color: '#ff6',
  },
  '.neuroglancer-channel-dimensions-widget-name, .neuroglancer-channel-dimensions-widget-lower, .neuroglancer-channel-dimensions-widget-upper': {
    fontFamily: 'monospace',
  },
  '.neuroglancer-channel-dimensions-widget-lower': {
    gridColumn: 'lower',
    textAlign: 'right',
  },
  '.neuroglancer-channel-dimensions-widget-upper': {
    gridColumn: 'upper',
    textAlign: 'right',
  },
  '.neuroglancer-channel-dimensions-widget-lower, .neuroglancer-channel-dimensions-widget-upper': {
    textAlign: 'right',
    marginLeft: '1ch',
    userSelect: 'text',
  },
  '.neuroglancer-channel-dimensions-widget-upper:after': { content: '")"' },
  '.neuroglancer-channel-dimensions-widget-lower:after': { content: '","' },
  '.neuroglancer-channel-dimensions-widget-lower:before': { content: '"["' },
  '.neuroglancer-channel-dimensions-widget-upper:after, .neuroglancer-channel-dimensions-widget-lower:before, .neuroglancer-channel-dimensions-widget-lower:after': {
    color: '#999',
  },
  '.neuroglancer-layer-options-control-container .neuroglancer-layer-control-label-container': {
    marginRight: 'auto',
  },
  '.neuroglancer-layer-control-label-container': { whiteSpace: 'nowrap' },
  '.neuroglancer-layer-control-label': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  '.neuroglancer-layer-control-label-text-container': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
  },
  '.neuroglancer-layer-control-container': {
    marginTop: '1.5px',
    marginBottom: '1.5px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  '.neuroglancer-layer-control-control': {
    flex: 1,
    marginLeft: '5px',
    maxWidth: '500px',
  },
  'select.neuroglancer-layer-control-control, input[type=checkbox].neuroglancer-layer-control-control, input[type=color].neuroglancer-layer-control-control': {
    flex: 'initial',
  },
  '.range-slider': {
    display: 'flex',
    flexDirection: 'row',
    whiteSpace: 'nowrap',
    justifyContent: 'flex-end',
  },
  '.range-slider input[type=range]': {
    background: 'transparent',
    flexBasis: '0px',
  },
  '.range-slider input[type=number]': {
    backgroundColor: '#ffffff4d',
    color: '#fff',
    border: '0px',
  },
  '.range-slider input[type=range]::-moz-range-track': {
    backgroundColor: '#fff',
  },
  '.neuroglancer-render-scale-widget': {
    marginTop: '2px',
    marginBottom: '2px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  '.neuroglancer-render-scale-widget-prompt': { whiteSpace: 'nowrap' },
  '.neuroglancer-render-scale-widget>canvas': {
    height: '36px',
    flex: 1,
    flexBasis: '0px',
    width: '0px',
  },
  '.neuroglancer-render-scale-widget-legend': {
    width: '10ch',
    fontSize: '11px',
    textAlign: 'right',
  },
  '.neuroglancer-render-scale-widget-legend>div': { height: '12px' },
  '.neuroglancer-shader-code-widget.invalid-input': { border: '1px solid red' },
  '.neuroglancer-shader-code-widget.valid-input': { border: '1px solid green' },
  '.neuroglancer-shader-code-widget': { border: '1px solid transparent' },
  '.neuroglancer-invlerp-cdfpanel': { height: '50px', cursor: 'ew-resize' },
  '.neuroglancer-invlerp-cdfpanel, .neuroglancer-invlerp-legend-panel': {
    border: '1px solid #666',
  },
  '.neuroglancer-invlerp-legend-panel': { height: '15px' },
  '.neuroglancer-invlerp-widget-bound': {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    border: '0',
    margin: '0',
    fontFamily: 'monospace',
    fontSize: 'medium',
  },
  '.neuroglancer-invlerp-widget-window-bound': { color: '#0ff' },
  '.neuroglancer-invlerp-widget-range-bound': { color: '#fff' },
  '.neuroglancer-invlerp-widget-bounds': { display: 'flex' },
  '.neuroglancer-invlerp-widget-range-spacer': { flex: 1, textAlign: 'center' },
  '.neuroglancer-invlerp-widget-window-bounds': {
    justifyContent: 'space-between',
  },
  '.neuroglancer-segmentation-rendering-tab': {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  '.neuroglancer-segmentation-rendering-tab .neuroglancer-shader-code-widget': {
    height: '6em',
  },
  '.neuroglancer-segmentation-dropdown-skeleton-shader-header': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  '.neuroglancer-segmentation-layer-skeleton-shader-overlay .neuroglancer-shader-code-widget': {
    width: '80vw',
    height: '80vh',
  },
  '.neuroglancer-segment-list-entry': {
    display: 'flex',
    flexDirection: 'row',
    width: 'min-content',
    minWidth: '100%',
    backgroundColor: '#000',
    alignItems: 'start',
  },
  '.neuroglancer-segment-list-entry.neuroglancer-segment-list-entry-double-line': {
    display: 'inline-flex',
    minWidth: 'initial',
    backgroundColor: 'initial',
  },
  '.neuroglancer-segment-list-entry[data-selected=true], .neuroglancer-selection-details-segment[data-selected=true]': {
    backgroundColor: '#222',
  },
  '.neuroglancer-segment-list-entry-copy-container': {
    display: 'flex',
    flexDirection: 'column',
  },
  '.neuroglancer-segment-list-entry-id-container': {
    order: 1,
    alignSelf: 'center',
  },
  '.neuroglancer-segment-list-entry-id, .neuroglancer-selection-details-segment-id': {
    display: 'block',
    fontFamily: 'monospace',
    fontSize: 'medium',
    flexShrink: 0,
    textAlign: 'right',
    color: '#000',
    backgroundColor: '#fff',
    userSelect: 'text',
    width: 'var(--neuroglancer-segment-list-width)',
  },
  '.neuroglancer-segment-list .neuroglancer-segment-list-entry-sticky': {
    position: 'sticky',
    left: '0',
  },
  '.neuroglancer-segment-list-entry-sticky': {
    whiteSpace: 'nowrap',
    flexDirection: 'row',
    alignItems: 'start',
    backgroundColor: 'inherit',
    display: 'flex',
  },
  '.neuroglancer-segment-list-entry-extra-property': {
    paddingLeft: '8px',
    flexShrink: 0,
    textAlign: 'right',
    userSelect: 'text',
  },
  '.neuroglancer-selection-details-segment-description, .neuroglancer-selection-details-segment-property': {
    fontFamily: 'sans-serif',
    fontSize: 'small',
  },
  '.neuroglancer-selection-details-segment-property': {
    display: 'flex',
    flexDirection: 'row',
  },
  '.neuroglancer-selection-details-segment-property-name': {
    userSelect: 'text',
    fontStyle: 'italic',
  },
  '.neuroglancer-selection-details-segment-property-value': {
    textAlign: 'right',
    flex: 1,
  },
  '.neuroglancer-segmentation-toolbox': { display: 'inline-block' },
  '.neuroglancer-segmentation-toolbox .neuroglancer-tool-button+.neuroglancer-tool-button': {
    marginLeft: '1em',
  },
  '.neuroglancer-segment-list': {
    position: 'relative',
    overflowY: 'auto',
    overflowX: 'scroll',
    flex: 1,
  },
  '.neuroglancer-segment-display-tab': {
    display: 'flex',
    flexDirection: 'column',
  },
  '.neuroglancer-segment-query-errors': {
    margin: '0',
    listStyleType: 'none',
    padding: '0 0 0 3px',
    backgroundColor: '#333',
  },
  '.neuroglancer-segment-query-errors>li': { display: 'block', color: 'red' },
  '.neuroglancer-segment-list-entry:not(.neuroglancer-segment-list-entry-double-line) .neuroglancer-segment-list-entry-unmapped-id:empty+.neuroglancer-segment-list-entry-copy': {
    display: 'none',
  },
  '.neuroglancer-segment-list-entry.neuroglancer-segment-list-entry-double-line .neuroglancer-segment-list-entry-unmapped-id:empty+.neuroglancer-segment-list-entry-copy': {
    visibility: 'hidden',
  },
  '.neuroglancer-segment-list-entry-name:empty+.neuroglancer-segment-list-entry-filter': {
    display: 'none',
  },
  '.neuroglancer-segment-list-entry-name': {
    order: 1000,
    display: 'inline-block',
    fontFamily: 'monospace',
    fontSize: 'medium',
    userSelect: 'text',
    whiteSpace: 'nowrap',
  },
  '.neuroglancer-segment-list-query': {
    backgroundColor: '#151515',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 'medium',
    border: '2px solid #333',
    padding: '2px',
    outline: '0px',
  },
  '.neuroglancer-segment-list-query::placeholder': { color: '#aaa' },
  '.neuroglancer-segment-list-status': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  '.neuroglancer-segment-list-entry-copy': { order: -2, visibility: 'hidden' },
  '.neuroglancer-segment-list-entry:hover .neuroglancer-segment-list-entry-copy': {
    visibility: 'visible',
  },
  '.neuroglancer-segment-list-entry-visible-checkbox': { order: -1 },
  '.neuroglancer-segment-list-entry[data-visible-list] .neuroglancer-segment-list-entry-sticky:before': {
    order: -1000,
    content: '" "',
    display: 'inline-block',
    width: '2px',
    flexShrink: 0,
    marginRight: '-2px',
    alignSelf: 'stretch',
    marginBottom: '2px',
    backgroundColor: '#999',
  },
  '.neuroglancer-segment-list-entry-filter': {
    visibility: 'hidden',
    gridColumn: 'filter',
    order: 999,
  },
  '.neuroglancer-segment-list-entry:hover .neuroglancer-segment-list-entry-filter': {
    visibility: 'visible',
  },
  '.neuroglancer-segment-query-result-tag-list': {
    display: 'grid',
    gridAutoRows: 'auto',
    gridTemplateColumns:
        '[include] min-content [exclude] min-content [tag] 1fr [count] min-content',
  },
  '.neuroglancer-segment-query-result-tag': { display: 'contents' },
  '.neuroglancer-segment-query-result-tag:hover *': { backgroundColor: '#222' },
  '.neuroglancer-segment-query-result-tag-name': {
    gridColumn: 'tag',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  '.neuroglancer-segment-query-result-tag-name:before': {
    content: '"#"',
    color: '#aaa',
    fontWeight: 'normal',
  },
  '.neuroglancer-segment-query-result-tag-toggle': {
    display: 'inline-block',
    whiteSpace: 'nowrap',
  },
  '.neuroglancer-segment-query-result-tag-include': { gridColumn: 'include' },
  '.neuroglancer-segment-query-result-tag-exclude': { gridColumn: 'exclude' },
  '.neuroglancer-segment-query-result-statistics': {
    backgroundColor: '#333',
    maxHeight: '40%',
    flexShrink: 0,
    overflow: 'auto',
  },
  '.neuroglancer-segment-query-result-statistics:not(:empty)': {
    paddingTop: '3px',
  },
  '.neuroglancer-segment-query-result-statistics:not(:empty)+.neuroglancer-segment-list-status': {
    borderTop: '1px solid white',
  },
  '.neuroglancer-segment-query-result-statistics-separator': {
    height: '3px',
    backgroundColor: '#333',
    borderBottom: '1px solid white',
  },
  '.neuroglancer-segment-query-result-tag-count': {
    gridColumn: 'count',
    textAlign: 'right',
  },
  '.neuroglancer-segment-query-result-tag-count:not(:empty):before': {
    content: '"("',
    color: '#aaa',
  },
  '.neuroglancer-segment-query-result-tag-count:not(:empty):after': {
    content: '")"',
    color: '#aaa',
  },
  '.neuroglancer-segment-query-result-numerical-list': {
    display: 'flex',
    flexDirection: 'column',
  },
  '.neuroglancer-segment-query-result-numerical-plot-container': {
    justifySelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    padding: '2px',
  },
  '.neuroglancer-segment-query-result-numerical-plot': {
    display: 'block',
    height: '30px',
    cursor: 'ew-resize',
    justifySelf: 'stretch',
    border: '1px solid #666',
  },
  '.neuroglancer-segment-query-result-numerical-plot-bound': {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    border: '0',
    margin: '0',
    font: '10pt sans-serif',
    pointerEvents: 'auto',
  },
  '.neuroglancer-segment-query-result-numerical-plot-window-bound': {
    color: '#0ff',
  },
  '.neuroglancer-segment-query-result-numerical-plot-range-bound': {
    color: '#fff',
  },
  '.neuroglancer-segment-query-result-numerical-plot-bounds': {
    display: 'flex',
    flexDirection: 'row',
    color: '#aaa',
  },
  '.neuroglancer-segment-query-result-numerical-plot-bound-constraint-symbol': {
    alignSelf: 'center',
  },
  '.neuroglancer-segment-query-result-numerical-plot-bound-constraint-spacer': {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '.neuroglancer-segment-query-result-numerical-plot-label': {
    cursor: 'pointer',
  },
  '.neuroglancer-segment-query-result-numerical-plot-sort, .neuroglancer-segment-list-header-label-sort': {
    visibility: 'hidden',
  },
  '.neuroglancer-segment-query-result-numerical-plot-label:hover .neuroglancer-segment-query-result-numerical-plot-sort, .neuroglancer-segment-list-header-label:hover .neuroglancer-segment-list-header-label-sort': {
    visibility: 'visible',
  },
  '.neuroglancer-segment-query-result-numerical-plot-container:hover .neuroglancer-segment-query-result-numerical-plot-bounds-window': {
    visibility: 'visible',
  },
  '.neuroglancer-segment-query-result-numerical-plot-bounds-window': {
    justifyContent: 'space-between',
    marginTop: '-16px',
    visibility: 'hidden',
    pointerEvents: 'none',
  },
  '.neuroglancer-segment-list-entry.neuroglancer-segment-list-header': {
    backgroundColor: '#666',
  },
  '.neuroglancer-segment-list-header .neuroglancer-segment-list-entry-id': {
    backgroundColor: 'inherit',
    color: '#fff',
    textAlign: 'center',
  },
  '.neuroglancer-segment-list-header-label': {
    cursor: 'pointer',
    font: '10pt sans-serif',
  },
  '.neuroglancer-segment-list-header .neuroglancer-segment-list-entry-extra-property': {
    textAlign: 'center',
  },
  '.neuroglancer-merge-segments-status': {
    display: 'flex',
    flexDirection: 'row',
  },
  '.neuroglancer-merge-segments-status .neuroglancer-segment-list-entry': {
    marginLeft: '1em',
    marginRight: '1em',
  },
  '.neuroglancer-linked-layer-widget-layer': {
    display: 'flex',
    flexDirection: 'row',
  },
  '.neuroglancer-linked-layer-widget-layer:hover': { backgroundColor: '#333' },
  '.neuroglancer-segmentation-color-seed-control': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  '.neuroglancer-segmentation-color-seed-control input': {
    backgroundColor: '#ffffff4d',
    color: '#fff',
    border: '0px',
  },
  '.neuroglancer-single-mesh-dropdown .neuroglancer-single-mesh-attribute-widget': {
    maxHeight: '6em',
    marginBottom: '8px',
  },
  '.neuroglancer-single-mesh-dropdown .neuroglancer-shader-code-widget': {
    height: '6em',
    width: '60ch',
    border: '1px solid transparent',
  },
  '.neuroglancer-single-mesh-dropdown-top-row': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  '.neuroglancer-single-mesh-shader-overlay .neuroglancer-shader-code-widget': {
    width: '80vw',
    height: '80vh',
  },
  '.neuroglancer-single-mesh-attribute-widget': {
    wordWrap: 'break-word',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: '[type] auto [name] auto [range] auto',
  },
  '.neuroglancer-single-mesh-layer-shader-overlay .neuroglancer-single-mesh-attribute-widget': {
    maxHeight: '20vh',
  },
  '.neuroglancer-single-mesh-attribute': {
    fontFamily: 'monospace',
    display: 'contents',
  },
  '.neuroglancer-single-mesh-attribute-type': {
    color: '#c6c',
    gridColumn: 'type',
  },
  '.neuroglancer-single-mesh-attribute-name': {
    marginLeft: '1ch',
    color: '#fff',
    gridColumn: 'name',
    userSelect: 'text',
  },
  '.neuroglancer-single-mesh-attribute-range': {
    marginLeft: '1ch',
    whiteSpace: 'nowrap',
    color: '#999',
    gridColumn: 'range',
  },
  '.neuroglancer-annotation-rendering-tab': {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  '.neuroglancer-annotation-rendering-tab .neuroglancer-shader-code-widget': {
    flexShrink: 0,
  },
  '.neuroglancer-annotation-shader-property-list': {
    maxHeight: '8em',
    overflow: 'auto',
    flexShrink: 0,
  },
  '.neuroglancer-annotation-shader-property': {
    whiteSpace: 'pre',
    fontFamily: 'monospace',
    fontSize: 'medium',
  },
  '.neuroglancer-annotation-shader-property-type': {
    color: '#c6c',
    marginRight: '1ch',
  },
  '.neuroglancer-annotation-shader-property-identifier': { userSelect: 'text' },
  '.neuroglancer-annotation-shader-property-identifier:after': {
    content: '"()"',
    color: '#999',
  },
};


export function NeuroglancerGlobalStyles(props) {
  const {
    classes,
  } = props;

  return (
    <>
      <GlobalStyles styles={globalNeuroglancerCss} />
      <ScopedGlobalStyles
        styles={globalNeuroglancerStyles}
        parentClassName={classes.neuroglancerWrapper}
      />
    </>
  );
}
