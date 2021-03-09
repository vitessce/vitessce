import React, { useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

function ControlledEditor(props) {
  const {
    onChange,
  } = props;

  const editorDidMount = useCallback((editor, monaco) => {
    editor.focus();
  }, []);

  const onChangeInternal = useCallback((newValue, e) => {
    onChange(newValue);
  });
  
  return (
    <BrowserOnly>
      {() => {
        const MonacoEditor = require('react-monaco-editor').default;
        return (<MonacoEditor
          {...props}
          onChange={onChangeInternal}
          editorDidMount={editorDidMount}
        />);
      }}
    </BrowserOnly>
  );
}

export default ControlledEditor;