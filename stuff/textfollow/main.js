/* main.js */

// Global Variables
let sentences = [];
let currentSentenceIndex = 0;
let translationMode = 'sweep';
let sweepSpeed = 5;

const sentenceCache = {}; // Cache to store processed sentences

// Variables for Listening Test
let currentChunkIndex = 0;
let chunkState = []; // Array to track the state of each chunk
let chunks = []; // Original chunks
let shuffledChunks = []; // Shuffled chunks for random order
let listeningTestCompleted = false;


// Function to check if API key is in local storage and prompt the user to enter it if not
function checkAndPromptApiKey() {
    let apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'api-key-overlay';
        // (overlay styles)

        // Create modal
        const modal = document.createElement('div');
        // (modal styles)

        const modalText = document.createElement('p');
        modalText.textContent = 'Please enter your API key:';

        const apiKeyInput = document.createElement('input');
        apiKeyInput.type = 'text';
        // (input styles)

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save API Key';

        saveButton.addEventListener('click', () => {
            const apiKeyValue = apiKeyInput.value.trim();
            if (apiKeyValue) {
                localStorage.setItem('apiKey', apiKeyValue);
                apiKey = apiKeyValue;
                // Remove the modal
                document.body.removeChild(overlay);
            } else {
                alert('API key cannot be empty.');
            }
        });

        // Assemble modal
        modal.appendChild(modalText);
        modal.appendChild(apiKeyInput);
        modal.appendChild(saveButton);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }
}

// Function to create a "Change API Key" button
function createChangeApiKeyButton() {
    const changeApiKeyButton = document.createElement('button');
    changeApiKeyButton.textContent = 'Change API Key';
    changeApiKeyButton.id = 'change-api-key-btn';
    // (button styles)

    changeApiKeyButton.addEventListener('click', () => {
        // Clear the stored API key and prompt the user to enter a new one
        localStorage.removeItem('apiKey');
        checkAndPromptApiKey();
    });

    document.body.appendChild(changeApiKeyButton);
}

// Initialize API key and create the change button
window.addEventListener('DOMContentLoaded', () => {
    checkAndPromptApiKey();
    createChangeApiKeyButton();
    handleRouteChange();
});

const sentenceWithFragmentMarkings = function(){
    if (sentenceCache[sentences[currentSentenceIndex]] && sentenceCache[sentences[currentSentenceIndex]].fragments.sentenceWithFragments) {
        // Split by newlines and return the first line
        return  sentenceCache[sentences[currentSentenceIndex]].fragments.sentenceWithFragments.split('\n')[0];
    }
    else
    {
        return '';
    }
}


//variables
const excludedTypes = ['ponctuation', 'nombre', 'article', 'pronom', 'préposition', 'article défini', 'nom propre', 'article', 'article défini'];
const wordTypes = ['verbe', 'nom', 'adjectif', 'adverbe', 'pronom', 'préposition', 'conjonction', 'interjection', 'article'];
const verbTypes = ['verbe régulier', 'verbe irrégulier', 'verbe réfléchi', 'verbe auxiliaire', 'verbe modal'];
const adjectiveTypes = ['adjectif descriptif', 'adjectif possessif', 'adjectif démonstratif', 'adjectif interrogatif', 'adjectif indéfini', 'adjectif numéral'];
const nounTypes = ['nom commun', 'nom propre', 'nom abstrait', 'nom collectif', 'nom composé', 'nom féminin', 'nom masculin'];
const tenses = [
    'Présent', 
    'Passé', 
    'Imparfait', 
    'Futur', 
    'Conditionnel', 
    'Subjonctif', 
    'Plus-que-parfait', 
    'Passé antérieur', 
    'Passé composé', 
    'Futur antérieur', 
    'Conditionnel passé', 
    'Subjonctif passé', 
    'Passé simple',
    'Participe passé',
    'Infinitif'

  ];
const subjects = ['Je', 'Tu', 'Il', 'Elle', 'Nous', 'Vous', 'Ils', 'Elles'];

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Initialize the router
window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('DOMContentLoaded', handleRouteChange);

/**
 * Function to handle route changes based on the URL hash
 */
function handleRouteChange() {
    const hash = window.location.hash || '#/';
    // Hide all routes initially
    document.querySelectorAll('.route').forEach(routeDiv => {
        routeDiv.classList.add('hidden');
    });

    switch(hash) {
        case '#/':
            // Show input-sentences
            document.getElementById('route-input').classList.remove('hidden');
            break;
        case '#/step1':
            // Show listening-test-route
            document.getElementById('route-step1').classList.remove('hidden');
            break;
        case '#/step2':
            // Show step2-route
            document.getElementById('route-step2').classList.remove('hidden');
            // Load the default view (Fragments)
            switchView('fragments');
            break;
        case '#/step3':
            // Show step3-route
            document.getElementById('route-step3').classList.remove('hidden');
            break;
        default:
            // If route not recognized, default to input-sentences
            document.getElementById('route-input').classList.remove('hidden');
            break;
    }
}

/**
 * Function to navigate to a specific route using hash-based routing
 * @param {string} path - The hash path to navigate to (e.g., '#/step1')
 */
function navigateTo(path) {
    window.location.hash = path;
}

