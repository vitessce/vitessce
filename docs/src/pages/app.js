import React, { useCallback, useState } from 'react';
import Layout from '@theme/Layout';
import useThemeContext from '@theme/hooks/useThemeContext';
import { useDropzone } from 'react-dropzone';
import { ControlledEditor } from '@monaco-editor/react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const baseConfig = `{
  "name": "My config",
  "version": "1.0.0",
  "initStrategy": "auto",
  "datasets": [],
  "layout": [],
  "coordinationSpace": {}
}`;

function ThemedControlledEditor(props) {
  const { isDarkTheme } = useThemeContext();
  return <ControlledEditor
    {...props}
    theme={(isDarkTheme ? "dark" : "light")}
  />
}

function App() {
  const [validConfig, setValidConfig] = useState(null);
  const [pendingConfig, setPendingConfig] = useState(baseConfig);
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    console.log(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1});

  return (
    <Layout
      title="App"
      description="Use Vitessce with a custom configuration.">
      <main>
        <div {...getRootProps()} className={styles.dropzone}>
          <input {...getInputProps()} className={styles.dropzoneInfo} />
          {
            isDragActive ?
              <p>Drop the file here ...</p> :
              <p>Drag &amp; drop a view config as a JSON file</p>
          }
        </div>
        <div className={styles.dropzoneOr}>OR</div>
        <div className={styles.viewConfigEditor}>
          <p className={styles.viewConfigEditorInfo}>Use the JSON view config editor below</p>
          <ThemedControlledEditor
            value={pendingConfig}
            onChange={(event, value) => setPendingConfig(value)}
            height="500px"
            language="json"
            options={{
              fontSize: 14,
              minimap: {
                enabled: false,
              },
            }}
          />
          <button className={styles.viewConfigGo}>Go</button>
        </div>
      </main>
    </Layout>
  );
}

export default App;
