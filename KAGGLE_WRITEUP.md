# FarmSense AI — Kaggle Write-Up Draft

*Copy/paste and adapt this into your Kaggle competition write-up. Sections match what judges are scored on: Gemma Integration (30%), Innovation & Impact (30%), Functionality & Technical Execution (20%), Presentation & Documentation (20%).*

---

## Title
FarmSense AI — A Gemma 4-Powered Smart Farm Assistant for Nigerian Farmers

## Track
AI for Social Impact

---

## The Why (Problem & Motivation)

Over 70% of Nigerians depend on agriculture, but most smallholder farmers have no practical way to reach an agronomist when a crop starts failing. Existing agri-tech tools mostly assume a smartphone, stable internet, and English literacy — three things a large share of rural farmers don't reliably have. Meanwhile, crop stress and disease are often invisible to the naked eye until it's too late to save the harvest, and even farmers who correctly diagnose a problem frequently can't access the financing to fix it.

FarmSense AI was built to close the "I don't know what's wrong, and even if I did, I couldn't afford to fix it" gap — in the farmer's own language, from a basic phone browser.

## The How (Solution & Gemma 4 Integration)

FarmSense AI is a single-page web app that puts Gemma 4 (`gemma-4-31b-it`, via the Gemini API on Google AI Studio) behind four distinct, farmer-facing features:

1. **Multilingual chat assistant** — farmers ask questions in English, Hausa, Yoruba, Igbo, or Nigerian Pidgin and get direct, practical answers about crop diseases, pests, planting timing, fertilizer, and storage.
2. **Photo-based crop diagnosis** — a farmer uploads or takes a photo of a sick plant; Gemma 4's native multimodal capability examines the actual image (color, spots, wilting, visible pests) and returns a diagnosis and treatment step, not a generic caption.
3. **Farm credit eligibility check** — a farmer submits their real farm data (state, crop, farm size, loan amount); Gemma reasons over that specific structured input to produce a credit score, status, recommended loan amount, interest rate, and advice — grounded in the data given, not an invented example.
4. **Satellite farm health scan** — simulated NDVI/soil/coverage/risk readings are generated, and Gemma turns those specific numbers into a concrete, actionable recommendation.

Each feature has its own tailored system prompt, and Gemma's "thinking" output is explicitly suppressed and filtered so farmers only ever see the final, direct answer — not the model's internal reasoning steps.

## Why This Isn't "Just a Chatbot"

The kickoff guidance was explicit that a basic chat wrapper doesn't count as meaningful integration. FarmSense AI avoids that by having Gemma do four functionally different jobs — free-form conversation, image analysis, structured data reasoning, and numeric-data-grounded recommendation — each requiring a different prompt design and output format.

## Tech Stack

Single-file HTML/CSS/vanilla JS front end, calling Gemma 4 directly via the Gemini API's `generateContent` endpoint. No framework, no backend, no build step — deployable anywhere a static file can be hosted.

## What's Built vs. Roadmap

**Built and working:** multilingual chat, photo diagnosis, credit eligibility check, satellite scan recommendation, USSD access simulator.

**Roadmap:** a real USSD gateway integration (e.g. Africa's Talking) for genuine feature-phone access, live satellite imagery in place of simulated readings, voice-note input, and a real lending-partner integration.

## Links

- **GitHub repo:** `<paste your public repo URL here>`
- **Live demo / demo video:** `<paste your link here>`

---

*Remember to attach or link your demo video/live link, and double-check the GitHub repo is set to Public before submitting.*