/**
 * Event listener for the Start Listening Test button (Route: #/)
 */
document.getElementById('process-btn').addEventListener('click', async () => {
    const sentencesInput = document.getElementById('sentence-input').value.trim();
    if (!sentencesInput) {
        alert('Please enter at least one sentence.');
        return;
    }

    sentences = sentencesInput.split('\n').filter(sentence => sentence.trim() !== '');
    currentSentenceIndex = 0;

    // Disable the Start button
    document.getElementById('process-btn').disabled = true;

    // Navigate to #/step1
    navigateTo('#/step1');

    // Start the listening test for the first sentence
    await startListeningTest();
});

/**
 * Event listener for the Skip All button (Route: #/step1)
 */
document.getElementById('skip-all-btn').addEventListener('click', () => {
    revealAllChunksAsSkipped();
    checkIfListeningTestCompleted();
});

/**
 * Event listener for the Proceed to Step 2 button (Route: #/step1)
 */
document.getElementById('proceed-step2-btn').addEventListener('click', async () => {
    // Navigate to #/step2
    navigateTo('#/step2');
    // Removed the direct call to switchView('fragments') to prevent double API calls
});


/**
 * Function to start the listening test for the current sentence
 */
async function startListeningTest() {
    const sentence = sentences[currentSentenceIndex];
    const listeningTestContainer = document.getElementById('listening-test-container');

    // Break the sentence into chunks of 3-4 words
    chunks = splitSentenceIntoChunks(sentence);

    // Shuffle the chunks
    shuffledChunks = shuffleArray([...chunks]);

    // Initialize the state for each chunk
    chunkState = chunks.map(() => ({
        attempted: false,
        correct: false,
        skipped: false,
    }));

    // Reset current chunk index and completion flag
    currentChunkIndex = 0;
    listeningTestCompleted = false;

    // Clear previous content
    listeningTestContainer.innerHTML = '';

    // Create the display for the chunks
    createListeningTestUI(chunks, shuffledChunks, chunkState, listeningTestContainer);
}

/**
 * Function to create the listening test UI
 */
function createListeningTestUI(chunks, shuffledChunks, chunkState, container) {
    const chunkDisplay = document.createElement('div');
    chunkDisplay.classList.add('chunk-display');

    // Create the sentence display with hidden chunks
    chunks.forEach((chunk, index) => {
        const chunkSpan = document.createElement('span');
        chunkSpan.textContent = chunk + ' ';
        chunkSpan.dataset.index = index;
        chunkSpan.classList.add('chunk-hidden');
        chunkDisplay.appendChild(chunkSpan);
    });

    container.appendChild(chunkDisplay);

    // Create the controls for the listening test
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'listening-controls';

    // Play Chunk Button
    const playButton = document.createElement('button');
    playButton.textContent = 'Play Chunk';
    playButton.addEventListener('click', () => {
        playCurrentChunkAudio(shuffledChunks[currentChunkIndex]);
    });

    // Dropdown for selecting the chunk
    const chunkSelect = document.createElement('select');
    chunkSelect.id = 'chunk-selector'; // Assigning an ID here
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select the heard chunk --';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    chunkSelect.appendChild(defaultOption);

    // Populate the dropdown with shuffled chunks
    shuffleArray([...chunks]).forEach((chunk) => {
        const option = document.createElement('option');
        option.value = chunk;
        option.textContent = chunk;
        chunkSelect.appendChild(option);
    });

    // OK Button
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.addEventListener('click', () => {
        const selectedChunk = chunkSelect.value;
        if (!selectedChunk) {
            alert('Please select a chunk from the dropdown.');
            return;
        }
        handleChunkGuess(selectedChunk, chunks, shuffledChunks, chunkState, chunkDisplay, chunkSelect);
    });

    // Skip Button
    const skipButton = document.createElement('button');
    skipButton.textContent = 'Skip';
    skipButton.style.backgroundColor = '#f44336'; // Red color for emphasis
    skipButton.style.marginLeft = '10px'; // Spacing from OK button
    skipButton.addEventListener('click', () => {
        handleChunkSkip(chunks, shuffledChunks, chunkState, chunkDisplay, chunkSelect);
    });

    controlsDiv.appendChild(playButton);
    controlsDiv.appendChild(chunkSelect);
    controlsDiv.appendChild(okButton);
    controlsDiv.appendChild(skipButton); // Add Skip button to controls

    container.appendChild(controlsDiv);

    // Automatically play the first chunk
    playCurrentChunkAudio(shuffledChunks[currentChunkIndex]);
}

/**
 * Function to handle skipping the current chunk
 */
function handleChunkSkip(originalChunks, shuffledChunks, chunkState, chunkDisplay, chunkSelect) {
    const currentChunk = shuffledChunks[currentChunkIndex];
    const chunkIndex = originalChunks.indexOf(currentChunk);

    // Mark the chunk as skipped
    chunkState[chunkIndex].attempted = true;
    chunkState[chunkIndex].correct = false;
    chunkState[chunkIndex].skipped = true;

    // Reveal the chunk in the sentence display
    revealChunk(chunkIndex, chunkDisplay, 'skipped');

    // Remove the correct chunk from the dropdown
    const optionToRemove = chunkSelect.querySelector(`option[value="${currentChunk}"]`);
    if (optionToRemove) {
        chunkSelect.removeChild(optionToRemove);
    }

    // Move to the next chunk
    currentChunkIndex++;

    // Reset the dropdown to the default option
    chunkSelect.selectedIndex = 0;

    if (currentChunkIndex < shuffledChunks.length) {
        // Play the next chunk after a short delay
        setTimeout(() => {
            playCurrentChunkAudio(shuffledChunks[currentChunkIndex]);
        }, 500);
    } else {
        // All chunks have been attempted
        listeningTestCompleted = true;
        checkIfListeningTestCompleted();
    }
}

