import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

import styles from './styles.module.css';

function getJsonPrefix(fileType, fileName) {
  return `...,
{
  "fileType": "${fileType}",
  "url": "https://example.com/${fileName}"`;
}
const jsonSuffix = `
},
...`;

const jsPrefix = 'const vc = new VitessceConfig("1.0.13", "My config");';

function getJsSuffix(fileType, fileConst, fileName) {
  return `
const dataset = vc
  .addDataset("My dataset")
  .addFile(
    "https://example.com/${fileName}",
    ft.${fileConst},
    coordinationValues,
    options,
  );`;
}

function indentObject(obj) {
  return obj.split('\n').map((l, i) => (i > 0 ? `  ${l}` : l)).join('\n');
}

function jsonToJs(obj) {
  // eslint-disable-next-line no-unused-vars
  function replacer(match, p1, offset, string) {
    // p1 is non-digits
    return `${p1.substring(1, p1.length - 3)}: `;
  }
  return obj.split('\n').map(l => l.replace(/("[^\d]*": )/, replacer)).join('\n');
}

function formatJsonCv(obj) {
  return `,\n  "coordinationValues": ${indentObject(obj)}`;
}

function formatJsonOptions(obj) {
  return `,\n  "options": ${indentObject(obj.trim())}`;
}

function formatJsCv(obj) {
  return `
const coordinationValues = ${jsonToJs(obj)};`;
}

function formatJsOptions(obj) {
  return `
const options = ${jsonToJs(obj)};`;
}

export default function FileDefTabs(props) {
  const {
    fileName,
    fileType,
    fileConst,
    options,
    coordinationValues,
  } = props;

  return (
    <>
      <div className={styles.viewConfigTabs}>
        <Tabs
          defaultValue="json"
          values={[
            { label: 'JSON file definition example', value: 'json' },
            { label: 'JS API example', value: 'js' },
          ]}
        >
          <TabItem value="json">
            <CodeBlock className="language-javascript">{getJsonPrefix(fileType, fileName) + formatJsonCv(coordinationValues) + formatJsonOptions(options) + jsonSuffix}</CodeBlock>
          </TabItem>
          <TabItem value="js">
            <CodeBlock className="language-javascript">{jsPrefix + formatJsCv(coordinationValues) + formatJsOptions(options) + getJsSuffix(fileType, fileConst, fileName)}</CodeBlock>
          </TabItem>
        </Tabs>
      </div>
    </>
  );
}
