/* api.js */

// WARNING: Do not modify or shorten this system instruction in any way or functionality will be broken.
const API_KEY = localStorage.getItem('apiKey'); // Replace with your actual API key

// Base URL for the Google Gemini API
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${API_KEY}`;

/**
 * API call for Sweep and Spotlight Modes (without definitions)
 * @param {string} sentence - The original sentence to process
 * @param {string} mode - The translation mode ('sweep', 'spotlight', 'combined')
 * @returns {Promise<Object>} - Returns an object containing original and translation fragments
 */
async function apiSweepSpotlight(sentence, mode) {
    // WARNING: Do not modify or shorten this system instruction in any way or functionality will be broken.
    const systemInstructionText = `
return to me in this format:
ORIGINAL:<[ Il y avait une fois une petite fille | qui vivait dans un village | près de la forêt.]>
TRANSLATED:<[ Once upon a time, there was a little girl | who lived in a village | near the forest. ]>
| means an arbitrary chunk
second line is a translation
    `;

    const payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                  {
                    "text": "La manière dont s’entête Justin Trudeau à demeurer en poste semble concorder avec une manière de faire de la maison libérale"
                  }
                ]
              },
              {
                "role": "model",
                "parts": [
                  {
                    "text": "<[ La manière dont s’entête Justin Trudeau | à demeurer en poste semble concorder | avec une manière de faire de la maison libérale ]>\n<[ The way Justin Trudeau is insistent | on remaining in office seems to coincide | with a way of doing things for the Liberal house ]> \n"
                  }
                ]
              },
            {
                "role": "user",
                "parts": [
                    {
                        "text": sentence
                    }
                ]
            }
        ],
        "systemInstruction": {
            "role": "user",
            "parts": [
                {
                    "text": systemInstructionText
                }
            ]
        },
        "generationConfig": {
            "temperature": 0.1,
            "topK": 64,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "text/plain"
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Invalid API key. Please check your API key and try again.');
                // Optionally, prompt the user to enter the API key again
                localStorage.removeItem('apiKey');
                checkAndPromptApiKey();
            } 
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Parse the API response to extract original and translation fragments
        const content = data.candidates[0].content.parts[0].text.trim();
        const [originalLine, translationLine] = content.split('\n').map(line => line.trim());

        const { originalFragments, translationFragments } = extractFragments(originalLine, translationLine);


        return {
            originalFragments: originalFragments,
            translationFragments: translationFragments,
            sentenceWithFragments: content 
        };
    } catch (error) {
        console.error('Error in apiSweepSpotlight:', error);
        throw error;
    }
}

/**
 * API call for Words Definitions Mode
 * @param {string} sentence - The original sentence to process
 * @returns {Promise<Object>} - Returns an object containing fragments, translations, and definitions
 */
async function apiWordsDefinitions(sentence) {
    // WARNING: Do not modify or shorten this system instruction in any way or functionality will be broken.
    const systemInstructionText = `
Input:
<[ Il ne pouvait pas aller à l'école | parce qu'il était malade. ]>