/**
 * Function to play the current chunk audio using Speech Synthesis
 * @param {string} chunkText - The text of the chunk to play
 */
function playCurrentChunkAudio(chunkText) {
    if (!chunkText) return;
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = 'fr-FR'; // Set the language to French
    speechSynthesis.speak(utterance);
}

/**
 * Function to handle the user's guess for the current chunk
 * @param {string} selectedChunk - The chunk selected by the user
 * @param {Array<string>} originalChunks - The original chunks
 * @param {Array<string>} shuffledChunks - The shuffled chunks
 * @param {Array<Object>} chunkState - The state of each chunk
 * @param {HTMLElement} chunkDisplay - The container displaying chunks
 * @param {HTMLElement} chunkSelect - The dropdown element
 */
function handleChunkGuess(selectedChunk, originalChunks, shuffledChunks, chunkState, chunkDisplay, chunkSelect) {
    const currentChunk = shuffledChunks[currentChunkIndex];
    const chunkIndex = originalChunks.indexOf(currentChunk);

    if (selectedChunk === currentChunk) {
        // Correct guess
        chunkState[chunkIndex].attempted = true;
        chunkState[chunkIndex].correct = true;
        revealChunk(chunkIndex, chunkDisplay, 'correct');

        // Remove the correct option from chunkSelect
        const optionToRemove = chunkSelect.querySelector(`option[value="${selectedChunk}"]`);
        if (optionToRemove) {
            chunkSelect.removeChild(optionToRemove);
        }

        // Move to the next chunk
        currentChunkIndex++;

        // Reset the dropdown to the default option
        chunkSelect.selectedIndex = 0;

        if (currentChunkIndex < shuffledChunks.length) {
            // Play the next chunk after a short delay
            setTimeout(() => {
                playCurrentChunkAudio(shuffledChunks[currentChunkIndex]);
            }, 500);
        } else {
            // All chunks have been attempted
            listeningTestCompleted = true;
            checkIfListeningTestCompleted();
        }
    } else {
        // Incorrect guess
        chunkState[chunkIndex].attempted = true;
        chunkState[chunkIndex].correct = false;
        revealChunk(chunkIndex, chunkDisplay, 'incorrect');

        // Provide feedback to the user
        alert('Incorrect guess. Please try again or skip this chunk.');

        // Allow the user to re-attempt or skip
        // Do not move to the next chunk; user can select again or choose to skip
    }
}

/**
 * Function to reveal a chunk in the sentence display
 * @param {number} index - The index of the chunk in the original chunks array
 * @param {HTMLElement} chunkDisplay - The container displaying chunks
 * @param {string} status - 'correct', 'incorrect', or 'skipped'
 */
function revealChunk(index, chunkDisplay, status) {
    const chunkSpans = chunkDisplay.querySelectorAll('span');
    const chunkSpan = chunkSpans[index];

    if (status === 'correct') {
        chunkSpan.classList.remove('chunk-hidden');
        chunkSpan.classList.add('chunk-correct');
    } else if (status === 'skipped') {
        chunkSpan.classList.remove('chunk-hidden');
        chunkSpan.classList.add('chunk-skipped');
    } else if (status === 'incorrect') {
        // Optionally handle incorrect status (e.g., highlight in red)
        // Currently, incorrect chunks remain hidden
    }
}

/**
 * Function to check if the listening test is completed
 * If completed, show the "Proceed to Step 2" button
 */
function checkIfListeningTestCompleted() {
    if (listeningTestCompleted || currentChunkIndex >= shuffledChunks.length) {
        document.getElementById('proceed-step2-btn').classList.remove('hidden');
    }
}

/**
 * Function to reveal all chunks as skipped
 */
function revealAllChunksAsSkipped() {
    const chunkDisplay = document.querySelector('.chunk-display');
    const chunkSpans = chunkDisplay.querySelectorAll('span');

    // Retrieve the chunkSelect element by its ID
    const chunkSelect = document.getElementById('chunk-selector');

    chunkSpans.forEach((chunkSpan, index) => {
        if (chunkSpan.classList.contains('chunk-hidden')) {
            chunkSpan.classList.remove('chunk-hidden');
            chunkSpan.classList.add('chunk-skipped');
            // Update chunkState
            chunkState[index].attempted = true;
            chunkState[index].correct = false;
            chunkState[index].skipped = true;

            // Remove the skipped option from chunkSelect
            const chunkText = chunks[index];
            const optionToRemove = chunkSelect.querySelector(`option[value="${chunkText}"]`);
            if (optionToRemove) {
                chunkSelect.removeChild(optionToRemove);
            }
        }
    });

    // Mark listening test as completed
    listeningTestCompleted = true;
    checkIfListeningTestCompleted();
}

