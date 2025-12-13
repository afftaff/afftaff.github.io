const ARTICLE_PREFIXES = ["l'", "l’"];
const DETACHED_ARTICLES = new Set(["le", "la", "les", "un", "une", "des", "l'", "l’"]);

const WORD_FILES = {
  nouns: '../dir/words/bignounlist.json',
  pluralNouns: '../dir/words/bignounlist-plural.json',
  verbs: '../dir/words/BigVerbList.json',
  adjectives: '../dir/words/adjectivelist.json',
  adverbs: '../dir/words/adverblist.json',
  idioms: '../dir/words/bigidiomlist.json'
};

const isBrowser = typeof window !== 'undefined';

function getWordFilePaths() {
  return { ...WORD_FILES };
}

// Capture the script's directory so resource URLs resolve correctly regardless of the page location.
const SCRIPT_BASE_URL = (() => {
  if (!isBrowser || typeof document === 'undefined') return null;

  const directScript = document.currentScript;
  if (directScript?.src) {
    return new URL('./', directScript.src).href;
  }

  const fallbackScript = Array.from(document.getElementsByTagName('script')).find((script) =>
    script.src?.includes('frenchwordsApi.js')
  );

  return fallbackScript?.src ? new URL('./', fallbackScript.src).href : null;
})();

const dataCache = {
  loaded: false,
  data: null,
  index: null
};

function deriveVerbKeys(conjugatedForm) {
  const normalized = normalizeKey(conjugatedForm || '');
  if (!normalized) return [];

  const keys = new Set([normalized]);

  const apostropheStripped = normalized.replace(/^[^\s']+'/, '');
  if (apostropheStripped && apostropheStripped !== normalized) {
    keys.add(apostropheStripped);
  }

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    keys.add(parts.slice(1).join(' '));
  }

  if (parts.length > 2) {
    keys.add(parts.slice(2).join(' '));
  }

  return Array.from(keys).filter(Boolean);
}

function extractObjectsFromArray(rawContent) {
  let depth = 0;
  let inString = false;
  let escaping = false;
  let buffer = '';
  const items = [];

  for (let i = 0; i < rawContent.length; i += 1) {
    const char = rawContent[i];

    if (inString) {
      buffer += char;
      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      buffer += char;
      continue;
    }

    if (char === '{') {
      depth += 1;
      buffer += char;
      continue;
    }

    if (char === '}') {
      buffer += char;
      depth -= 1;
      if (depth === 0) {
        try {
          items.push(JSON.parse(buffer.replace(/,\s*([}\]])/g, '$1')));
        } catch (error) {
          // Ignore malformed sections and continue scanning.
        }
        buffer = '';
      }
      continue;
    }

    if (depth > 0) {
      buffer += char;
    }
  }

  return items.length ? items : null;
}

function normalizeKey(text) {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .replace(/^[«“"'‘’\(\[\{]+|[»”"'’\)\]\}]+$/g, '')
    .replace(/[.,!?;:]+$/g, '')
    .replace(/^[.,!?;:]+/g, '')
    .replace(/’/g, "'")
    .toLowerCase();
}

function stripLeadingArticle(word) {
  let hasArticle = false;
  let stripped = word;

  for (const prefix of ARTICLE_PREFIXES) {
    if (stripped.startsWith(prefix)) {
      stripped = stripped.slice(prefix.length);
      hasArticle = true;
      break;
    }
  }

  return { word: stripped, hasArticle };
}

function isArticleWord(word) {
  return DETACHED_ARTICLES.has(word);
}

function parseJsonContent(rawContent) {
  const attempts = [rawContent, rawContent.replace(/,\s*([}\]])/g, '$1')];
  let lastError = null;

  for (const content of attempts) {
    try {
      return JSON.parse(content);
    } catch (error) {
      lastError = error;
    }
  }

  const looseObjects = extractObjectsFromArray(attempts[1]);
  if (looseObjects) return looseObjects;

  try {
    // Fallback to permissive parsing so files with trailing commas still load.
    // eslint-disable-next-line no-new-func
    return new Function(`return ${attempts[1]};`)();
  } catch (error) {
    lastError = error;
  }

  throw lastError;
}

