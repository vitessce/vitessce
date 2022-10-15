import React, { useCallback } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useColorMode } from '@docusaurus/theme-common';

function ControlledEditor(props) {
  const { onChange } = props;

  const editorDidMount = useCallback((editor) => {
    editor.focus();
  }, []);

  const onChangeInternal = useCallback(
    (newValue) => {
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <MonacoEditor
      {...props}
      onChange={onChangeInternal}
      editorDidMount={editorDidMount}
    />
  );
}

function ThemedControlledEditor(props) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  return (
    <ControlledEditor
      {...props}
      theme={isDarkTheme ? 'vs-dark' : 'GitHub'}
      height="60vh"
      options={{
        automaticLayout: true,
        fontSize: 14,
        minimap: {
          enabled: false,
        },
        contextmenu: false,
      }}
    />
  );
}

export default ThemedControlledEditor;