/**
 * Function to reset the listening test for the next sentence
 */
function resetListeningTest() {
    const listeningTestContainer = document.getElementById('listening-test-container');

    // Clear the listening test container
    listeningTestContainer.innerHTML = '';

    // Reset variables
    currentChunkIndex = 0;
    chunkState = [];
    chunks = [];
    shuffledChunks = [];
    listeningTestCompleted = false;
}

/**
 * Function to split a sentence into chunks of 3-4 words
 * @param {string} sentence - The sentence to split
 * @returns {Array<string>} - Array of chunk strings
 */
function splitSentenceIntoChunks(sentence) {
    const words = sentence.split(/\s+/);
    const chunks = [];
    let i = 0;

    while (i < words.length) {
        const remainingWords = words.length - i;
        if (remainingWords <= 4) {
            chunks.push(words.slice(i).join(' '));
            break;
        }

        const chunkSize = Math.floor(Math.random() * 2) + 3; // Randomly 3 or 4 words
        const chunk = words.slice(i, i + chunkSize).join(' ');
        chunks.push(chunk);
        i += chunkSize;
    }

    return chunks;
}

/**
 * Utility function to shuffle an array
 * @param {Array} array - The array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/* Existing functions for processing sentences */

/**
 * Function to process the current sentence based on user configurations
 */
async function processCurrentSentence() {
    const sentence = sentences[currentSentenceIndex];

    const displayArea = document.getElementById('sentence-display');
    displayArea.innerHTML = '<p>Loading...</p>';

    try {
        let apiResponse;

        if (!sentenceCache[sentence]) {
            sentenceCache[sentence] = {};
        }

        const currentView = getCurrentView();
        if (!sentenceCache[sentence][currentView]) {
            // Make API call based on the selected view
            if (currentView === 'fragments') {
                apiResponse = await apiSweepSpotlight(sentence, translationMode);
            } else if (currentView === 'words') {
                apiResponse = await apiWordsDefinitions(sentenceWithFragmentMarkings());
            } else if (currentView === 'phrases') {
                apiResponse = await apiPhrasesDefinitions(sentenceWithFragmentMarkings());
            }
            // Cache the response
            sentenceCache[sentence][currentView] = apiResponse;
        } else {
            apiResponse = sentenceCache[sentence][currentView];
        }

        // Create and display sentence fragments or interactive words/phrases
        displayContent(apiResponse, currentView);
    } catch (error) {
        console.error('Error processing sentence:', error);
        alert('An error occurred while processing the sentence. Please check the console for details.');
        displayArea.innerHTML = '';
    }
}

/**
 * Function to display content based on the selected view
 * @param {Object} data - The data object containing fragments, translations, and definitions
 * @param {string} view - The current view ('fragments', 'words', 'phrases')
 */
function displayContent(data, view) {
    const displayArea = document.getElementById('sentence-display');
    displayArea.innerHTML = ''; // Clear previous content

    const fragmentDiv = document.createElement('div');
    fragmentDiv.classList.add('sentence-fragment');

    const fragmentContainer = document.createElement('div');
    fragmentContainer.classList.add('fragment-container');

    // Depending on the view, display fragments differently
    if (view === 'fragments') {
        layoutFragments(data.originalFragments, data.translationFragments, fragmentContainer);
    } else {
        // For 'words' or 'phrases' views
        layoutInteractiveFragments(data.originalFragments, data.translationFragments, data.definitions, fragmentContainer);
    }

    fragmentDiv.appendChild(fragmentContainer);
    displayArea.appendChild(fragmentDiv);

    // Show or hide the info box based on the view
    if (view !== 'fragments') {
        document.getElementById('info-box').classList.remove('hidden');
    } else {
        document.getElementById('info-box').classList.add('hidden');
    }

    // Adjust layout on window resize
    const debouncedLayout = debounce(() => {
        if (view === 'fragments') {
            layoutFragments(data.originalFragments, data.translationFragments, fragmentContainer);
        } else {
            layoutInteractiveFragments(data.originalFragments, data.translationFragments, data.definitions, fragmentContainer);
        }
    }, 0);

    window.addEventListener('resize', debouncedLayout);

    // Trigger a resize event programmatically to fix initial layout
    window.dispatchEvent(new Event('resize'));
}

/**
 * Function to layout fragments into lines based on container width
 * @param {Array<string>} originalFragments - Array of original text fragments
 * @param {Array<string>} translationFragments - Array of translation fragments
 * @param {HTMLElement} fragmentContainer - The container to hold the fragments
 */
