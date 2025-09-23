const elements = {
  deckList: document.getElementById('deck-list'),
  deckFilter: document.getElementById('deck-filter'),
  selectionSummary: document.getElementById('selection-summary'),
  studySelected: document.getElementById('study-selected'),
  clearSelection: document.getElementById('clear-selection'),
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
  presetList: document.getElementById('preset-list'),
  presetForm: document.getElementById('preset-form'),
  presetName: document.getElementById('preset-name'),
  playAudio: document.getElementById('play-audio'),
  prevCard: document.getElementById('prev-card'),
  nextCard: document.getElementById('next-card'),
  flipCard: document.getElementById('flip-card'),
  snackbar: document.getElementById('snackbar')
};

const state = {
  manifest: [],
  filtered: [],
  selectedDeckIds: new Set(),
  presets: [],
  deckCache: new Map(),
  currentDeckId: null,
  currentDeckTitle: '',
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
const PRESET_STORAGE_KEY = 'travel-japanese-presets';

init();

async function init() {
  await loadManifest();
  loadPresetsFromStorage();
  applyFilter('');
  renderPresets();
  attachEventListeners();
  prepareSpeech();
  updateInterfaceForSelection();
  updateSelectionControls();
  if (!state.speechSupported) {
    notifyOnce('Audio playback is unavailable in this browser.');
  }
}

function attachEventListeners() {
  elements.deckFilter.addEventListener('input', (event) => {
    applyFilter(event.target.value);
  });

  if (elements.studySelected) {
    elements.studySelected.addEventListener('click', () => {
      studySelectedDecks();
    });
  }

  if (elements.clearSelection) {
    elements.clearSelection.addEventListener('click', () => {
      clearSelection();
    });
  }

  if (elements.presetForm) {
    elements.presetForm.addEventListener('submit', handlePresetSave);
  }

  elements.prevCard.addEventListener('click', showPreviousCard);
  elements.nextCard.addEventListener('click', showNextCard);
  elements.flipCard.addEventListener('click', flipCardSide);
  elements.playAudio.addEventListener('click', () => speakCurrentCard(false));

  document.addEventListener('keydown', handleKeyboardShortcuts);
}

async function loadManifest() {
  try {
    state.manifest = await loadJson('decks/manifest.json');
    state.filtered = state.manifest.slice();
  } catch (error) {
    console.error(error);
    showSnackbar('Unable to load deck list. If the site is opened directly from your files, try a modern browser or a simple web server.');
  }
}

function applyFilter(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    state.filtered = state.manifest.slice();
  } else {
    state.filtered = state.manifest.filter((deck) => {
      return (
        deck.title.toLowerCase().includes(normalized) ||
        deck.description.toLowerCase().includes(normalized)
      );
    });
  }
  renderDeckList();
  updateSelectionControls();
}

function renderDeckList() {
  elements.deckList.innerHTML = '';
  if (!state.filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'deck-empty';
    empty.textContent = 'No decks match that search yet.';
    elements.deckList.appendChild(empty);
    return;
  }

  state.filtered.forEach((deck) => {
    const option = document.createElement('label');
    option.className = 'deck-button deck-option';
    option.dataset.deckId = deck.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'deck-selection';
    checkbox.value = deck.id;
    checkbox.checked = state.selectedDeckIds.has(deck.id);
    checkbox.addEventListener('change', (event) => {
      toggleDeckSelection(deck.id, event.target.checked);
      option.classList.toggle('is-selected', event.target.checked);
    });

    const content = document.createElement('div');
    content.className = 'deck-option-content';
    content.innerHTML = `<h3>${deck.title}</h3><p>${deck.description}</p>`;

    option.append(checkbox, content);
    option.classList.toggle('is-selected', checkbox.checked);
    elements.deckList.appendChild(option);
  });
}

function updateDeckHeader(deckData) {
  elements.deckTitle.textContent = deckData.title;
  elements.deckDescription.textContent = deckData.description || '';
  elements.deckProgress.hidden = !state.cards.length;
}

