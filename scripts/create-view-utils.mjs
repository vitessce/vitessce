// Utility functions for the create-view script.
import fs from 'fs';

/**
 * Creates a directory if it doesn't already exist.
 * Uses recursive creation to create parent directories as needed.
 * @param {string} dir Path to the directory to create
 */
export function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Creates a file with the specified content and logs its creation.
 * @param {string} filePath Path where the file should be created
 * @param {string} content Content to write to the file
 */
export function createFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`Created ${filePath}`);
}

/**
 * Replaces lines containing only commas ("\n,\n")
 * by moving the comma onto the previous line (",\n")
 * @param {string} input
 * @returns {string}
 */
export function fixCommaLines(input) {
  // Replace full lines with just a comma
  let output = input.replace(/\n,\n/g, ',\n');
  // Handle trailing "\n," at the end of input
  output = output.replace(/\n,$/, ',');
  return output;
}

/**
 * Fixes indentation for a block of code
 * @param {string} input The input code block
 * @param {number} numTabs Number of tabs (2 spaces per tab)
 * @returns {string} The indented code block
 */
export function fixIndentation(input, numTabs) {
  const numSpaces = numTabs * 2

  const lines = input.split('\n');
  const spaces = ' '.repeat(numSpaces);

  const result = lines.map((line, index) => {
    if (index === 0) return line; // leave the first line unchanged
    return /^\s/.test(line) ? line : spaces + line;
  });

  return result.join('\n');
}

/**
 * Formats a code block by fixing commas and indentation
 * @param {string} input The input code block
 * @param {number} numTabs Number of tabs for indentation
 * @returns {string} The formatted code block
 */
export function formatCode(input, numTabs) {
  return fixIndentation(fixCommaLines(input), numTabs);
}

/**
 * Converts a hyphen-separated string to PascalCase.
 * Example: "my-string" becomes "MyString"
 * @param {string} str The hyphen-separated input string
 * @returns {string} The PascalCase string
 */
export function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a hyphen-separated string to camelCase.
 * Example: "my-string" becomes "myString"
 * @param {string} str The hyphen-separated input string
 * @returns {string} The camelCase string
 */
export function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a hyphen-separated string to CONSTANT_CASE.
 * Example: "my-string" becomes "MY_STRING"
 * @param {string} str The hyphen-separated input string
 * @returns {string} The CONSTANT_CASE string
 */
export function toConstantCase(str) {
  return str.toUpperCase().replace(/-/g, '_');
} 