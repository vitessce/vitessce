// Reference: https://github.com/gosling-lang/gosling.js/blob/35bbabc708d3b1279c4f13908330742f3bb474ca/editor/Editor.tsx#L151

import fetchJsonp from 'fetch-jsonp';

export async function fetchConfigFromGist(gist) {
  let metadata = null;
  try {
    // Don't ask me why but due to CORS we need to treat the JSON as JSONP
    // which is not supported by the normal `fetch()` so we need `fetchJsonp()`
    const response = await fetchJsonp(`https://gist.github.com/${gist}.json`);
    metadata = await (response.ok ? response.json() : null);
  } catch (error) {
    return Promise.reject(new Error('Gist not found'));
  }

  if (!metadata) return Promise.reject(new Error('Gist not found'));

  const dataFile = metadata.files.find(file => file.toLowerCase().endsWith('vitessce.json'));
  const textFile = metadata.files.find(file => file.toLowerCase() === 'readme.md');

  if (!dataFile) return Promise.reject(new Error('Gist does not contain a Vitessce configuration.'));

  const specUrl = new URL(`https://gist.githubusercontent.com/${gist}/raw/${dataFile}`);
  const whenCode = fetch(specUrl.href).then(
    response => (response.status === 200 ? response.text() : null),
  );

  const readmeUrl = new URL(`https://gist.githubusercontent.com/${gist}/raw/${textFile}`);
  const whenText = fetch(readmeUrl.href).then(
    response => (response.status === 200 ? response.text() : null),
  );

  return Promise.all([whenCode, whenText]).then(([configContents, readmeContents]) => ({
    title: metadata.description,
    readmeContents,
    configContents,
  }));
}