Output:
[Il | it/he | Il]
[ne pouvait pas | could not | ne + pouvait + pas]
[aller | to go | aller]
[l'école | the school | le + école]
[parce | because | parce]
[qu'il | that he | que + il]
[était | was | était]
[malade | ill | malade]
    `;

    const payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": sentence
                    }
                ]
            }
        ],
        "systemInstruction": {
            "role": "user",
            "parts": [
                {
                    "text": systemInstructionText
                }
            ]
        },
        "generationConfig": {
            "temperature": 1,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "text/plain"
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Invalid API key. Please check your API key and try again.');
                // Optionally, prompt the user to enter the API key again
                localStorage.removeItem('apiKey');
                checkAndPromptApiKey();
            } 
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Parse the API response to extract fragments, translations, and definitions
        const content = data.candidates[0].content.parts[0].text.trim();
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.startsWith('['));

        const originalFragments = [];
        const translationFragments = [];
        const definitions = [];

        lines.forEach(line => {
            const parts = line.slice(1, -1).split('|').map(part => part.trim());
            if (parts.length === 3) {
                originalFragments.push(parts[0]);
                translationFragments.push(parts[1]);
                definitions.push(parts[2]);
            }
        });

        return {
            originalFragments,
            translationFragments,
            definitions
        };
    } catch (error) {
        console.error('Error in apiWordsDefinitions:', error);
        throw error;
    }
}

/**
 * API call for Phrases Definitions Mode
 * @param {string} sentence - The original sentence to process
 * @returns {Promise<Object>} - Returns an object containing fragments, translations, and definitions
 */
async function apiPhrasesDefinitions(sentence) {
    // WARNING: Do not modify or shorten this system instruction in any way or functionality will be broken.
    const systemInstructionText = `
Input:
<[ Il ne pouvait pas aller à l'école | parce qu'il était malade. ]>

Output:
[Il ne pouvait pas | he could not | Il + ne + pouvait + pas]
[aller à l'école | to go to school | aller + à + le + école]
[parce qu'il | because he | parce + que + il]
[était malade | was ill | était + malade]
    `;

    const payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": sentence
                    }
                ]
            }
        ],
        "systemInstruction": {
            "role": "user",
            "parts": [
                {
                    "text": systemInstructionText
                }
            ]
        },
        "generationConfig": {
            "temperature": 1,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "text/plain"
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Invalid API key. Please check your API key and try again.');
                // Optionally, prompt the user to enter the API key again
                localStorage.removeItem('apiKey');
                checkAndPromptApiKey();
            } 
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Parse the API response to extract fragments, translations, and definitions
        const content = data.candidates[0].content.parts[0].text.trim();
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.startsWith('['));

        const originalFragments = [];
        const translationFragments = [];
        const definitions = [];

        lines.forEach(line => {
            const parts = line.slice(1, -1).split('|').map(part => part.trim());
            if (parts.length === 3) {
                originalFragments.push(parts[0]);
                translationFragments.push(parts[1]);
                definitions.push(parts[2]);
            }
        });

        return {
            originalFragments,
            translationFragments,
            definitions
        };
    } catch (error) {
        console.error('Error in apiPhrasesDefinitions:', error);
        throw error;
    }
}

/**
 * Helper function to extract fragments from the API response lines
 * It splits the original and translated lines by '|' first, then by ',' if comma counts match.
 * After splitting by ',', it appends the comma back to each fragment except the last one.
 * @param {string} originalLine - The original line containing fragments
 * @param {string} translatedLine - The translated line containing fragments
 * @returns {Object} - An object with arrays of original and translated fragments
 */
function extractFragments(originalLine, translatedLine) {
    // Function to split a line by '|' and trim each fragment
    const splitByPipe = (line) => {
        const match = line.match(/<\[(.*?)\]>/);
        if (match && match[1]) {
            return match[1].split('|').map(fragment => fragment.trim());
        }
        return [line.trim()];
    };

    // Helper function to split by comma and retain the comma at the end of each fragment except the last
    const splitByCommaWithRetention = (frag) => {
        const parts = frag.split(',').map((part, index, array) => {
            // Append comma to all fragments except the last one
            return part.trim() + (index < array.length - 1 ? ',' : '');
        });
        return parts;
    };

    // Split both original and translated lines by '|'
    const originalFragments = splitByPipe(originalLine);
    const translatedFragments = splitByPipe(translatedLine);

    const finalOriginalFragments = [];
    const finalTranslatedFragments = [];

    // Determine the maximum number of fragments to iterate
    const maxFragments = Math.max(originalFragments.length, translatedFragments.length);

    for (let i = 0; i < maxFragments; i++) {
        const origFrag = originalFragments[i] || '';
        const transFrag = translatedFragments[i] || '';

        // Count the number of commas in both fragments
        const origCommaCount = (origFrag.match(/,/g) || []).length;
        const transCommaCount = (transFrag.match(/,/g) || []).length;

        if (origCommaCount === transCommaCount && origCommaCount > 0) {
            // Split by commas and retain the commas
            const splitOrig = splitByCommaWithRetention(origFrag);
            const splitTrans = splitByCommaWithRetention(transFrag);

            // Ensure both splits have the same number of sub-fragments
            if (splitOrig.length === splitTrans.length) {
                finalOriginalFragments.push(...splitOrig);
                finalTranslatedFragments.push(...splitTrans);
            } else {
                // If counts don't match after splitting, keep original fragments
                finalOriginalFragments.push(origFrag);
                finalTranslatedFragments.push(transFrag);
            }
        } else {
            // If comma counts don't match or no commas, keep original fragments
            finalOriginalFragments.push(origFrag);
            finalTranslatedFragments.push(transFrag);
        }
    }

    // Handle cases where there are no '|' delimiters by attempting to split the whole line by ','
    if (originalFragments.length === 1 && translatedFragments.length === 1) {
        const origCommaCount = (originalFragments[0].match(/,/g) || []).length;
        const transCommaCount = (translatedFragments[0].match(/,/g) || []).length;

        if (origCommaCount === transCommaCount && origCommaCount > 0) {
            const splitOrig = splitByCommaWithRetention(originalFragments[0]);
            const splitTrans = splitByCommaWithRetention(translatedFragments[0]);

            if (splitOrig.length === splitTrans.length) {
                return {
                    originalFragments: splitOrig,
                    translationFragments: splitTrans
                };
            }
        }
    }

    return {
        originalFragments: finalOriginalFragments,
        translationFragments: finalTranslatedFragments
    };
}



/**
 * API call for Words Definitions Mode
 * @param {string} sentence - The original sentence to process
 * @returns {Promise<Object>} - Returns an array of question data objects
 */
async function apiGetWordQuestions(sentence) {
    // WARNING: Do not modify or shorten this system instruction in any way or functionality will be broken.
    const systemInstructionText = `
NO NOT GIVE ME FEEDBACK

INPUT:
<[ Il y avait une petite fille | qui vivait dans un village | près de la forêt.]>

OUTPUT (RESPOND ONLY AS THIS FORMAT!!!)::

(Il y avait une petite fille qui vivait dans un village près de la forêt.) 

[Correct answer <<>>]:
[Il y {it, <<there>, here, over, in>}]
[avait {<<was>>, has, have, having, holds}]
[petite {big, old, young, new, <<small>>}]
[fille {boy, woman, person, <<girl>>, child}]
`;

    const payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": sentence
                    }
                ]
            }
        ],
        "systemInstruction": {
            "role": "user",
            "parts": [
                {
                    "text": systemInstructionText
                }
            ]
        },
        "generationConfig": {
            "temperature": 1,
            "topK": 64,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "text/plain"
        }
    };

    try {
        const response = await fetch(API_URL, { // Assuming API_URL is correct here
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Invalid API key. Please check your API key and try again.');
                // Optionally, prompt the user to enter the API key again
                localStorage.removeItem('apiKey');
                checkAndPromptApiKey();
            } 
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Parse the API response to extract questions data
        const content = data.candidates[0].content.parts[0].text.trim();

        // Parse the content into structured data
        const questionsData = parseWordQuestionsResponse(content);

        return questionsData;

    } catch (error) {
        console.error('Error in apiGetWordQuestions:', error);
        throw error;
    }
}

function parseWordQuestionsResponse(content) {
    // Split the content into lines and filter out irrelevant ones
    const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('['));

    const questionsData = [];

    lines.forEach(line => {
        // Line format: [Word, {Option1, Option2, <<CorrectOption>>, OptionN}]
        const match = line.match(/^\[(.+?)(?:,\s*)?\{\s*(.+?)\s*\}\]$/);

        if (match) {
            const word = match[1].trim();
            const optionsText = match[2].trim();

            // Split optionsText by comma, but handle options with commas inside << >>
            const optionsParts = [];
            let buffer = '';
            let insideCorrect = false;

            // Improved splitting to handle commas within << >>
            const regex = /<<[^<>]+>>|[^,]+/g;
            const matches = optionsText.match(regex);
            if (matches) {
                optionsParts.push(...matches.map(part => part.trim()));
            }

            let options = [];
            let correctOptions = [];
            optionsParts.forEach(optionPart => {
                const optionMatch = optionPart.match(/^<<(.+?)>>$/);
                if (optionMatch) {
                    options.push(optionMatch[1].trim());
                    correctOptions.push(optionMatch[1].trim());
                } else {
                    options.push(optionPart.replace(/<</g, '').replace(/>>/g, '').trim());
                }
            });

            // **Filtering Step 1**: Exclude entries where 'word' matches any 'correctOptions'
            // Perform a case-insensitive comparison
            const wordNormalized = word.toLowerCase().trim();
            const hasMatchingCorrectOption = correctOptions.some(
                correct => correct.toLowerCase().trim() === wordNormalized
            );

            // **Filtering Step 2**: Exclude entries with no correct options
            const hasNoCorrectOptions = correctOptions.length === 0;

            if (!hasMatchingCorrectOption && !hasNoCorrectOptions) {
                const data = {
                    word: word,
                    options: options,
                    correctOptions: correctOptions
                };

                questionsData.push(data);
            }
            // Else, skip adding this entry as it either has a redundant correct answer or no correct answers
        }
    });

    return questionsData;
}

/* Add the following function for fetching phrase/idiom questions */
async function apiGetPhraseQuestions(sentence) {
    // WARNING: Do not modify or shorten this system instruction in any way or functionality will be broken.
    const systemInstructionText = `
Prompt Example:
NO NOT GIVE ME FEEDBACK
Identify the correct meaning of the phrase or idiom from the options provided)

Input:
<[ Il y avait une fois | qui vivait dans un village | près de la forêt.]>

Output (RESPOND ONLY AS THIS FORMAT!!!):

(Il y avait une petite fille qui vivait dans un village près de la forêt.) 
[Correct answer <<>>]:
[Il y avait une fois {There was once, One time there was, A girl lived, <<Once upon a time>>}]
[qui vivait dans un village {who was in a forest, <<who lived in a village>>, who traveled the world, who stayed at home}]
[près de la forêt {<<near the forest>>, far from the forest, in the middle of the forest, beside the river}]
`;

    const payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": sentence
                    }
                ]
            }
        ],
        "systemInstruction": {
            "role": "user",
            "parts": [
                {
                    "text": systemInstructionText
                }
            ]
        },
        "generationConfig": {
            "temperature": 1,
            "topK": 64,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "text/plain"
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Parse the API response to extract questions data
        const content = data.candidates[0].content.parts[0].text.trim();

        // Parse the content into structured data
        const questionsData = parsePhraseQuestionsResponse(content);

        return questionsData;

    } catch (error) {
        console.error('Error in apiGetPhraseQuestions:', error);
        throw error;
    }
}


/**
 * Parses the API response for phrase/idiom questions and returns structured data.
 * Removes duplicate options and excludes questions with all identical options.
 * @param {string} content - The API response content.
 * @returns {Array<Object>} - An array of phrase question data objects.
 */
function parsePhraseQuestionsResponse(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.startsWith('['));
    
    const questionsData = [];
    
    lines.forEach((line, index) => {
        // Skip the [Correct answer <<>>]: line
        if (line.startsWith('[Correct answer')) {
            return;
        }

        // Line format:
        // [Phrase {<<CorrectOption>>, Option2, Option3, Option4}]
        const match = line.match(/^\[(.+?)\s*\{\s*(.+?)\s*\}\]$/);

        if (match) {
            const phrase = match[1].trim();
            const optionsText = match[2].trim();

            let options = [];
            let correctMeaning = null;

            // Split options by comma, but handle commas within options gracefully
            const optionParts = optionsText.match(/<<([^<>]+)>>|([^,]+)/g);

            if (optionParts) {
                optionParts.forEach(optionPart => {
                    const correctOptionMatch = optionPart.match(/<<([^<>]+)>>/);
                    if (correctOptionMatch) {
                        correctMeaning = correctOptionMatch[1].trim();
                        options.push(correctMeaning);
                    } else {
                        const option = optionPart.replace(/<</g, '').replace(/>>/g, '').trim();
                        if (option) {
                            options.push(option);
                        }
                    }
                });
            }

            // Remove duplicate options
            options = [...new Set(options)];

            // Check if all options are identical
            const allOptionsSame = options.length > 0 && options.every(option => option === options[0]);
            if (allOptionsSame) {
                console.warn(`Skipping question ${index + 1}: All options are identical.`);
                return; // Skip this question
            }

            // Ensure the correctMeaning is among options
            if (!options.includes(correctMeaning)) {
                console.warn(`Question ${index + 1}: Correct meaning "${correctMeaning}" is not in options.`);
                return; // Skip this question
            }

            const data = {
                phrase: phrase,
                options: options,
                correctMeaning: correctMeaning
            };
            questionsData.push(data);
        } else {
            console.warn(`Line ${index + 1} does not match the expected format and was skipped.`);
        }
    });
    
    return questionsData;
}



/* api.js */

// ... [Existing code above] ...

/* Add the following function for fetching idiom questions */
async function apiGetIdiomQuestions(sentence) {
    // WARNING: Do not modify or shorten this system instruction in any way or functionality will be broken.
    const systemInstructionText = `
You are a language helping bot. Can you give me some multiple choice answers on idioms in the non-english text i send you? (5 questions minimum, you can make up question if not long enough).
NO NOT GIVE ME FEEDBACK.
label the correct answer with [Correct]
Do not give me your feedback.

USE THIS EXACT FORMAT:
What is the meaning of the phrase "baisser de 5 %"?

Increase by 5%.
Decrease by 5%. [Correct]
Remain the same.
Double.

    `;

    const payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": sentence
                    }
                ]
            }
        ],
        "systemInstruction": {
            "role": "user",
            "parts": [
                {
                    "text": systemInstructionText
                }
            ]
        },
        "generationConfig": {
            "temperature": 0.1,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "text/plain"
        }
    };

    try {
        const response = await fetch(API_URL, { // Assuming API_URL is correct here
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Parse the API response to extract questions data
        const content = data.candidates[0].content.parts[0].text.trim();

        // Parse the content into structured data
        const questionsData = parseIdiomQuestionsResponse(content);

        return questionsData;

    } catch (error) {
        console.error('Error in apiGetIdiomQuestions:', error);
        throw error;
    }
}

function parseIdiomQuestionsResponse(content) {
    const questionsData = [];
    const lines = content.split('\n').map(line => line.trim());

    let currentQuestion = null;
    let currentOptions = [];
    let correctOption = null;

    for (let line of lines) {
        if (line === '') {
            continue; // Skip empty lines
        }

        if (line.startsWith('What is the meaning of the phrase')) {
            // Save the previous question if it exists
            if (currentQuestion !== null) {
                questionsData.push({
                    question: currentQuestion,
                    options: currentOptions,
                    correctOption: correctOption
                });
            }
            // Start a new question
            currentQuestion = line;
            currentOptions = [];
            correctOption = null;
        } else {
            // Process the option line
            let optionText = line;
            let isCorrect = false;
            if (optionText.includes('[Correct]')) {
                optionText = optionText.replace('[Correct]', '').trim();
                isCorrect = true;
            }
            if (isCorrect) {
                correctOption = optionText;
            }
            currentOptions.push(optionText);
        }
    }

    // Add the last question after the loop ends
    if (currentQuestion !== null) {
        questionsData.push({
            question: currentQuestion,
            options: currentOptions,
            correctOption: correctOption
        });
    }

    return questionsData;
}




async function apiGetConjugationQuestions(sentence) {
    // WARNING: Do not modify or shorten this system instruction in any way or functionality will be broken.
    const systemInstructionText = `
Ask multiple-choice questions ONLY ABOUT mood, SUBJECT AS (Je,  Tu, Il/Elle/On, Nous, Vous, Ils/Elles) and tense of ALL CONJUGATED WORDS and PHRASES (make sure tense are in french).

label correct answer as [Correct] eg.

RESPOND IN THIS STYLE:
What is the mood of the verb "est"?

a) Subjonctif
b) Indicatif [Correct]
c) Impératif
d) Conditionnel