function layoutFragments(originalFragments, translationFragments, fragmentContainer) {
    // Clear existing content
    fragmentContainer.innerHTML = '';

    const containerWidth = fragmentContainer.clientWidth;
    let currentLine = document.createElement('div');
    currentLine.classList.add('fragment-line');
    fragmentContainer.appendChild(currentLine);

    originalFragments.forEach((originalFrag, index) => {
        let translationFrag = translationFragments[index] || '';

        // Create fragment pair
        const fragmentPair = document.createElement('div');
        fragmentPair.classList.add('fragment-pair-inline');

        const originalDiv = document.createElement('div');
        originalDiv.classList.add('fragment-original');
        originalDiv.textContent = originalFrag;

        const translationDiv = document.createElement('div');
        translationDiv.classList.add('fragment-translation');
        translationDiv.textContent = translationFrag;
        translationDiv.style.opacity = '0'; // Ensure initial opacity is 0

        fragmentPair.appendChild(originalDiv);
        fragmentPair.appendChild(translationDiv);

        // Add mouseover and mouseout event listeners to the fragment pair
        fragmentPair.addEventListener('mouseover', () => {
            translationDiv.style.transition = 'opacity 0.5s ease-in-out';
            translationDiv.style.opacity = '1';
        });

        fragmentPair.addEventListener('mouseout', () => {
            translationDiv.style.transition = 'opacity 0.5s ease-in-out';
            translationDiv.style.opacity = '0';
        });

        // Append to current line
        currentLine.appendChild(fragmentPair);

        // After appending, check if the current line exceeds the container width
        if (currentLine.scrollWidth > containerWidth) {
            // Remove the fragment from the current line
            currentLine.removeChild(fragmentPair);
            // Start a new line
            currentLine = document.createElement('div');
            currentLine.classList.add('fragment-line');
            fragmentContainer.appendChild(currentLine);
            // Append the fragment to the new line
            currentLine.appendChild(fragmentPair);
        }

        // Add minimal spacing between fragments
        fragmentPair.style.marginRight = '1ch'; // 1 character width space
    });

    // Remove the extra margin after the last fragment in each line
    const lines = fragmentContainer.querySelectorAll('.fragment-line');
    lines.forEach(line => {
        const fragmentPairs = line.querySelectorAll('.fragment-pair-inline');
        if (fragmentPairs.length > 0) {
            fragmentPairs[fragmentPairs.length - 1].style.marginRight = '0';
        }
    });
}

/**
 * Function to layout interactive fragments for 'words' and 'phrases' views
 * @param {Array<string>} originalFragments
 * @param {Array<string>} translationFragments
 * @param {Array<string>} definitions
 * @param {HTMLElement} fragmentContainer
 */
function layoutInteractiveFragments(originalFragments, translationFragments, definitions, fragmentContainer) {
    fragmentContainer.innerHTML = '';

    originalFragments.forEach((originalFrag, index) => {
        const definition = definitions[index];
        if (definition && definition.trim() !== '') {
            const fragmentSpan = document.createElement('span');
            fragmentSpan.classList.add('interactive-fragment');
            fragmentSpan.textContent = originalFrag;
            fragmentSpan.dataset.translation = translationFragments[index];
            fragmentSpan.dataset.definition = definitions[index];

            // Add click event to show definition
            fragmentSpan.addEventListener('click', () => {
                showInlineDefinition(originalFrag, translationFragments[index], definitions[index]);
            });

            fragmentContainer.appendChild(fragmentSpan);
        } else {
            // Display as plain text
            fragmentContainer.appendChild(document.createTextNode(originalFrag));
        }
        fragmentContainer.appendChild(document.createTextNode(' ')); // Add space between fragments
    });
}

/**
 * Function to show the definition in the definitions box
 * @param {string} originalText - The original word/phrase
 * @param {string} translation - The translation
 * @param {string} definition - The definition
 */
function showInlineDefinition(originalText, translation, definition) {
    const infoBox = document.getElementById('info-box');
    infoBox.innerHTML = `
        <strong>Original:</strong> ${originalText}<br>
        <strong>Translation:</strong> ${translation}<br>
        <strong>Definition:</strong> ${definition}
    `;
    infoBox.classList.remove('hidden');
}

// Add event listener to adjust info-box position based on scroll
window.addEventListener('scroll', () => {
    const infoBox = document.getElementById('info-box');
    const containerRect = document.querySelector('.container').getBoundingClientRect();
    const bottomOfContainer = containerRect.bottom;
    const windowHeight = window.innerHeight;

    if (bottomOfContainer <= windowHeight) {
        // If the bottom of the container is visible, position info-box below the content
        infoBox.style.position = 'static';
    } else {
        // Else, fix the info-box at the bottom
        infoBox.style.position = 'fixed';
    }
});

/**
 * Function to get the current selected view from the tabs
 * @returns {string} - The current view ('fragments', 'words', 'phrases')
 */
function getCurrentView() {
    const activeTab = document.querySelector('.tab-btn.active');
    return activeTab ? activeTab.dataset.view : 'fragments';
}

// Event listeners for tab buttons (Route: #/step2)
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        const selectedView = e.target.dataset.view;
        switchView(selectedView);
    });
});

/**
 * Function to switch between different views (fragments, words, phrases)
 * @param {string} view - The selected view to display
 */
async function switchView(view) {
    // Update tab button styles
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.toggle('active', button.dataset.view === view);
    });

    // Clear the sentence display
    const displayArea = document.getElementById('sentence-display');
    displayArea.innerHTML = '';

    // Hide the info box initially if not applicable
    if (view !== 'fragments') {
        document.getElementById('info-box').classList.remove('hidden');
    } else {
        document.getElementById('info-box').classList.add('hidden');
    }

    // Process the current sentence based on the selected view
    await processCurrentSentence();
}

