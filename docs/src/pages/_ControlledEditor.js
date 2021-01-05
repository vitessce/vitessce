// Reference: https://github.com/suren-atoyan/monaco-react/issues/51#issuecomment-638873667
import React, { useRef, useEffect, useMemo } from 'react'
import debounce from 'lodash/debounce';
import Editor from '@monaco-editor/react';

const noop = (_) => {};

const DEFAULT_UPDATE_DEBOUNCE_DELAY = 100

const ControlledEditor = ({ value, onChange, editorDidMount, ...props }) => {
  const previousValue = useRef(value)
  const editorRef = useRef()
  const debouncedOnChange = useMemo(
    () =>
      debounce((event, value) => {
        previousValue.current = value
        onChange(event, value)
      }, DEFAULT_UPDATE_DEBOUNCE_DELAY),
    [onChange]
  )

  useEffect(() => {
    if (value !== previousValue.current && editorRef.current) {
      editorRef.current.setValue(value)
    }
    previousValue.current = value
  }, [value])

  const handleEditorDidMount = (getValue, editor) => {
    editorRef.current = editor
    editor.setValue(previousValue.current)
    editor.onDidChangeModelContent((ev) => {
      const currentValue = editor.getValue()
      if (currentValue !== previousValue.current) {
        debouncedOnChange(ev, currentValue)
      }
    })

    editorDidMount(getValue, editor)
  }

  return (
    <Editor value="" editorDidMount={handleEditorDidMount} {...props} />
  );
}

ControlledEditor.defaultProps = {
  editorDidMount: noop,
  onChange: noop
};

export default ControlledEditor;