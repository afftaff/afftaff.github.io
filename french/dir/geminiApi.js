const GEMINI_KEY_STORAGE = 'geminiApiKey';

function loadGeminiKey(inputElement) {
  const stored = typeof localStorage !== 'undefined'
    ? localStorage.getItem(GEMINI_KEY_STORAGE)
    : null;

  if (inputElement) {
    const trimmed = inputElement.value?.trim();
    if (trimmed) return trimmed;
    if (stored && !trimmed) inputElement.value = stored;
  }

  return stored || null;
}

function saveGeminiKey(value) {
  if (typeof localStorage === 'undefined') return;
  const cleaned = (value || '').trim();
  if (cleaned) {
    localStorage.setItem(GEMINI_KEY_STORAGE, cleaned);
  }
}

function normalizeImagePart(image) {
  if (!image) return null;

  if (typeof image === 'string') {
    if (!image.startsWith('data:')) {
      throw new Error('Image string must be a data URL.');
    }
    const [meta, data] = image.split(',');
    if (!meta || !data) {
      throw new Error('Invalid data URL format.');
    }
    const mimeMatch = meta.match(/data:(.*);base64/);
    if (!mimeMatch) {
      throw new Error('Data URL must include base64 mimeType.');
    }
    return { inlineData: { mimeType: mimeMatch[1], data } };
  }

  if (typeof image === 'object' && image.data && image.mimeType) {
    return { inlineData: { mimeType: image.mimeType, data: image.data } };
  }

  throw new Error('Image must be a data URL string or { data, mimeType } object.');
}

async function callGemini(systemInstruction, userContent, model = 'gemini-flash-latest', options = {}) {
  if (!systemInstruction) throw new Error('Missing system instruction');
  const images = Array.isArray(options.images) ? options.images : [];
  if (!userContent && images.length === 0) throw new Error('Missing user content');

  const key = loadGeminiKey();
  if (!key) throw new Error('Missing API key');
  const parts = [];
  if (userContent) {
    parts.push({ text: userContent });
  }
  images.forEach((image) => {
    const part = normalizeImagePart(image);
    if (part) parts.push(part);
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts }]
      })
    }
  );

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    data = null;
  }

  if (!response.ok || data?.error) {
    const err = new Error(data?.error?.message || `Request failed (${response.status})`);
    err.raw = raw;
    throw err;
  }

  const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!botText) throw new Error('No content returned.');
  return botText;
}

const geminiApi = { callGemini, loadGeminiKey, saveGeminiKey };

if (typeof window !== 'undefined') {
  window.geminiApi = geminiApi;
}

if (typeof module !== 'undefined') {
  module.exports = geminiApi;
}