function updateInterfaceForSelection() {
  const hasDeck = state.cards.length > 0;
  elements.prevCard.disabled = !hasDeck;
  elements.nextCard.disabled = !hasDeck;
  elements.flipCard.disabled = !hasDeck;
  updateNavigationStates();
  updateFlipLabel();
  updateAudioState();
  updateProgress();
  if (!hasDeck) {
    cancelCardTransition();
    elements.card.dataset.side = 'front';
    elements.cardFrontText.textContent = 'Select decks to begin.';
    elements.cardRomaji.textContent = 'ローマ字';
    elements.cardJapanese.textContent = '日本語';
  }
}

function toggleDeckSelection(deckId, isSelected) {
  if (!deckId) return;
  if (isSelected) {
    state.selectedDeckIds.add(deckId);
  } else {
    state.selectedDeckIds.delete(deckId);
  }
  updateSelectionControls();
}

function clearSelection() {
  if (!state.selectedDeckIds.size) return;
  state.selectedDeckIds.clear();
  renderDeckList();
  updateSelectionControls();
  showSnackbar('Selection cleared.');
}

function updateSelectionControls() {
  if (!elements.selectionSummary) return;
  const deckCount = state.selectedDeckIds.size;
  if (!deckCount) {
    elements.selectionSummary.textContent = 'No decks selected yet.';
  } else {
    const orderedIds = getOrderedDeckIds(state.selectedDeckIds);
    const titles = orderedIds
      .map((id) => state.manifest.find((deck) => deck.id === id)?.title)
      .filter(Boolean);
    if (deckCount === 1 && titles.length === 1) {
      elements.selectionSummary.textContent = `1 deck selected: ${titles[0]}.`;
    } else {
      const preview = titles.slice(0, 3);
      const remainder = deckCount - preview.length;
      if (preview.length) {
        let summary = `${deckCount} decks selected: ${formatList(preview)}`;
        if (remainder > 0) {
          summary += `, plus ${remainder} more deck${remainder > 1 ? 's' : ''}`;
        }
        elements.selectionSummary.textContent = `${summary}.`;
      } else {
        elements.selectionSummary.textContent = `${deckCount} decks selected.`;
      }
    }
  }
  const hasSelection = deckCount > 0;
  if (elements.studySelected) {
    elements.studySelected.disabled = !hasSelection;
  }
  if (elements.clearSelection) {
    elements.clearSelection.disabled = !hasSelection;
  }
}

async function studySelectedDecks() {
  const deckIds = getOrderedDeckIds(state.selectedDeckIds);
  if (!deckIds.length) return;

  const deckMetas = deckIds
    .map((id) => state.manifest.find((deck) => deck.id === id))
    .filter(Boolean);
  if (!deckMetas.length) {
    showSnackbar('Selected decks are unavailable right now.');
    return;
  }

  cancelCardTransition();

  let deckDataList;
  try {
    deckDataList = await Promise.all(deckMetas.map((meta) => ensureDeckData(meta)));
  } catch (error) {
    console.error(error);
    showSnackbar('Unable to open one of the selected decks right now.');
    return;
  }

  const cards = deckDataList.flatMap((deck) => deck.cards || []);
  if (!cards.length) {
    state.cards = [];
    updateInterfaceForSelection();
    showSnackbar('The selected decks do not contain any cards yet.');
    return;
  }

  const combinedTitle =
    deckDataList.length === 1 ? deckDataList[0].title : `Combined deck (${deckDataList.length} decks)`;

  state.currentDeckId = deckIds.length === 1 ? deckIds[0] : `combo:${deckIds.join('+')}`;
  state.currentDeckTitle = combinedTitle;
  state.cards = cards;
  state.index = 0;
  state.side = 'front';

  const description =
    deckDataList.length === 1
      ? deckDataList[0].description
      : buildCombinedDescription(
          deckDataList.map((deck) => deck.title),
          cards.length
        );

  updateDeckHeader({
    title: combinedTitle,
    description
  });
  updateInterfaceForSelection();
  updateCardContent();
  showSnackbar(
    `Loaded ${deckDataList.length} deck${deckDataList.length > 1 ? 's' : ''} (${cards.length} card${cards.length === 1 ? '' : 's'}).`
  );
}

