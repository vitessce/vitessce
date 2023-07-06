#!/usr/bin/env node
import { xor } from 'lodash-es';

const uniques = (arr) => xor(...arr.map(a => [a]))
const duplicates = (arr) => xor(arr, uniques(arr));

function checkKeys(allMatches) {
  const keyToFiles = {};
  let shouldFail = false;
  allMatches.forEach((match) => {
    const { text, file } = match;
    if(keyToFiles.hasOwnProperty(text)) {
      keyToFiles[text].push(file);
    } else {
      keyToFiles[text] = [file];
    }
  });
  Object.entries(keyToFiles).forEach(([text, files]) => {
    if (files.length > 1) {
      console.error(`Error: duplicate makeStyles keys found: '${text}' in ${JSON.stringify(files, null, 2)}`);
      shouldFail = true;
    }
  });
  process.exit(shouldFail ? 1 : 0);
}

// Get data from stdin to enable piping output from jq into the script.
const stdin = process.openStdin();

let data = "";

stdin.on('data', function(chunk) {
  data += chunk;
});

stdin.on('end', function() {
  const allMatches = JSON.parse(data);
  checkKeys(allMatches);
});
