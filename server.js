// Express server for Render deployment.
// Serves the static frontend (index.html) and exposes POST /api/chat,
// which proxies requests to Gemma 4 via Google AI Studio's Gemini API.
// The real API key lives ONLY here, read from process.env.GEMINI_API_KEY
// (set in Render's dashboard) — it is never sent to or visible from the browser.

const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' })); // allow room for base64 crop photos
app.use(express.static(__dirname)); // serves index.html and any other static files

const GEMMA_MODEL = 'gemma-4-31b-it';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMMA_MODEL}:generateContent`;

function stripThinkingScaffolding(text) {
  if (!text) return text;
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

  for (const marker of ['Final Answer:', '**Final Answer:**', 'Final response:']) {
    const idx = cleaned.indexOf(marker);
    if (idx !== -1) cleaned = cleaned.slice(idx + marker.length);
  }

  const reasoningMarkers = /\b(i will create|i should probably|since no specific|no specific (farmer|data) was provided|let me (think|create)|the user wants|the ai should|to demonstrate|hypothetical (scenario|farmer)|for demonstration purposes|i am ready to help you grow|i need to (analyze|identify|figure)|user'?s?\s+issue:|^role:|^constraint)/i;

  const paragraphs = cleaned.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    const plain = paragraphs.filter(p => !reasoningMarkers.test(p));
    if (plain.length && plain.length < paragraphs.length) cleaned = plain.join('\n\n');
  } else if (reasoningMarkers.test(cleaned)) {
    cleaned = '';
  }

  return cleaned.trim();
}

app.post('/api/chat', async (req, res) => {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY is not set.' });
  }

  try {
    const { prompt, system, image } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A "prompt" string is required.' });
    }

    const userParts = [{ text: prompt }];
    if (image && image.base64 && image.mimeType) {
      userParts.push({ inline_data: { mime_type: image.mimeType, data: image.base64 } });
    }

    const systemText =
      (system || 'You are FarmSense AI, a helpful agricultural assistant.') +
      '\n\nRespond with ONLY the final answer, directly to the farmer. Never show your analysis, ' +
      'reasoning steps, or a breakdown of the question (no "User\'s issue:", no numbered/bulleted planning). ' +
      'Just give the advice in plain sentences.';

    const geminiBody = {
      system_instruction: { parts: [{ text: systemText }] },
      contents: [{ role: 'user', parts: userParts }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
        thinkingConfig: { thinkingLevel: 'minimal' }
      }
    };

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      },
      body: JSON.stringify(geminiBody)
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const message = (data.error && data.error.message) || 'Gemma request failed.';
      return res.status(geminiRes.status).json({ error: message });
    }

    const parts = data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts;

    if (!parts || !parts.length) {
      return res.status(502).json({ error: 'No response from Gemma.' });
    }

    const answerText = parts.filter(p => !p.thought && p.text).map(p => p.text).join('\n');
    const reply = stripThinkingScaffolding(answerText);

    if (!reply) {
      return res.status(502).json({ error: 'Gemma returned an empty answer.' });
    }

    res.json({ reply });
  } catch (err) {
    console.error('chat error:', err);
    res.status(500).json({ error: err.message || 'Unexpected server error.' });
  }
});

// Fallback: serve index.html for the root and any unmatched non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FarmSense AI server running on port ${PORT}`);
});