function buildCombinedDescription(titles, cardCount) {
  if (!titles.length) {
    return `Studying ${cardCount} card${cardCount === 1 ? '' : 's'}.`;
  }
  const preview = titles.slice(0, 3);
  const remainder = titles.length - preview.length;
  let description = `Studying ${cardCount} card${cardCount === 1 ? '' : 's'} from ${formatList(preview)}`;
  if (remainder > 0) {
    description += `, plus ${remainder} more deck${remainder > 1 ? 's' : ''}`;
  }
  return `${description}.`;
}

function formatList(items) {
  if (!items.length) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function getOrderedDeckIds(source) {
  const ids = Array.isArray(source) ? source : Array.from(source);
  const lookup = new Set(ids);
  return state.manifest.filter((deck) => lookup.has(deck.id)).map((deck) => deck.id);
}

async function ensureDeckData(deckMeta) {
  if (!deckMeta) throw new Error('Deck metadata missing');
  let deckData = state.deckCache.get(deckMeta.id);
  if (!deckData) {
    deckData = await loadJson(`decks/${deckMeta.file}`);
    state.deckCache.set(deckMeta.id, deckData);
  }
  return deckData;
}

function handlePresetSave(event) {
  event.preventDefault();
  if (!elements.presetName) return;
  const name = elements.presetName.value.trim();
  if (!name) {
    showSnackbar('Enter a name for your preset.');
    return;
  }
  const deckIds = getOrderedDeckIds(state.selectedDeckIds);
  if (!deckIds.length) {
    showSnackbar('Select at least one deck before saving a preset.');
    return;
  }

  const existingIndex = state.presets.findIndex((preset) => preset.name.toLowerCase() === name.toLowerCase());
  const preset = { name, deckIds };
  if (existingIndex >= 0) {
    state.presets[existingIndex] = preset;
    showSnackbar(`Updated preset "${name}".`);
  } else {
    state.presets.push(preset);
    showSnackbar(`Saved preset "${name}".`);
  }
  sortPresets();
  persistPresets();
  renderPresets();
  if (elements.presetForm) {
    elements.presetForm.reset();
  }
}

function renderPresets() {
  if (!elements.presetList) return;
  elements.presetList.innerHTML = '';
  if (!state.presets.length) {
    const empty = document.createElement('div');
    empty.className = 'preset-empty';
    empty.textContent = 'No presets saved yet.';
    elements.presetList.appendChild(empty);
    return;
  }

  state.presets.forEach((preset) => {
    const item = document.createElement('div');
    item.className = 'preset-item';

    const details = document.createElement('div');
    details.className = 'preset-details';

    const name = document.createElement('div');
    name.className = 'preset-name';
    name.textContent = preset.name;

    const count = document.createElement('div');
    count.className = 'preset-count';
    count.textContent = `${preset.deckIds.length} deck${preset.deckIds.length === 1 ? '' : 's'}`;

    details.append(name, count);

    const actions = document.createElement('div');
    actions.className = 'preset-actions';

    const loadButton = document.createElement('button');
    loadButton.type = 'button';
    loadButton.className = 'pill-button primary small';
    loadButton.textContent = 'Load';
    loadButton.addEventListener('click', () => applyPreset(preset));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'pill-button outline small';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => removePreset(preset.name));

    actions.append(loadButton, deleteButton);
    item.append(details, actions);
    elements.presetList.appendChild(item);
  });
}

function applyPreset(preset) {
  const deckIds = getOrderedDeckIds(preset.deckIds);
  if (!deckIds.length) {
    showSnackbar('That preset no longer matches any decks.');
    return;
  }
  state.selectedDeckIds = new Set(deckIds);
  renderDeckList();
  updateSelectionControls();
  studySelectedDecks();
}

function removePreset(name) {
  const index = state.presets.findIndex((preset) => preset.name === name);
  if (index === -1) return;
  state.presets.splice(index, 1);
  persistPresets();
  renderPresets();
  showSnackbar(`Deleted preset "${name}".`);
}

