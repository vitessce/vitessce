import React from 'react';
import yaml from 'js-yaml'; // eslint-disable-line import/no-extraneous-dependencies
// This should only be used by docz, and should not be part of the app build.

function abbreviateType(yamlString) {
  return yamlString.replace(/:\s+type: (\w+)/g, ' ($1):');
}

function abbreviateRef(yamlString) {
  return yamlString.replace(/:\s+\$ref: '#\/definitions\/(\w+)'/g, ' ($1)');
}

function stripAddProps(yamlString) {
  // This should be the default in our schemas, but we don't need it in the docs.
  return yamlString.replace(/\s+additionalProperties: false/g, '');
}

function valuesAre(yamlString) {
  return yamlString.replace(/patternProperties:\s+\./g, 'Object values are');
}

function hasProperties(yamlString) {
  return yamlString.replace(/\.:\s+properties:/g, 'Each value has these properties:');
}

function pretty(title, obj) {
  // This is entirely ad-hoc:
  // It woks well for our schema, but no assertion that it should work for anyone else.
  if (!obj) return '';
  return (
    <>
      <h3>{title}</h3>
      <pre>
        {hasProperties(valuesAre(stripAddProps(
          abbreviateRef(abbreviateType(yaml.safeDump(obj))),
        )))}
      </pre>
    </>
  );
}

export default function PrettyJsonSchema(props) {
  const { children } = props;
  const { definitions, patternProperties, properties } = children;
  // We could grab the title as well, but when we output an <h2> it is not anchored;
  // better to put the section headers in MD.

  return (
    <blockquote>
      {pretty('Definitions', definitions)}
      {pretty('Properties', patternProperties)}
      {pretty('Properties', properties)}
    </blockquote>
  );
}
