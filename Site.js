const elements = {
  phraseFilter: document.getElementById('phrase-filter'),
  showAllPhrases: document.getElementById('show-all-phrases'),
  tagFilter: document.getElementById('tag-filter'),
  tagList: document.getElementById('tag-list'),
  phrasePanel: document.getElementById('phrase-panel'),
  phraseList: document.getElementById('phrase-list'),
  phraseHint: document.getElementById('phrase-hint'),
  usefulnessFilter: document.getElementById('usefulness-filter'),
  selectionSummary: document.getElementById('selection-summary'),
  studySelected: document.getElementById('study-selected'),
  clearSelection: document.getElementById('clear-selection'),
  presetList: document.getElementById('preset-list'),
  presetForm: document.getElementById('preset-form'),
  presetName: document.getElementById('preset-name'),
  deckTitle: document.getElementById('deck-title'),
  deckDescription: document.getElementById('deck-description'),
  deckProgress: document.getElementById('deck-progress'),
  progressFill: document.getElementById('progress-fill'),
  progressCount: document.getElementById('progress-count'),
  card: document.getElementById('study-card'),
  cardInner: document.getElementById('card-inner'),
  cardFrontText: document.getElementById('card-front-text'),
  cardRomaji: document.getElementById('card-romaji'),
  cardJapanese: document.getElementById('card-japanese'),
  playAudio: document.getElementById('play-audio'),
  prevCard: document.getElementById('prev-card'),
  nextCard: document.getElementById('next-card'),
  flipCard: document.getElementById('flip-card'),
  snackbar: document.getElementById('snackbar')
};

const state = {
  manifest: [],
  phrases: [],
  phraseMap: new Map(),
  deckPhraseMap: new Map(),
  tags: [],
  tagFilterQuery: '',
  filterTokens: [],
  filterQuery: '',
  showAllPhrases: false,
  usefulnessFilter: '0',
  filteredPhrases: [],
  selectedPhraseIds: new Set(),
  defaultDecks: [],
  customDecks: [],
  decks: [],
  currentDeckName: '',
  currentDeckBaseDescription: '',
  cards: [],
  index: 0,
  side: 'front',
  speechSupported: 'speechSynthesis' in window,
  voice: null,
  snackbarTimer: null,
  speechNotified: false,
  transitioning: false,
  transitionTimer: null,
  presetSaveFailed: false
};

const CARD_TRANSITION_DURATION = 500;
const DECK_STORAGE_KEY = 'travel-japanese-phrase-decks';

init();

async function init() {
  state.currentDeckBaseDescription = elements.deckDescription?.textContent || '';
  await loadPhrases();
  await loadDefaultDecks();
  loadDecksFromStorage();
  refreshDeckCollections();
  renderTagList();
  if (elements.tagFilter) {
    elements.tagFilter.value = state.tagFilterQuery;
  }
  if (elements.usefulnessFilter) {
    elements.usefulnessFilter.value = state.usefulnessFilter;
  }
  const initialQuery = elements.phraseFilter?.value ?? '';
  setFilterTokensFromInput(initialQuery);
  applyPhraseFilter();
  attachEventListeners();
  prepareSpeech();
  updatePhrasePanelVisibility();
  updateSelectionControls();
  updateInterfaceForSelection();
  if (!state.speechSupported) {
    notifyOnce('Audio playback is unavailable in this browser.');
  }
}