async function loadJsonFile(relativePath) {
  if (isBrowser && typeof fetch === 'function') {
    const resolvedUrl = SCRIPT_BASE_URL
      ? new URL(relativePath, SCRIPT_BASE_URL).href
      : new URL(relativePath, window.location.href).href;

    const response = await fetch(resolvedUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${resolvedUrl}: ${response.status}`);
    }
    const raw = await response.text();
    return parseJsonContent(raw);
  }

  // Node.js fallback to allow local testing.
  const path = require('path');
  const fs = require('fs').promises;
  const absolute = path.join(__dirname, relativePath);
  const file = await fs.readFile(absolute, 'utf8');
  return parseJsonContent(file);
}

async function loadWordData() {
  if (dataCache.loaded) {
    return dataCache.data;
  }

  const entries = await Promise.all(
    Object.entries(WORD_FILES).map(async ([key, file]) => {
      const json = await loadJsonFile(file);
      return [key, json];
    })
  );

  dataCache.loaded = true;
  dataCache.data = Object.fromEntries(entries);
  return dataCache.data;
}

function addToMap(map, key, value) {
  if (!map.has(key)) {
    map.set(key, []);
  }
  map.get(key).push(value);
}

function buildIndex(wordData) {
  if (dataCache.index) return dataCache.index;

  const nounMap = new Map();
  const verbMap = new Map();
  const verbInfinitiveMap = new Map();
  const adjectiveMap = new Map();
  const adverbMap = new Map();
  const idiomMap = new Map();

  (wordData.nouns || []).forEach((noun) => {
    const key = normalizeKey(noun.french);
    addToMap(nounMap, key, { type: 'noun', entry: noun });
  });

  (wordData.pluralNouns || []).forEach((noun) => {
    const key = normalizeKey(noun.french);
    addToMap(nounMap, key, { type: 'noun', entry: noun });
  });

  (wordData.verbs || []).forEach((verb) => {
    const infinitiveKey = normalizeKey(verb.verb);
    addToMap(verbInfinitiveMap, infinitiveKey, { type: 'verb-infinitive', verb });

    (verb.conjugations || []).forEach((conjugation) => {
      const keys = deriveVerbKeys(conjugation.conjugated_form || verb.verb);

      keys.forEach((conjugationKey) => {
        addToMap(verbMap, conjugationKey, {
          type: 'verb-conjugation',
          verb,
          conjugation
        });
      });
    });
  });

  (wordData.adjectives || []).forEach((adjective) => {
    ['masculine', 'feminine', 'masculine_plural', 'feminine_plural'].forEach((form) => {
      const value = adjective[form];
      if (value) {
        const key = normalizeKey(value);
        addToMap(adjectiveMap, key, { type: 'adjective', entry: adjective, form });
      }
    });
  });

  const adverbs = Array.isArray(wordData.adverbs)
    ? wordData.adverbs
    : wordData.adverbs?.adverbs || [];

  adverbs.forEach((adverb) => {
    const key = normalizeKey(adverb.adverb);
    addToMap(adverbMap, key, { type: 'adverb', entry: adverb });
  });

  const idioms = wordData.idioms?.idioms || wordData.idioms || [];
  idioms.forEach((idiom) => {
    const key = normalizeKey(idiom.expression);
    addToMap(idiomMap, key, { type: 'idiom', entry: idiom });
  });

  dataCache.index = {
    nounMap,
    verbMap,
    verbInfinitiveMap,
    adjectiveMap,
    adverbMap,
    idiomMap
  };

  return dataCache.index;
}

function collectSentences(conjugation) {
  const pairs = [];
  for (let i = 1; i <= 3; i += 1) {
    const fr = conjugation[`sentence_fr_${i}`];
    const en = conjugation[`sentence_en_${i}`];
    if (fr || en) {
      pairs.push({ french: fr || null, english: en || null });
    }
  }
  return pairs.length ? pairs : null;
}

function ensureArrayOrNull(value) {
  if (value === null || value === undefined) return null;
  const arrayValue = Array.isArray(value) ? value : [value];
  const filtered = arrayValue.filter(Boolean);
  return filtered.length ? filtered : null;
}

function splitMeanings(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value.length ? value : null;
  const pieces = value
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return pieces.length ? pieces : null;
}

function buildResultTemplate(originalText, normalizedWord) {
  return {
    originalText,
    word: normalizedWord || null,
    meanings: null,
    gender: null,
    pronouns: null,
    tense: null,
    conjugatedFrom: null,
    conjugatedFromMeaning: null,
    exampleSentences: null,
    found: true
  };
}

function formatNounMatch(originalText, normalizedWord, noun) {
  const result = buildResultTemplate(originalText, noun.entry.french || normalizedWord);
  result.meanings = splitMeanings(noun.entry.english);
  result.gender = noun.entry.gender || null;

  if (noun.entry.example_en || noun.entry.example_fr) {
    result.exampleSentences = [
      { english: noun.entry.example_en || null, french: noun.entry.example_fr || null }
    ];
  }

  return result;
}

function formatVerbInfinitiveMatch(originalText, normalizedWord, verb) {
  const result = buildResultTemplate(originalText, verb.verb.verb || normalizedWord);
  result.meanings = splitMeanings(verb.verb.definitions);
  result.conjugatedFrom = verb.verb.verb || null;
  result.conjugatedFromMeaning = splitMeanings(verb.verb.definitions);
  return result;
}

function formatVerbConjugationMatch(originalText, normalizedWord, match) {
  const { verb, conjugation } = match;
  const result = buildResultTemplate(
    originalText,
    conjugation.conjugated_form || verb.verb || normalizedWord
  );

  const meaningCandidates = [conjugation.word_en_1, conjugation.word_en_2, conjugation.word_en_3]
    .filter(Boolean);
  result.meanings = meaningCandidates.length
    ? meaningCandidates
    : splitMeanings(verb.definitions);
  result.pronouns = ensureArrayOrNull(conjugation.pronoun);
  result.tense = ensureArrayOrNull([conjugation.mood, conjugation.tense].filter(Boolean));
  result.conjugatedFrom = verb.verb;
  result.conjugatedFromMeaning = splitMeanings(verb.definitions);
  result.exampleSentences = collectSentences(conjugation);
  return result;
}

function formatAdjectiveMatch(originalText, normalizedWord, adjective) {
  const result = buildResultTemplate(originalText, adjective.entry[adjective.form] || normalizedWord);
  result.meanings = splitMeanings(adjective.entry.english);
  result.gender = adjective.form?.includes('feminine') ? 'feminine' : 'masculine';

  if (adjective.entry.example_en || adjective.entry.example_fr) {
    result.exampleSentences = [
      { english: adjective.entry.example_en || null, french: adjective.entry.example_fr || null }
    ];
  }

  return result;
}

function formatAdverbMatch(originalText, normalizedWord, adverb) {
  const result = buildResultTemplate(originalText, adverb.entry.adverb || normalizedWord);
  result.meanings = splitMeanings(adverb.entry.meaning_en);
  result.gender = adverb.entry.gender || null;
  result.exampleSentences = (adverb.entry.examples || []).map((pair) => ({
    english: pair.en || null,
    french: pair.fr || null
  }));
  if (result.exampleSentences.length === 0) {
    result.exampleSentences = null;
  }
  return result;
}

function formatIdiomMatch(originalText, normalizedWord, idiom) {
  const result = buildResultTemplate(originalText, idiom.entry.expression || normalizedWord);
  result.meanings = splitMeanings([idiom.entry.meaning, idiom.entry.literal].filter(Boolean));
  result.exampleSentences = null;
  return result;
}

function createNotFoundResult(originalText, normalizedWord) {
  return {
    originalText,
    word: normalizedWord || null,
    meanings: null,
    gender: null,
    pronouns: null,
    tense: null,
    conjugatedFrom: null,
    conjugatedFromMeaning: null,
    exampleSentences: null,
    found: false
  };
}

function findMatchesForWord(normalizedWord, hasArticle, index, originalText) {
  const matches = [];

  const nounMatches = index.nounMap.get(normalizedWord) || [];
  const verbConjugations = index.verbMap.get(normalizedWord) || [];
  const verbInfinitives = index.verbInfinitiveMap.get(normalizedWord) || [];
  const adjectiveMatches = index.adjectiveMap.get(normalizedWord) || [];
  const adverbMatches = index.adverbMap.get(normalizedWord) || [];
  const idiomMatches = index.idiomMap.get(normalizedWord) || [];

  if (nounMatches.length && verbConjugations.length && hasArticle) {
    // Article detected: prioritize noun usages over identically spelled verbs.
    verbConjugations.length = 0;
  }

  nounMatches.forEach((noun) => {
    matches.push(formatNounMatch(originalText, normalizedWord, noun));
  });

  verbInfinitives.forEach((verb) => {
    matches.push(formatVerbInfinitiveMatch(originalText, normalizedWord, verb));
  });

  verbConjugations.forEach((verbMatch) => {
    matches.push(formatVerbConjugationMatch(originalText, normalizedWord, verbMatch));
  });

  adjectiveMatches.forEach((adjective) => {
    matches.push(formatAdjectiveMatch(originalText, normalizedWord, adjective));
  });

  adverbMatches.forEach((adverb) => {
    matches.push(formatAdverbMatch(originalText, normalizedWord, adverb));
  });

  idiomMatches.forEach((idiom) => {
    matches.push(formatIdiomMatch(originalText, normalizedWord, idiom));
  });

  return matches;
}

function tokenizeInput(text) {
  const rawTokens = text.split(/\s+/).filter(Boolean);
  const tokens = [];

  let previousCleaned = null;
  rawTokens.forEach((token) => {
    const cleanedLower = normalizeKey(token);
    const { word: baseWord, hasArticle } = stripLeadingArticle(cleanedLower);
    const combinedArticle = hasArticle || isArticleWord(previousCleaned);

    tokens.push({
      original: token,
      normalized: baseWord,
      hasArticle: combinedArticle
    });

    previousCleaned = cleanedLower;
  });

  return tokens;
}

async function lookupFrenchWords(text) {
  const wordData = await loadWordData();
  const index = buildIndex(wordData);

  const tokens = tokenizeInput(text);
  const allResults = [];

  tokens.forEach(({ original, normalized, hasArticle }) => {
    const matches = findMatchesForWord(normalized, hasArticle, index, original);
    if (matches.length === 0) {
      allResults.push(createNotFoundResult(original, normalized));
    } else {
      allResults.push(...matches);
    }
  });

  return allResults;
}

async function preloadFrenchWordData() {
  if (dataCache.loaded && dataCache.index) return;
  const wordData = await loadWordData();
  buildIndex(wordData);
}

const debug = { parseJsonContent, loadJsonFile, loadWordData };
const api = { lookupFrenchWords, preloadFrenchWordData, debug, getWordFilePaths };

if (typeof window !== 'undefined') {
  window.frenchWordsApi = api;
}

if (typeof module !== 'undefined') {
  module.exports = api;
}

// Example result structure:
// [
//   {
//     originalText: "l'homme",
//     word: "homme",
//     meanings: ["man", "human"],
//     gender: "masculine",
//     pronouns: null,
//     tense: null,
//     conjugatedFrom: null,
//     conjugatedFromMeaning: null,
//     exampleSentences: [
//       { english: "The man is here.", french: "L'homme est ici." }
//     ],
//     found: true
//   }
// ]