/* Add event listener for 'Proceed to Step 3' button */
document.getElementById('proceed-step3-btn').addEventListener('click', () => {
    // Navigate to #/step3
    navigateTo('#/step3');
});

/* Add event listener for 'Load Questions' buttons in Step 3 */
document.getElementById('route-step3').addEventListener('click', (event) => {
    if (event.target.classList.contains('load-questions-btn')) {
        const questionType = event.target.dataset.questionType;
        loadQuestionsForCurrentSentence(questionType);
    }
});

/* Add function to show question type selection */
function showQuestionTypeSelection() {
    // Display options for 'Words' or 'Phrases/Idioms'
    const questionTypeContainer = document.getElementById('question-type-container');
    questionTypeContainer.innerHTML = ''; // Clear previous content

    const questionTypeLabel = document.createElement('p');
    questionTypeLabel.textContent = 'Select Question Type:';

    const wordQuestionButton = document.createElement('button');
    wordQuestionButton.textContent = 'Words';
    wordQuestionButton.addEventListener('click', () => {
        loadQuestionsForCurrentSentence('words');
    });

    const phraseQuestionButton = document.createElement('button');
    phraseQuestionButton.textContent = 'Phrases/Idioms';
    phraseQuestionButton.addEventListener('click', () => {
        loadQuestionsForCurrentSentence('phrases');
    });

    questionTypeContainer.appendChild(questionTypeLabel);
    questionTypeContainer.appendChild(wordQuestionButton);
    questionTypeContainer.appendChild(phraseQuestionButton);
}

/* Modify the function to load questions for the current sentence */
async function loadQuestionsForCurrentSentence(questionType) {
    const sentence = sentences[currentSentenceIndex];

    const questionsContainer = document.querySelector(`.questions-container[data-question-type="${questionType}"]`);
    questionsContainer.innerHTML = '<p>Loading questions...</p>';

    try {
        let questionsData;
        if (questionType === 'words') {
            questionsData = await apiGetWordQuestions(sentenceWithFragmentMarkings());
        } else if (questionType === 'phrases') {
            questionsData = await apiGetPhraseQuestions(sentenceWithFragmentMarkings());
        } else if (questionType === 'idioms') {
            questionsData = await apiGetIdiomQuestions(sentenceWithFragmentMarkings());
        } else if (questionType === 'conjugation') {
            questionsData = await apiGetConjugationQuestions(sentenceWithFragmentMarkings());
        } else {
            throw new Error('Invalid question type selected.');
        }

        console.log(questionsData);

        // Generate the questions UI
        generateQuestionsUI(questionsData, questionsContainer, questionType);

    } catch (error) {
        console.error('Error loading questions:', error);
        questionsContainer.innerHTML = '<p>An error occurred while loading questions.</p>';
    }
}

/* Existing code for generating questions UI remains unchanged */

/* Rest of the code remains the same */


/* Add event listener for 'Proceed to Step 3' button */
document.getElementById('proceed-step3-btn').addEventListener('click', () => {
    // Navigate to #/step3
    navigateTo('#/step3');
});

/* Add event listener for 'Load Questions' buttons in Step 3 */
document.getElementById('route-step3').addEventListener('click', (event) => {
    if (event.target.classList.contains('load-questions-btn')) {
        const questionType = event.target.dataset.questionType;
        loadQuestionsForCurrentSentence(questionType);
    }
});

/* Add function to show question type selection */
function showQuestionTypeSelection() {
    // Display options for 'Words' or 'Phrases/Idioms'
    const questionTypeContainer = document.getElementById('question-type-container');
    questionTypeContainer.innerHTML = ''; // Clear previous content

    const questionTypeLabel = document.createElement('p');
    questionTypeLabel.textContent = 'Select Question Type:';

    const wordQuestionButton = document.createElement('button');
    wordQuestionButton.textContent = 'Words';
    wordQuestionButton.addEventListener('click', () => {
        loadQuestionsForCurrentSentence('words');
    });

    const phraseQuestionButton = document.createElement('button');
    phraseQuestionButton.textContent = 'Phrases/Idioms';
    phraseQuestionButton.addEventListener('click', () => {
        loadQuestionsForCurrentSentence('phrases');
    });

    questionTypeContainer.appendChild(questionTypeLabel);
    questionTypeContainer.appendChild(wordQuestionButton);
    questionTypeContainer.appendChild(phraseQuestionButton);
}

/* Modify the function to load questions for the current sentence */
async function loadQuestionsForCurrentSentence(questionType) {
    const sentence = sentences[currentSentenceIndex];

    const questionsContainer = document.querySelector(`.questions-container[data-question-type="${questionType}"]`);
    questionsContainer.innerHTML = '<p>Loading questions...</p>';

    try {
        let questionsData;
        if (questionType === 'words') {
            questionsData = await apiGetWordQuestions(sentenceWithFragmentMarkings());
        } else if (questionType === 'phrases') {
            questionsData = await apiGetPhraseQuestions(sentenceWithFragmentMarkings());
        } else if (questionType === 'idioms') {
            questionsData = await apiGetIdiomQuestions(sentenceWithFragmentMarkings());
        } else if (questionType === 'conjugation') {
            questionsData = await apiGetConjugationQuestions(sentenceWithFragmentMarkings());
        } else {
            throw new Error('Invalid question type selected.');
        }

        console.log(questionsData);

        // Generate the questions UI
        generateQuestionsUI(questionsData, questionsContainer, questionType);

    } catch (error) {
        console.error('Error loading questions:', error);
        questionsContainer.innerHTML = '<p>An error occurred while loading questions.</p>';
    }
}

