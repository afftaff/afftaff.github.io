const elements = {
  deckList: document.getElementById('deck-list'),
  deckFilter: document.getElementById('deck-filter'),
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
  filtered: [],
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
  transitionTimer: null
};

const CARD_TRANSITION_DURATION = 500;

init();

async function init() {
  await loadManifest();
  applyFilter('');
  attachEventListeners();
  prepareSpeech();
  updateInterfaceForSelection();
  if (!state.speechSupported) {
    notifyOnce('Audio playback is unavailable in this browser.');
  }
}

function attachEventListeners() {
  elements.deckFilter.addEventListener('input', (event) => {
    applyFilter(event.target.value);
  });

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
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'deck-button';
    button.dataset.deckId = deck.id;
    button.innerHTML = `<h3>${deck.title}</h3><p>${deck.description}</p>`;
    if (deck.id === state.currentDeckId) {
      button.setAttribute('aria-current', 'true');
    }
    button.addEventListener('click', () => selectDeck(deck.id));
    elements.deckList.appendChild(button);
  });
}

async function selectDeck(deckId) {
  if (deckId === state.currentDeckId) return;
  const deckMeta = state.manifest.find((deck) => deck.id === deckId);
  if (!deckMeta) return;

  cancelCardTransition();

  let deckData = state.deckCache.get(deckId);
  if (!deckData) {
    try {
      deckData = await loadJson(`decks/${deckMeta.file}`);
      state.deckCache.set(deckId, deckData);
    } catch (error) {
      console.error(error);
      showSnackbar('Unable to open that deck right now.');
      return;
    }
  }

  state.currentDeckId = deckId;
  state.currentDeckTitle = deckData.title;
  state.cards = deckData.cards || [];
  state.index = 0;
  state.side = 'front';

  updateDeckHeader(deckData);
  updateInterfaceForSelection();
  renderDeckList();
  updateCardContent();
  showSnackbar(`Loaded deck: ${deckData.title}`);
}

function updateDeckHeader(deckData) {
  elements.deckTitle.textContent = deckData.title;
  elements.deckDescription.textContent = deckData.description;
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
    elements.cardFrontText.textContent = 'Select a deck to begin.';
    elements.cardRomaji.textContent = 'ローマ字';
    elements.cardJapanese.textContent = '日本語';
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