function sortPresets() {
  state.presets.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function loadPresetsFromStorage() {
  if (!('localStorage' in window)) return;
  try {
    const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return;
    const validIds = new Set(state.manifest.map((deck) => deck.id));
    state.presets = stored
      .filter((preset) => preset && typeof preset.name === 'string' && Array.isArray(preset.deckIds))
      .map((preset) => ({
        name: preset.name,
        deckIds: preset.deckIds.filter((id) => validIds.has(id))
      }))
      .filter((preset) => preset.deckIds.length);
    sortPresets();
  } catch (error) {
    console.warn('Unable to load presets from storage.', error);
    state.presets = [];
  }
}

function persistPresets() {
  if (!('localStorage' in window)) return;
  try {
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(state.presets));
    state.presetSaveFailed = false;
  } catch (error) {
    console.warn('Unable to save presets.', error);
    if (!state.presetSaveFailed) {
      showSnackbar('Unable to save presets in this browser.');
    }
    state.presetSaveFailed = true;
  }
}

function updateCardContent() {
  const card = state.cards[state.index];
  if (!card) {
    updateInterfaceForSelection();
    return;
  }
  elements.cardFrontText.textContent = card.english;
  elements.cardRomaji.textContent = card.romaji;
  elements.cardJapanese.textContent = card.japanese;
  setCardSide('front');
  updateNavigationStates();
  updateProgress();
  updateAudioState();
}

function updateNavigationStates() {
  const count = state.cards.length;
  if (!count) {
    elements.prevCard.disabled = true;
    elements.nextCard.disabled = true;
    return;
  }
  elements.prevCard.disabled = state.index === 0;
  elements.nextCard.disabled = state.index === count - 1;
}

function updateProgress() {
  if (!state.cards.length) {
    elements.progressFill.style.width = '0%';
    elements.progressCount.textContent = '';
    return;
  }
  const current = state.index + 1;
  const total = state.cards.length;
  const percent = Math.round((current / total) * 100);
  elements.progressFill.style.width = `${percent}%`;
  elements.progressCount.textContent = `Card ${current} of ${total}`;
}

function updateFlipLabel() {
  elements.flipCard.textContent = state.side === 'back' ? 'Show English' : 'Show Japanese';
}

function flipCardSide() {
  if (!state.cards.length || state.transitioning) return;
  const nextSide = state.side === 'front' ? 'back' : 'front';
  setCardSide(nextSide);
}

function setCardSide(side) {
  state.side = side;
  elements.card.dataset.side = side;
  updateFlipLabel();
  updateAudioState();
  if (side === 'back') {
    speakCurrentCard(true);
  } else {
    cancelSpeech();
  }
}

function showPreviousCard() {
  if (!state.cards.length || state.index === 0 || state.transitioning) return;
  changeCard(state.index - 1);
}

function showNextCard() {
  if (
    !state.cards.length ||
    state.index >= state.cards.length - 1 ||
    state.transitioning
  ) {
    return;
  }
  changeCard(state.index + 1);
}

function changeCard(newIndex) {
  if (state.transitioning || newIndex < 0 || newIndex >= state.cards.length) return;
  setCardSide('front');
  state.transitioning = true;
  if (state.transitionTimer) {
    clearTimeout(state.transitionTimer);
    state.transitionTimer = null;
  }
  if (!elements.cardInner) {
    state.index = newIndex;
    updateCardContent();
    state.transitioning = false;
    return;
  }
  elements.cardInner.classList.add('is-fading');
  state.transitionTimer = window.setTimeout(() => {
    state.transitionTimer = null;
    state.index = newIndex;
    updateCardContent();
    window.requestAnimationFrame(() => {
      elements.cardInner.classList.remove('is-fading');
      state.transitioning = false;
    });
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

function showSnackbar(message) {
  if (!message) return;
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
  try {
    const module = await import(moduleUrl, { assert: { type: 'json' } });
    return module.default;
  } catch (error) {
    console.error(`Module import failed for ${relativePath}.`, error);
    throw new Error(
      'Unable to read local JSON files. Please use a browser with JSON module support or serve the site over HTTP.'
    );
  }
}
