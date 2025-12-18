# Test API Keys for Gemini and Perplexity

These quick scripts check that your API keys can authenticate and that the target models respond.

Prerequisites
- Node 18+ (has `fetch`) and `npm`.
- From `elk-backend` directory install dependencies:

  npm install @google/genai axios

Scripts
- `scripts/test_gemini.js` — checks `GEMINI_API_KEY` by opening a short Gemini live session for `gemini-live-2.5-flash-preview`.
- `scripts/test_perplexity_sonar.js` — checks `PERPLEXITY_API_KEY` using Perplexity Sonar Pro model (`llama-3.1-sonar-large-128k-online`).
- `scripts/test_perplexity_deep.js` — checks `PERPLEXITY_API_KEY` using the model name specified in `PERPLEXITY_DEEP_MODEL`.

Usage (Windows CMD)

1) Gemini

  set GEMINI_API_KEY=your_gemini_api_key_here
  node scripts\test_gemini.js

2) Perplexity Sonar Pro

  set PERPLEXITY_API_KEY=your_perplexity_api_key_here
  node scripts\test_perplexity_sonar.js

3) Perplexity Deep Research (model name must be provided)

  set PERPLEXITY_API_KEY=your_perplexity_api_key_here
  set PERPLEXITY_DEEP_MODEL=your_deep_model_name_here
  node scripts\test_perplexity_deep.js

Usage (PowerShell)

  $env:GEMINI_API_KEY = 'your_gemini_api_key_here'
  node scripts/test_gemini.js

Notes
- The scripts are intentionally minimal — they only verify authentication, basic reachability and whether the model returns a valid reply or an HTTP error (401, 429, etc.).
- If you need deeper quota checks (monthly usage, remaining credits), use provider dashboards or billing APIs — those are provider-specific and typically not exposed via simple model endpoints.

If you want, I can run these here (if you provide API keys) or help you interpret the output you get locally.
