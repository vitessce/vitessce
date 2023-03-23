import React, { useCallback } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useColorMode } from '@docusaurus/theme-common';

function ControlledEditor(props) {
  const {
    onChange,
  } = props;

  const editorWillMount = useCallback((monaco) => {
    // We want to use custom syntax highlighting themes
    // which match closest to our custom Prism highlighting theme,
    // but the built-in JS tokenizer for Monaco is very coarse.

    // References:
    // - https://microsoft.github.io/monaco-editor/monarch.html
    // - https://github.com/microsoft/monaco-editor/blob/ae158a25246af016a0c56e2b47df83bd4b1c2426/src/basic-languages/typescript/typescript.ts#L224
    // - https://github.com/microsoft/monaco-editor/blob/ae158a25246af016a0c56e2b47df83bd4b1c2426/src/language/json/tokenization.ts#L24
    monaco.editor.defineTheme('custom-dark', {
      colors: {},
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'identifier', foreground: '9cdcfe' },
        { token: 'keyword', foreground: '569cd6' },
      ],
    });
    monaco.editor.defineTheme('custom-light', {
      colors: {},
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '36acaa' },
        { token: 'string.value.json', foreground: 'e3116c' },
        { token: 'delimiter.bracket.json', foreground: '393A34' },
        { token: 'delimiter.array.json', foreground: '393A34' },
        { token: 'delimiter.colon.json', foreground: '393A34' },
        { token: 'delimiter.comma.json', foreground: '393A34' },
        { token: 'string', foreground: 'e3116c' },
        { token: 'keyword', foreground: '00009f' },
        { token: 'identifier', foreground: '36acaa' },
        { token: 'type.identifier', foreground: '393A34' },
        { token: 'comment', foreground: '999988' },
        { token: 'number', foreground: '36acaa' },
      ],
    });
  }, []);

  const editorDidMount = useCallback((editor) => {
    editor.focus();
  }, []);

  const onChangeInternal = useCallback((newValue) => {
    onChange(newValue);
  }, [onChange]);

  return (
    <MonacoEditor
      {...props}
      onChange={onChangeInternal}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
    />
  );
}

function ThemedControlledEditor(props) {
  const { colorMode } = useColorMode();
  const isDarkTheme = (colorMode === 'dark');
  return (
    <ControlledEditor
      {...props}
      theme={(isDarkTheme ? 'custom-dark' : 'custom-light')}
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