function attachEventListeners() {
  if (elements.phraseFilter) {
    elements.phraseFilter.addEventListener('input', handlePhraseFilterInput);
  }
  if (elements.showAllPhrases) {
    elements.showAllPhrases.addEventListener('click', handleShowAllToggle);
  }
  if (elements.tagFilter) {
    elements.tagFilter.addEventListener('input', handleTagFilterInput);
  }
  if (elements.tagList) {
    elements.tagList.addEventListener('click', (event) => {
      const button = event.target.closest('.tag-chip');
      if (!button) return;
      const tagName = button.dataset.tag;
      if (tagName) {
        handleTagToggle(tagName);
      }
    });
  }
  if (elements.usefulnessFilter) {
    elements.usefulnessFilter.addEventListener('change', handleUsefulnessFilterChange);
  }
  if (elements.phraseList) {
    elements.phraseList.addEventListener('click', handlePhraseListClick);
  }
  if (elements.studySelected) {
    elements.studySelected.addEventListener('click', () => studySelectedPhrases());
  }
  if (elements.clearSelection) {
    elements.clearSelection.addEventListener('click', () => clearSelection());
  }
  if (elements.presetForm) {
    elements.presetForm.addEventListener('submit', handleDeckSave);
  }
  if (elements.prevCard) {
    elements.prevCard.addEventListener('click', showPreviousCard);
  }
  if (elements.nextCard) {
    elements.nextCard.addEventListener('click', showNextCard);
  }
  if (elements.flipCard) {
    elements.flipCard.addEventListener('click', flipCardSide);
  }
  if (elements.playAudio) {
    elements.playAudio.addEventListener('click', () => speakCurrentCard(false));
  }
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

async function loadPhrases() {
  try {
    const manifest = await loadJson('decks/manifest.json');
    if (!Array.isArray(manifest)) {
      state.manifest = [];
      state.phrases = [];
      return;
    }
    state.manifest = manifest;
    const phraseMap = new Map();
    const deckPhraseMap = new Map();
    const tagLookup = new Map();
    const phrases = [];

    for (const deckMeta of manifest) {
      if (!deckMeta || typeof deckMeta.file !== 'string') continue;
      let deckData;
      try {
        deckData = await loadJson(`decks/${deckMeta.file}`);
      } catch (error) {
        console.error(`Unable to load ${deckMeta.file}`, error);
        continue;
      }
      const cards = Array.isArray(deckData?.cards) ? deckData.cards : [];
      const deckId = deckMeta.id;
      const phraseIdsForDeck = [];
      cards.forEach((card, index) => {
        const id = `${deckId}-${index}`;
        const tags = normalizeTags(card?.tags);
        tags.forEach((tag) => {
          const normalized = normalizeTagName(tag);
          if (!tagLookup.has(normalized)) {
            tagLookup.set(normalized, tag);
          }
        });
        const phrase = {
          id,
          english: card?.english || '',
          romaji: card?.romaji || '',
          japanese: card?.japanese || '',
          tags,
          usefulness: typeof card?.usefulness === 'number' ? card.usefulness : null,
          sourceDeckId: deckId,
          searchText: [card?.english || '', card?.romaji || '', card?.japanese || '', tags.join(' ')]
            .join(' ')
            .toLowerCase(),
          normalizedTags: new Set(tags.map((tag) => normalizeTagName(tag)))
        };
        phrases.push(phrase);
        phraseMap.set(id, phrase);
        phraseIdsForDeck.push(id);
      });
      deckPhraseMap.set(deckId, phraseIdsForDeck);
    }

    state.phrases = phrases;
    state.filteredPhrases = phrases.slice();
    state.phraseMap = phraseMap;
    state.deckPhraseMap = deckPhraseMap;
    state.tags = Array.from(tagLookup.entries())
      .map(([normalized, original]) => ({ normalized, original }))
      .sort((a, b) => a.original.localeCompare(b.original, undefined, { sensitivity: 'base' }));
  } catch (error) {
    console.error(error);
    showSnackbar('Unable to load phrases. Try using a modern browser or a simple web server.');
  }
}

function normalizeTags(input) {
  if (Array.isArray(input)) {
    return input.map((tag) => String(tag || '').trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

function normalizeTagName(tag) {
  return String(tag || '').trim().toLowerCase();
}

function createAllPhrasesDeck() {
  if (!state.phrases.length) return null;
  return {
    name: 'All Phrases',
    phraseIds: state.phrases.map((phrase) => phrase.id),
    isDefault: true
  };
}

function getPhraseIdsForDeckIds(deckIds) {
  const result = [];
  const seen = new Set();
  if (!Array.isArray(deckIds)) return result;
  deckIds.forEach((deckId) => {
    const list = state.deckPhraseMap.get(deckId);
    if (!Array.isArray(list)) return;
    list.forEach((phraseId) => {
      if (!seen.has(phraseId) && state.phraseMap.has(phraseId)) {
        seen.add(phraseId);
        result.push(phraseId);
      }
    });
  });
  return result;
}

async function loadDefaultDecks() {
  try {
    const defaults = await loadJson('decks/default-presets.json');
    if (!Array.isArray(defaults)) {
      const fallback = createAllPhrasesDeck();
      state.defaultDecks = fallback ? [fallback] : [];
      return;
    }
    const decks = defaults
      .map((entry) => {
        if (!entry || typeof entry.name !== 'string') return null;
        let phraseIds = [];
        if (Array.isArray(entry.phraseIds)) {
          phraseIds = entry.phraseIds.filter((id) => state.phraseMap.has(id));
        } else if (Array.isArray(entry.deckIds)) {
          phraseIds = getPhraseIdsForDeckIds(entry.deckIds);
        } else if (entry.type === 'all') {
          phraseIds = state.phrases.map((phrase) => phrase.id);
        }
        const unique = Array.from(new Set(phraseIds));
        if (!unique.length) return null;
        return { name: entry.name, phraseIds: unique, isDefault: true };
      })
      .filter(Boolean);
    if (!decks.length) {
      const fallback = createAllPhrasesDeck();
      if (fallback) decks.push(fallback);
    }
    state.defaultDecks = decks;
  } catch (error) {
    console.warn('Unable to load default decks.', error);
    const fallback = createAllPhrasesDeck();
    state.defaultDecks = fallback ? [fallback] : [];
  }
}

function loadDecksFromStorage() {
  state.customDecks = [];
  if (!('localStorage' in window)) return;
  try {
    const raw = window.localStorage.getItem(DECK_STORAGE_KEY);
    if (!raw) return;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return;
    state.customDecks = stored
      .map((entry) => {
        if (!entry || typeof entry.name !== 'string' || !Array.isArray(entry.phraseIds)) {
          return null;
        }
        const phraseIds = entry.phraseIds.filter((id) => state.phraseMap.has(id));
        if (!phraseIds.length) return null;
        return { name: entry.name, phraseIds, isDefault: false };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn('Unable to load decks from storage.', error);
    state.customDecks = [];
  }
}

function refreshDeckCollections() {
  sortDeckList(state.defaultDecks);
  sortDeckList(state.customDecks);
  state.decks = [...state.defaultDecks, ...state.customDecks];
  renderDecks();
}
function sortDeckList(list) {
  list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function renderDecks() {
  if (!elements.presetList) return;
  elements.presetList.innerHTML = '';
  if (!state.decks.length) {
    const empty = document.createElement('div');
    empty.className = 'preset-empty';
    empty.textContent = 'No decks saved yet.';
    elements.presetList.appendChild(empty);
    return;
  }

  state.decks.forEach((deck) => {
    const item = document.createElement('div');
    item.className = 'preset-item';
    if (deck.isDefault) {
      item.classList.add('is-default');
    }

    const details = document.createElement('div');
    details.className = 'preset-details';

    const nameRow = document.createElement('div');
    nameRow.className = 'preset-name-row';

    const name = document.createElement('div');
    name.className = 'preset-name';
    name.textContent = deck.name;
    nameRow.appendChild(name);

    if (deck.isDefault) {
      const badge = document.createElement('span');
      badge.className = 'preset-badge';
      badge.textContent = 'Default';
      nameRow.appendChild(badge);
    }

    const count = document.createElement('div');
    count.className = 'preset-count';
    count.textContent = `${deck.phraseIds.length} phrase${deck.phraseIds.length === 1 ? '' : 's'}`;

    details.append(nameRow, count);

    const actions = document.createElement('div');
    actions.className = 'preset-actions';

    const loadButton = document.createElement('button');
    loadButton.type = 'button';
    loadButton.className = 'pill-button primary small';
    loadButton.textContent = 'Load';
    loadButton.addEventListener('click', () => applyDeck(deck));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'pill-button outline small';
    deleteButton.textContent = 'Delete';
    if (deck.isDefault) {
      deleteButton.disabled = true;
      deleteButton.setAttribute('aria-disabled', 'true');
      deleteButton.title = 'Default decks cannot be deleted.';
    } else {
      deleteButton.addEventListener('click', () => removeDeck(deck.name));
    }

    actions.append(loadButton, deleteButton);
    item.append(details, actions);
    elements.presetList.appendChild(item);
  });
}

function applyDeck(deck) {
  if (!deck || !Array.isArray(deck.phraseIds)) {
    showSnackbar('That deck is no longer available.');
    return;
  }
  const phraseIds = deck.phraseIds.filter((id) => state.phraseMap.has(id));
  if (!phraseIds.length) {
    showSnackbar('That deck is empty right now.');
    return;
  }
  state.selectedPhraseIds = new Set(phraseIds);
  updateSelectionControls();
  updatePhraseListSelectionState();
  state.currentDeckName = deck.name;
  studySelectedPhrases({ deckName: deck.name });
  showSnackbar(`Loaded deck "${deck.name}".`);
}

function removeDeck(name) {
  const index = state.customDecks.findIndex((deck) => deck.name === name);
  if (index === -1) {
    showSnackbar('Default decks cannot be deleted.');
    return;
  }
  state.customDecks.splice(index, 1);
  refreshDeckCollections();
  persistDecks();
  showSnackbar(`Deleted deck "${name}".`);
}

function handleDeckSave(event) {
  event.preventDefault();
  if (!elements.presetName) return;
  const name = elements.presetName.value.trim();
  if (!name) {
    showSnackbar('Enter a name for your deck.');
    return;
  }
  const phraseIds = Array.from(state.selectedPhraseIds);
  if (!phraseIds.length) {
    showSnackbar('Select at least one phrase before saving a deck.');
    return;
  }

  const normalizedName = name.toLowerCase();
  const existingIndex = state.customDecks.findIndex((deck) => deck.name.toLowerCase() === normalizedName);
  const deck = { name, phraseIds, isDefault: false };
  if (existingIndex >= 0) {
    state.customDecks[existingIndex] = deck;
    showSnackbar(`Updated deck "${name}".`);
  } else {
    const conflictsWithDefault = state.defaultDecks.some(
      (preset) => preset.name.toLowerCase() === normalizedName
    );
    if (conflictsWithDefault) {
      showSnackbar('A default deck already uses that name. Choose a different name.');
      return;
    }
    state.customDecks.push(deck);
    showSnackbar(`Saved deck "${name}".`);
  }
  refreshDeckCollections();
  persistDecks();
  if (elements.presetForm) {
    elements.presetForm.reset();
  }
}

function persistDecks() {
  if (!('localStorage' in window)) return;
  try {
    const payload = state.customDecks.map((deck) => ({
      name: deck.name,
      phraseIds: deck.phraseIds
    }));
    window.localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(payload));
    state.presetSaveFailed = false;
  } catch (error) {
    console.warn('Unable to save decks.', error);
    if (!state.presetSaveFailed) {
      showSnackbar('Unable to save decks in this browser.');
    }
    state.presetSaveFailed = true;
  }
}

function handlePhraseFilterInput(event) {
  const value = event?.target?.value ?? '';
  setFilterTokensFromInput(value);
  applyPhraseFilter();
}

function handleTagFilterInput(event) {
  const value = event?.target?.value ?? '';
  state.tagFilterQuery = value;
  if (elements.tagList) {
    elements.tagList.scrollTop = 0;
  }
  renderTagList();
}

function handleUsefulnessFilterChange(event) {
  const value = event?.target?.value ?? '0';
  state.usefulnessFilter = String(value);
  applyPhraseFilter();
}

function setFilterTokensFromInput(value) {
  state.filterQuery = value;
  const rawTokens = parseFilterQuery(value);
  state.filterTokens = rawTokens
    .map((token) => {
      if (token.type === 'tag') {
        const normalized = normalizeTagName(token.value);
        if (!normalized) return null;
        const display = state.tags.find((tag) => tag.normalized === normalized)?.original || token.value.trim();
        return { type: 'tag', value: display, normalized };
      }
      const trimmed = token.value.trim();
      if (!trimmed) return null;
      return { type: 'text', value: trimmed, normalized: trimmed.toLowerCase() };
    })
    .filter(Boolean);
  updateTagSelectionStates();
}

function parseFilterQuery(query) {
  const tokens = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  for (let i = 0; i < query.length; i += 1) {
    const char = query[i];
    if (inQuotes) {
      if (char === quoteChar) {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuotes = true;
      quoteChar = char;
    } else if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current) {
    tokens.push(current);
  }
  return tokens
    .map((token) => {
      if (token.startsWith('#')) {
        return { type: 'tag', value: token.slice(1) };
      }
      return { type: 'text', value: token };
    })
    .filter(Boolean);
}

function tokensToString(tokens) {
  return tokens
    .map((token) => {
      if (!token || !token.value) return '';
      if (token.type === 'tag') {
        return formatTagToken(token.value);
      }
      return /\s/.test(token.value) ? `"${token.value}"` : token.value;
    })
    .filter(Boolean)
    .join(' ');
}

function formatTagToken(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!/[\s"']/.test(trimmed)) {
    return `#${trimmed}`;
  }
  if (!trimmed.includes('"')) {
    return `#"${trimmed}"`;
  }
  if (!trimmed.includes("'")) {
    return `#'${trimmed}'`;
  }
  const sanitized = trimmed.replace(/["']/g, '');
  return `#'${sanitized}'`;
}

function applyPhraseFilter() {
  const hasTokenFilters = state.filterTokens.length > 0;
  const minUsefulness = Number(state.usefulnessFilter);
  const filterForUnrated = state.usefulnessFilter === 'unrated';
  const filterForMin = !Number.isNaN(minUsefulness) && minUsefulness > 0;
  const hasUsefulnessFilter = filterForMin || filterForUnrated;
  const hasFilter = hasTokenFilters || hasUsefulnessFilter;
  if (!state.showAllPhrases && !hasFilter) {
    state.filteredPhrases = [];
    renderPhraseList();
    updatePhrasePanelVisibility();
    return;
  }

  const tagFilters = state.filterTokens.filter((token) => token.type === 'tag');
  const textFilters = state.filterTokens.filter((token) => token.type === 'text');

  let phrases = state.phrases;
  if (tagFilters.length || textFilters.length || hasUsefulnessFilter) {
    phrases = phrases.filter((phrase) => {
      if (tagFilters.length) {
        const matchesTag = tagFilters.some((filter) => phrase.normalizedTags.has(filter.normalized));
        if (!matchesTag) {
          return false;
        }
      }
      if (textFilters.length) {
        for (const filter of textFilters) {
          if (!phrase.searchText.includes(filter.normalized)) {
            return false;
          }
        }
      }
      if (filterForUnrated) {
        if (typeof phrase.usefulness === 'number') {
          return false;
        }
      } else if (filterForMin) {
        if (typeof phrase.usefulness !== 'number' || phrase.usefulness < minUsefulness) {
          return false;
        }
      }
      return true;
    });
  } else if (state.showAllPhrases) {
    phrases = state.phrases.slice();
  }

  state.filteredPhrases = phrases;
  renderPhraseList();
  updatePhrasePanelVisibility();
}

function renderPhraseList() {
  if (!elements.phraseList) return;
  elements.phraseList.innerHTML = '';
  const hasTokenFilters = state.filterTokens.length > 0;
  const hasUsefulnessFilter = state.usefulnessFilter !== '0';
  const shouldShow = state.showAllPhrases || hasTokenFilters || hasUsefulnessFilter;
  if (!shouldShow) return;

  if (!state.filteredPhrases.length) {
    const empty = document.createElement('div');
    empty.className = 'phrase-empty';
    empty.textContent = 'No phrases match your filter yet.';
    elements.phraseList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  state.filteredPhrases.forEach((phrase) => {
    const item = document.createElement('details');
    item.className = 'phrase-item';
    item.dataset.phraseId = phrase.id;
    item.open = true;
    const isSelected = state.selectedPhraseIds.has(phrase.id);
    if (isSelected) {
      item.classList.add('is-selected');
    }

    const summary = document.createElement('summary');
    summary.className = 'phrase-summary';

    const summaryContent = document.createElement('div');
    summaryContent.className = 'phrase-summary-content';

    const english = document.createElement('div');
    english.className = 'phrase-summary-english';
    english.textContent = phrase.english;
    summaryContent.appendChild(english);

    if (phrase.japanese) {
      const japanese = document.createElement('div');
      japanese.className = 'phrase-summary-japanese';
      japanese.textContent = phrase.japanese;
      summaryContent.appendChild(japanese);
    }

    summary.appendChild(summaryContent);
    item.appendChild(summary);

    const body = document.createElement('div');
    body.className = 'phrase-body';

    if (phrase.romaji || phrase.japanese) {
      const text = document.createElement('div');
      text.className = 'phrase-text';
      if (phrase.romaji) {
        const romaji = document.createElement('div');
        romaji.className = 'phrase-romaji';
        romaji.textContent = phrase.romaji;
        text.appendChild(romaji);
      }
      if (phrase.japanese) {
        const japanese = document.createElement('div');
        japanese.className = 'phrase-japanese';
        japanese.textContent = phrase.japanese;
        text.appendChild(japanese);
      }
      body.appendChild(text);
    }

    const meta = document.createElement('div');
    meta.className = 'phrase-meta';

    const metaDetails = document.createElement('div');
    metaDetails.className = 'phrase-meta-details';

    const usefulness = document.createElement('div');
    usefulness.className = 'phrase-usefulness';
    if (typeof phrase.usefulness === 'number') {
      usefulness.textContent = `Traveler usability: ${phrase.usefulness}/10`;
    } else {
      usefulness.textContent = 'Traveler usability: Unrated';
      usefulness.classList.add('is-unrated');
    }
    metaDetails.appendChild(usefulness);

    const tags = document.createElement('div');
    tags.className = 'phrase-tags';
    if (phrase.tags.length) {
      phrase.tags.forEach((tag) => {
        const chip = document.createElement('span');
        chip.className = 'phrase-tag';
        chip.textContent = `#${tag}`;
        tags.appendChild(chip);
      });
    } else {
      const none = document.createElement('span');
      none.className = 'phrase-tag';
      none.textContent = '#untagged';
      tags.appendChild(none);
    }
    metaDetails.appendChild(tags);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'pill-button ghost small phrase-toggle';
    toggle.dataset.action = 'toggle-selection';
    toggle.textContent = isSelected ? 'Remove' : 'Add phrase';
    if (isSelected) {
      toggle.classList.add('is-remove');
    }

    meta.append(metaDetails, toggle);
    body.appendChild(meta);
    item.appendChild(body);
    fragment.appendChild(item);
  });

  elements.phraseList.appendChild(fragment);
}

function handlePhraseListClick(event) {
  const button = event.target.closest('[data-action="toggle-selection"]');
  if (!button) return;
  const item = button.closest('.phrase-item');
  if (!item) return;
  const phraseId = item.dataset.phraseId;
  if (!phraseId) return;
  const isSelected = state.selectedPhraseIds.has(phraseId);
  togglePhraseSelection(phraseId, !isSelected);
}

function togglePhraseSelection(phraseId, shouldSelect) {
  if (!state.phraseMap.has(phraseId)) return;
  if (shouldSelect) {
    if (state.selectedPhraseIds.has(phraseId)) return;
    state.selectedPhraseIds.add(phraseId);
  } else {
    if (!state.selectedPhraseIds.has(phraseId)) return;
    state.selectedPhraseIds.delete(phraseId);
  }
  updateSelectionControls();
  updateSinglePhraseSelectionState(phraseId);
}

function updateSelectionControls() {
  if (!elements.selectionSummary) return;
  const count = state.selectedPhraseIds.size;
  if (!count) {
    elements.selectionSummary.textContent = 'No phrases selected yet.';
  } else {
    const sample = Array.from(state.selectedPhraseIds)
      .map((id) => state.phraseMap.get(id)?.english)
      .filter(Boolean)
      .slice(0, 3);
    if (!sample.length) {
      elements.selectionSummary.textContent = `${count} phrase${count === 1 ? '' : 's'} selected.`;
    } else {
      const remainder = count - sample.length;
      let summary = `${count} phrase${count === 1 ? '' : 's'} selected: ${formatList(sample)}`;
      if (remainder > 0) {
        summary += `, plus ${remainder} more phrase${remainder === 1 ? '' : 's'}`;
      }
      elements.selectionSummary.textContent = `${summary}.`;
    }
  }
  if (elements.studySelected) {
    elements.studySelected.disabled = !count;
  }
  if (elements.clearSelection) {
    elements.clearSelection.disabled = !count;
  }
}
function studySelectedPhrases(options = {}) {
  const phraseIds = Array.from(state.selectedPhraseIds);
  if (!phraseIds.length) {
    showSnackbar('Select at least one phrase before studying.');
    return;
  }
  const cards = phraseIds.map((id) => state.phraseMap.get(id)).filter(Boolean);
  if (!cards.length) {
    showSnackbar('Selected phrases are unavailable right now.');
    return;
  }
  cancelCardTransition();
  cancelSpeech();
  state.cards = cards;
  state.index = 0;
  state.side = 'front';
  state.currentDeckName = options.deckName || 'Selected phrases';
  updateStudyHeader();
  updateInterfaceForSelection();
  updateCardContent();
}

function clearSelection() {
  if (!state.selectedPhraseIds.size) return;
  state.selectedPhraseIds.clear();
  updateSelectionControls();
  updatePhraseListSelectionState();
  showSnackbar('Selection cleared.');
}

function updatePhraseListSelectionState() {
  if (!elements.phraseList) return;
  elements.phraseList.querySelectorAll('.phrase-item').forEach((item) => {
    const phraseId = item.dataset.phraseId;
    if (!phraseId) return;
    updateSinglePhraseSelectionState(phraseId);
  });
}

function updateSinglePhraseSelectionState(phraseId) {
  if (!elements.phraseList) return;
  const item = elements.phraseList.querySelector(`.phrase-item[data-phrase-id="${phraseId}"]`);
  if (!item) return;
  const isSelected = state.selectedPhraseIds.has(phraseId);
  item.classList.toggle('is-selected', isSelected);
  const button = item.querySelector('[data-action="toggle-selection"]');
  if (button) {
    button.textContent = isSelected ? 'Remove' : 'Add phrase';
    button.classList.toggle('is-remove', isSelected);
  }
}

function updatePhrasePanelVisibility() {
  if (!elements.phrasePanel || !elements.phraseList || !elements.phraseHint) return;
  const hasTokenFilters = state.filterTokens.length > 0;
  const hasUsefulnessFilter = state.usefulnessFilter !== '0';
  const shouldShow = state.showAllPhrases || hasTokenFilters || hasUsefulnessFilter;
  elements.phrasePanel.classList.toggle('is-active', shouldShow);
  elements.phraseHint.hidden = shouldShow;
  elements.phraseList.hidden = !shouldShow;
  if (elements.showAllPhrases) {
    elements.showAllPhrases.textContent = state.showAllPhrases ? 'Hide list' : 'Show all';
    elements.showAllPhrases.setAttribute('aria-pressed', String(state.showAllPhrases));
  }
}

function handleShowAllToggle() {
  state.showAllPhrases = !state.showAllPhrases;
  const hasFilters = state.filterTokens.length > 0 || state.usefulnessFilter !== '0';
  if (!hasFilters) {
    state.filteredPhrases = state.showAllPhrases ? state.phrases.slice() : [];
    renderPhraseList();
    updatePhrasePanelVisibility();
    return;
  }
  applyPhraseFilter();
}

function renderTagList() {
  if (!elements.tagList) return;
  elements.tagList.innerHTML = '';
  if (!state.tags.length) {
    const empty = document.createElement('div');
    empty.className = 'tag-empty';
    empty.textContent = 'No tags available yet.';
    empty.setAttribute('aria-disabled', 'true');
    elements.tagList.appendChild(empty);
    return;
  }
  const query = state.tagFilterQuery.trim().toLowerCase();
  const visibleTags = query
    ? state.tags.filter((tag) =>
        tag.original.toLowerCase().includes(query) || tag.normalized.includes(query)
      )
    : state.tags;
  if (!visibleTags.length) {
    const empty = document.createElement('div');
    empty.className = 'tag-empty';
    empty.textContent = 'No tags match your search yet.';
    elements.tagList.appendChild(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  visibleTags.forEach((tag) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tag-chip';
    button.dataset.tag = tag.original;
    button.dataset.tagNormalized = tag.normalized;
    button.textContent = `#${tag.original}`;
    fragment.appendChild(button);
  });
  elements.tagList.appendChild(fragment);
  updateTagSelectionStates();
}

function handleTagToggle(tagName) {
  const normalized = normalizeTagName(tagName);
  const tokens = [...state.filterTokens];
  const existingIndex = tokens.findIndex((token) => token.type === 'tag' && token.normalized === normalized);
  if (existingIndex >= 0) {
    tokens.splice(existingIndex, 1);
  } else {
    tokens.push({ type: 'tag', value: tagName, normalized });
  }
  const nextValue = tokensToString(tokens);
  if (elements.phraseFilter) {
    elements.phraseFilter.value = nextValue;
    elements.phraseFilter.focus();
  }
  setFilterTokensFromInput(nextValue);
  applyPhraseFilter();
}

function updateTagSelectionStates() {
  if (!elements.tagList) return;
  const active = new Set(
    state.filterTokens.filter((token) => token.type === 'tag').map((token) => token.normalized)
  );
  elements.tagList.querySelectorAll('.tag-chip').forEach((chip) => {
    const normalized = chip.dataset.tagNormalized;
    chip.classList.toggle('is-active', Boolean(normalized && active.has(normalized)));
  });
}

function updateStudyHeader() {
  if (!elements.deckTitle) return;
  const title = state.currentDeckName || 'Study phrases';
  elements.deckTitle.textContent = title;
  updateDeckDescription();
}

function updateDeckDescription() {
  if (!elements.deckDescription) return;
  const count = state.cards.length;
  if (!count) {
    elements.deckDescription.textContent = state.currentDeckBaseDescription || '';
    return;
  }
  elements.deckDescription.textContent = `Studying ${count} phrase${count === 1 ? '' : 's'}.`;
}

function updateInterfaceForSelection() {
  const hasCards = state.cards.length > 0;
  if (elements.deckProgress) {
    elements.deckProgress.hidden = !hasCards;
  }
  if (elements.prevCard) {
    elements.prevCard.disabled = !hasCards;
  }
  if (elements.nextCard) {
    elements.nextCard.disabled = !hasCards;
  }
  if (elements.flipCard) {
    elements.flipCard.disabled = !hasCards;
  }
  updateNavigationStates();
  updateFlipLabel();
  updateAudioState();
  updateProgress();
  if (!hasCards) {
    cancelCardTransition();
    if (elements.card) {
      elements.card.dataset.side = 'front';
    }
    if (elements.cardFrontText) {
      elements.cardFrontText.textContent = 'Select phrases to begin.';
    }
    if (elements.cardRomaji) {
      elements.cardRomaji.textContent = 'ローマ字';
    }
    if (elements.cardJapanese) {
      elements.cardJapanese.textContent = '日本語';
    }
  }
  updateDeckDescription();
}

function updateCardContent() {
  const card = state.cards[state.index];
  if (!card) {
    if (elements.cardFrontText) {
      elements.cardFrontText.textContent = 'Select phrases to begin.';
    }
    if (elements.cardRomaji) {
      elements.cardRomaji.textContent = 'ローマ字';
    }
    if (elements.cardJapanese) {
      elements.cardJapanese.textContent = '日本語';
    }
    setCardSide('front');
    updateNavigationStates();
    updateProgress();
    updateAudioState();
    return;
  }
  if (elements.cardFrontText) {
    elements.cardFrontText.textContent = card.english;
  }
  if (elements.cardRomaji) {
    elements.cardRomaji.textContent = card.romaji || '';
  }
  if (elements.cardJapanese) {
    elements.cardJapanese.textContent = card.japanese || '';
  }
  setCardSide('front');
  updateNavigationStates();
  updateProgress();
  updateAudioState();
}

function showNextCard() {
  if (state.transitioning || state.index >= state.cards.length - 1) return;
  beginCardTransition(1);
}

function showPreviousCard() {
  if (state.transitioning || state.index <= 0) return;
  beginCardTransition(-1);
}

function flipCardSide() {
  if (!state.cards.length) return;
  state.side = state.side === 'front' ? 'back' : 'front';
  setCardSide(state.side);
  updateFlipLabel();
  updateAudioState();
  if (state.side === 'back') {
    speakCurrentCard(true);
  }
}

function setCardSide(side) {
  if (!elements.card) return;
  if (side === 'front') {
    elements.card.dataset.side = 'front';
    state.side = 'front';
  } else {
    elements.card.dataset.side = 'back';
    state.side = 'back';
  }
}

function updateFlipLabel() {
  if (!elements.flipCard) return;
  elements.flipCard.textContent = state.side === 'front' ? 'Flip Card' : 'Show Front';
}

function updateNavigationStates() {
  if (!elements.prevCard || !elements.nextCard) return;
  const count = state.cards.length;
  if (!count) {
    elements.prevCard.disabled = true;
    elements.nextCard.disabled = true;
    return;
  }
  elements.prevCard.disabled = state.index === 0;
  elements.nextCard.disabled = state.index >= count - 1;
}

function updateProgress() {
  if (!elements.progressFill || !elements.progressCount) return;
  const count = state.cards.length;
  if (!count) {
    elements.progressFill.style.width = '0%';
    elements.progressCount.textContent = '0 of 0';
    return;
  }
  const position = state.index + 1;
  const percentage = Math.round((position / count) * 100);
  elements.progressFill.style.width = `${percentage}%`;
  elements.progressCount.textContent = `${position} of ${count}`;
}

function beginCardTransition(direction) {
  if (!elements.cardInner) return;
  state.transitioning = true;
  elements.cardInner.classList.add('is-fading');
  state.transitionTimer = setTimeout(() => {
    state.transitionTimer = null;
    elements.cardInner.classList.remove('is-fading');
    state.index += direction;
    if (state.index < 0) state.index = 0;
    if (state.index >= state.cards.length) state.index = state.cards.length - 1;
    state.side = 'front';
    updateCardContent();
    state.transitioning = false;
  }, CARD_TRANSITION_DURATION);
}

function cancelCardTransition() {
  if (state.transitionTimer) {
    clearTimeout(state.transitionTimer);
    state.transitionTimer = null;
  }
  if (elements.cardInner) {
    elements.cardInner.classList.remove('is-fading');
  }
  state.transitioning = false;
}

function prepareSpeech() {
  if (!state.speechSupported) return;
  const synth = window.speechSynthesis;
  const populateVoices = () => {
    const voices = synth
      .getVoices()
      .filter((voice) => voice.lang && voice.lang.toLowerCase().startsWith('ja'));
    if (voices.length) {
      state.voice = voices.find((voice) => voice.lang.toLowerCase() === 'ja-jp') || voices[0];
      updateAudioState();
    }
  };
  populateVoices();
  synth.addEventListener('voiceschanged', () => {
    populateVoices();
  });
}

function updateAudioState() {
  const canPlay = Boolean(state.cards.length && state.side === 'back' && state.speechSupported);
  if (!elements.playAudio) return;
  elements.playAudio.disabled = !canPlay;
  elements.playAudio.setAttribute('aria-disabled', String(!canPlay));
}

function speakCurrentCard(autoTriggered) {
  if (!state.speechSupported) {
    if (!state.speechNotified && !autoTriggered) {
      notifyOnce('Audio playback is unavailable in this browser.');
    }
    return;
  }
  const card = state.cards[state.index];
  if (!card) return;
  const synth = window.speechSynthesis;
  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(card.japanese);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  if (state.voice) {
    utterance.voice = state.voice;
  }
  synth.speak(utterance);
}

function cancelSpeech() {
  if (!state.speechSupported) return;
  window.speechSynthesis.cancel();
}

function handleKeyboardShortcuts(event) {
  const activeTag = event.target.tagName;
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || event.target.isContentEditable) {
    return;
  }
  if (!state.cards.length) return;
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    showPreviousCard();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    showNextCard();
  } else if (event.key === ' ') {
    event.preventDefault();
    flipCardSide();
  }
}

function showSnackbar(message) {
  if (!message || !elements.snackbar) return;
  elements.snackbar.textContent = message;
  elements.snackbar.hidden = false;
  if (state.snackbarTimer) {
    clearTimeout(state.snackbarTimer);
  }
  state.snackbarTimer = setTimeout(() => {
    elements.snackbar.hidden = true;
  }, 2800);
}

function notifyOnce(message) {
  if (state.speechNotified) return;
  state.speechNotified = true;
  showSnackbar(message);
}

function formatList(items) {
  if (!items.length) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

async function loadJson(relativePath) {
  const shouldUseModule = window.location.protocol === 'file:';
  if (!shouldUseModule) {
    try {
      const response = await fetch(relativePath);
      if (!response.ok) throw new Error(`Unable to load ${relativePath} (${response.status})`);
      return await response.json();
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }
      console.warn(`Falling back to module import for ${relativePath} due to fetch error.`, error);
    }
  }
  return loadJsonFromModule(relativePath);
}

async function loadJsonFromModule(relativePath) {
  const normalized =
    relativePath.startsWith('./') || relativePath.startsWith('../') ? relativePath : `./${relativePath}`;
  const moduleUrl = new URL(normalized, import.meta.url).href;
  const module = await import(moduleUrl, { assert: { type: 'json' } });
  return module.default;
}
