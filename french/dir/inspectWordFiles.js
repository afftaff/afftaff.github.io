const fs = require('fs');
const path = require('path');
const { debug, getWordFilePaths } = require('./frenchwordsApi');

function summarizeEntry(entry) {
  if (Array.isArray(entry)) {
    return `array(${entry.length})`;
  }
  if (entry && typeof entry === 'object') {
    return `object keys: ${Object.keys(entry).slice(0, 6).join(', ')}`;
  }
  return typeof entry;
}

function describeDataset(name, data) {
  const size = Array.isArray(data)
    ? data.length
    : typeof data === 'object' && data !== null
      ? Object.keys(data).join(', ')
      : 'unknown';

  const sample = Array.isArray(data)
    ? data[0]
    : data?.idioms?.[0] ?? data?.adverbs?.[0];

  return {
    file: name,
    type: Array.isArray(data) ? 'array' : typeof data,
    size,
    sample: summarizeEntry(sample)
  };
}

function inspectWordFiles() {
  const fileMap = getWordFilePaths();
  return Object.values(fileMap).map((relativePath) => {
    const absolutePath = path.resolve(__dirname, relativePath);
    const raw = fs.readFileSync(absolutePath, 'utf8');
    const parsed = debug.parseJsonContent(raw);
    return describeDataset(path.basename(relativePath), parsed);
  });
}

if (require.main === module) {
  const results = inspectWordFiles();
  results.forEach((result) => {
    console.log(`${result.file}: ${result.type} (${result.size}) -> ${result.sample}`);
  });
}

module.exports = { inspectWordFiles };
