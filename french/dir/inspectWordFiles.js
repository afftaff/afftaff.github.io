const fs = require('fs');
const path = require('path');
const { debug } = require('./frenchwordsApi');

const WORD_FILES = [
  'bignounlist.json',
  'bignounlist-plural.json',
  'BigVerbList.json',
  'adjectivelist.json',
  'adverblist.json',
  'bigidiomlist.json'
];

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
  const baseDir = path.join(__dirname, 'words');
  return WORD_FILES.map((file) => {
    const raw = fs.readFileSync(path.join(baseDir, file), 'utf8');
    const parsed = debug.parseJsonContent(raw);
    return describeDataset(file, parsed);
  });
}

if (require.main === module) {
  const results = inspectWordFiles();
  results.forEach((result) => {
    console.log(`${result.file}: ${result.type} (${result.size}) -> ${result.sample}`);
  });
}

module.exports = { inspectWordFiles };
