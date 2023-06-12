#!/usr/bin/env node

function checkKeys(allKeys) {
  const uniqueKeys = new Set(allKeys);
  if (uniqueKeys.size !== allKeys.length) {
    // Exit with error.
    console.error("Error: duplicate makeStyles keys found.");
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Get data from stdin to enable piping output from jq into the script.
const stdin = process.openStdin();

let data = "";

stdin.on('data', function(chunk) {
  data += chunk;
});

stdin.on('end', function() {
  const allKeys = JSON.parse(data);
  checkKeys(allKeys);
});