/**
 * Generates the questions UI based on the questions data.
 * @param {Array<Object>} questionsData - The array of question data objects.
 * @param {HTMLElement} container - The container element to render the questions into.
 * @param {string} questionType - The type of questions ('words', 'phrases', or 'idioms').
 */
function generateQuestionsUI(questionsData, container, questionType) {
    container.innerHTML = ''; // Clear any existing content

    questionsData.forEach((questionData, questionIndex) => {
        if (questionType === 'words') {
            const word = questionData.word;
            let options = questionData.options;
            const correctOptions = questionData.correctOptions;

            // Remove duplicate options
            options = [...new Set(options)];

            // Check if all options are the same
            const allOptionsSame = options.every(option => option === options[0]);
            if (allOptionsSame) {
                // Skip rendering this question
                return;
            }

            // Shuffle options
            options = shuffleArray(options);

            // Create a question div
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question-item');

            // Create the question text
            const questionText = document.createElement('div');
            questionText.classList.add('question-text');
            questionText.innerHTML = `What is the correct meaning of <strong>${word}</strong>?`;

            // Create dropdown for options
            const dropdown = createDropdown(options, `dropdown-question-${questionIndex}`, 'Select an option');

            // Create buttons
            const buttonContainer = createQuestionButtons(() => {
                // Check Answer logic
                const selectedOption = dropdown.value;
                if (!selectedOption) {
                    alert('Please select an option.');
                    return;
                }
                clearFeedback([dropdown]);
                const isCorrect = correctOptions.includes(selectedOption);
                if (isCorrect) {
                    dropdown.classList.add('correct');
                } else {
                    dropdown.classList.add('incorrect');
                }
            }, () => {
                // Show Correct Answer logic
                clearFeedback([dropdown]);
                dropdown.value = correctOptions[0]; // Assuming single correct answer
                dropdown.classList.add('correct');
            });

            // Append elements to questionDiv
            questionDiv.appendChild(questionText);
            questionDiv.appendChild(dropdown);
            questionDiv.appendChild(buttonContainer);

            // Append the questionDiv to the container
            container.appendChild(questionDiv);
        }

        else if (questionType === 'phrases') {
            const phrase = questionData.phrase;
            const correctMeaning = questionData.correctMeaning;
            let options = questionData.options;

            // Remove duplicate options
            options = [...new Set(options)];

            // Check if all options are the same
            const allOptionsSame = options.every(option => option === options[0]);
            if (allOptionsSame) {
                // Skip rendering this question
                return;
            }

            // Shuffle options
            options = shuffleArray(options);

            // Create a question div
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question-item');

            // Create the question text
            const questionText = document.createElement('div');
            questionText.classList.add('question-text');
            questionText.innerHTML = `What is the correct meaning of the phrase <strong>"${phrase}"</strong>?`;

            // Create dropdown for options
            const dropdown = createDropdown(options, `dropdown-question-phrase-${questionIndex}`, 'Select an option');

            // Create buttons
            const buttonContainer = createQuestionButtons(() => {
                // Check Answer logic
                const selectedOption = dropdown.value;
                if (!selectedOption) {
                    alert('Please select an option.');
                    return;
                }
                clearFeedback([dropdown]);
                const isCorrect = selectedOption === correctMeaning;
                if (isCorrect) {
                    dropdown.classList.add('correct');
                } else {
                    dropdown.classList.add('incorrect');
                }
            }, () => {
                // Show Correct Answer logic
                clearFeedback([dropdown]);
                dropdown.value = correctMeaning; // Show the correct meaning
                dropdown.classList.add('correct');
            });

            // Append elements to questionDiv
            questionDiv.appendChild(questionText);
            questionDiv.appendChild(dropdown);
            questionDiv.appendChild(buttonContainer);

            // Append the questionDiv to the container
            container.appendChild(questionDiv);
        }

        else if (questionType === 'idioms') {
            // **FIXED**: Changed 'qData' to 'questionData' and updated property names
            const questionText = questionData.question;
            const correctOption = questionData.correctOption;
            let options = questionData.options;

            // Remove duplicate options
            options = [...new Set(options)];

            // Check if all options are the same
            const allOptionsSame = options.every(option => option === options[0]);
            if (allOptionsSame) {
                // Skip rendering this question
                return;
            }

            // Shuffle options
            options = shuffleArray(options);

            // Create a question div
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question-item');

            // Create the question text
            const questionTextDiv = document.createElement('div');
            questionTextDiv.classList.add('question-text');
            questionTextDiv.innerHTML = `${questionText}`; // **FIXED**: Added backticks

            // Create dropdown for options
            const dropdown = createDropdown(
                options,
                `dropdown-question-idiom-${questionIndex}`, // **FIXED**: Enclosed in backticks
                'Select an option'
            );

            // Create buttons
            const buttonContainer = createQuestionButtons(
                () => {
                    // Check Answer logic
                    const selectedOption = dropdown.value;
                    if (!selectedOption) {
                        alert('Please select an option.');
                        return;
                    }
                    clearFeedback([dropdown]);
                    const isCorrect = selectedOption === correctOption;
                    if (isCorrect) {
                        dropdown.classList.add('correct');
                    } else {
                        dropdown.classList.add('incorrect');
                    }
                },
                () => {
                    // Show Correct Answer logic
                    clearFeedback([dropdown]);
                    dropdown.value = correctOption; // Show the correct option
                    dropdown.classList.add('correct');
                }
            );

            // Append elements to questionDiv
            questionDiv.appendChild(questionTextDiv);
            questionDiv.appendChild(dropdown);
            questionDiv.appendChild(buttonContainer);

            // Append the questionDiv to the container
            container.appendChild(questionDiv);
        }
        else if (questionType === 'conjugation') {
            const questionText = questionData.question;
            const correctOption = questionData.correctOption;
            let options = questionData.options;

            // Remove duplicate options
            options = [...new Set(options)];

            // Shuffle options
            options = shuffleArray(options);

            // Create a question div
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question-item');

            // Create the question text
            const questionTextDiv = document.createElement('div');
            questionTextDiv.classList.add('question-text');
            questionTextDiv.innerHTML = `${questionText}`;

            // Create dropdown for options
            const dropdown = createDropdown(options, `dropdown-question-conjugation-${questionIndex}`, 'Select an option');

            // Create buttons
            const buttonContainer = createQuestionButtons(
                () => {
                    // Check Answer logic
                    const selectedOption = dropdown.value;
                    if (!selectedOption) {
                        alert('Please select an option.');
                        return;
                    }
                    clearFeedback([dropdown]);
                    const isCorrect = selectedOption === correctOption;
                    if (isCorrect) {
                        dropdown.classList.add('correct');
                    } else {
                        dropdown.classList.add('incorrect');
                    }
                },
                () => {
                    // Show Correct Answer logic
                    clearFeedback([dropdown]);
                    dropdown.value = correctOption; // Show the correct option
                    dropdown.classList.add('correct');
                }
            );

            // Append elements to questionDiv
            questionDiv.appendChild(questionTextDiv);
            questionDiv.appendChild(dropdown);
            questionDiv.appendChild(buttonContainer);

            // Append the questionDiv to the container
            container.appendChild(questionDiv);
        }
    });

    // If no questions are rendered, display a message
    if (container.innerHTML.trim() === '') {
        container.innerHTML = '<p>No questions available.</p>';
    }
}



