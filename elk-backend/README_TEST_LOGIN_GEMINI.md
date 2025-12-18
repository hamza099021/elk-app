# Test login + Gemini script

This script logs in (`POST /api/auth/login`), initializes a Gemini session (`POST /api/ai/gemini/initialize`) and sends a text message (`POST /api/ai/gemini/conversation`).

Prerequisites:
- Server running locally (`npm run dev`)
- `.env` with `GEMINI_API_KEY` and optionally `BASE_URL` (defaults to `http://localhost:3000`)

Run:

```bash
# from project root
node test-login-gemini.js

# or pass email/password
node test-login-gemini.js ibrahim@gmail.com 12345678
```

What it prints:
- Login response and token diagnostics
- Initialize response (sessionId)
- Conversation response
- Optional re-initialize to check token/session stability

If you see intermittent auth failures, inspect server logs and check:
- `JWT_SECRET` is stable across runs
- Sessions table shows tokens created by login
- Time/skew on server (token expiry)