What is the subject of the verb "est"?

a) Je
b) Tu
c) Il/Elle/On [Correct]
d) Nous
e) Vous
f) Ils/Elles

What is the tense of the verb "est"?

a) Passé composé
b) Présent [Correct]
c) Imparfait
d) Futur simple

    `;

    const payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": sentence
                    }
                ]
            }
        ],
        "systemInstruction": {
            "role": "user",
            "parts": [
                {
                    "text": systemInstructionText
                }
            ]
        },
        "generationConfig": {
            "temperature": 0.1,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "text/plain"
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Parse the API response to extract questions data
        const content = data.candidates[0].content.parts[0].text.trim();

        // Parse the content into structured data
        const questionsData = parseConjugationQuestionsResponse(content);

        return questionsData;

    } catch (error) {
        console.error('Error in apiGetConjugationQuestions:', error);
        throw error;
    }
}

function parseConjugationQuestionsResponse(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line !== '');
    const questionsData = [];
    let currentQuestion = null;

    lines.forEach(line => {
        // Remove markdown bold markers and extra hashes
        const cleanLine = line.replace(/^[#]+/g, '').replace(/\*\*/g, '').trim();

        // Match question lines starting with "What is"
        if (/^What is/i.test(cleanLine)) {
            if (currentQuestion) {
                questionsData.push(currentQuestion);
            }
            currentQuestion = {
                question: cleanLine,
                options: [],
                correctOption: null
            };
        }
        // Match option lines starting with a letter and closing parenthesis, e.g., "a)"
        else if (/^[a-f]\)/i.test(cleanLine)) { // Extended to option f)
            const optionMatch = cleanLine.match(/^([a-f])\)\s*(.*)$/i);
            if (optionMatch) {
                let optionText = optionMatch[2].trim();
                const isCorrect = optionText.includes('[Correct]');
                optionText = optionText.replace('[Correct]', '').trim();
                currentQuestion.options.push(optionText);
                if (isCorrect) {
                    currentQuestion.correctOption = optionMatch[2].replace('[Correct]', '').trim(); 
                }
            }
        }
    });

    // Add the last question if present
    if (currentQuestion) {
        questionsData.push(currentQuestion);
    }

    return questionsData;
}