/**
 * Creates a dropdown select element with the given options.
 * @param {Array<string>} options - The options for the dropdown.
 * @param {string} className - The class name for the select element.
 * @param {string} placeholder - The placeholder text for the select.
 * @returns {HTMLSelectElement} - The created select element.
 */
function createDropdown(options, className, placeholder) {
    const select = document.createElement('select');
    select.classList.add(className);
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = placeholder;
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    options.forEach(option => {
        if (option !== 'N/A' && option.trim() !== '') {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option;
            select.appendChild(optElement);
        }
    });

    return select;
}

/**
 * Creates the question buttons ('Check Answer' and 'Show Correct Answer') and attaches event handlers.
 * @param {Function} checkAnswerCallback - The function to call when 'Check Answer' is clicked.
 * @param {Function} showCorrectAnswerCallback - The function to call when 'Show Correct Answer' is clicked.
 * @returns {HTMLDivElement} - The container with the buttons.
 */
function createQuestionButtons(checkAnswerCallback, showCorrectAnswerCallback) {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    // 'Check Answer' button
    const checkButton = document.createElement('button');
    checkButton.textContent = 'Check Answer';
    checkButton.addEventListener('click', checkAnswerCallback);

    // 'Show Correct Answer' button
    const showAnswerButton = document.createElement('button');
    showAnswerButton.textContent = 'Show Correct Answer';
    showAnswerButton.addEventListener('click', showCorrectAnswerCallback);

    buttonContainer.appendChild(checkButton);
    buttonContainer.appendChild(showAnswerButton);

    return buttonContainer;
}
/**
 * Clears the 'correct' and 'incorrect' classes from the provided elements.
 * @param {Array<HTMLElement>} elements - The elements to clear feedback from.
 */
function clearFeedback(elements) {
    elements.forEach(el => {
        if (el) el.classList.remove('correct', 'incorrect');
    });
}

/**
 * Adds event listeners to remove feedback classes when the user changes their selection.
 * @param {Array<HTMLElement>} elements - The elements to add event listeners to.
 */
function removeFeedbackOnChange(elements) {
    elements.forEach(el => {
        if (el) {
            el.addEventListener('change', () => {
                el.classList.remove('correct', 'incorrect');
            });
        }
    });
}



function GetSentenceWithFragmentMarksFormat() {
    // Check if the sentenceWithFragments exists
    if (sentenceCache[sentence] && sentenceCache[sentence].fragments.sentenceWithFragments) {
        // Split by newlines and return the first line
        return sentenceCache[sentence].fragments.sentenceWithFragments.split('\n')[0];
    }
    // Return an empty string or a default value if not found
    return '';
}