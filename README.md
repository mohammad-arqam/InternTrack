# InternTrack

A clean, student-first full-stack app to track internship applications, see pipeline analytics, and use a built-in **Resume Enhancer** (offline-first, with optional ChatGPT API integration).

**Creator:** Mohammad Arqam

## Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + SQLite (better-sqlite3) + JWT Auth

## Features
- Sign up / Log in (JWT auth)
- Applications CRUD
- Analytics dashboard (status distribution, recent activity)
- Resume Enhancer:
  - Offline ATS checks + bullet rewrites + keyword coverage scoring
  - Optional ChatGPT integration hook (you add your own API key)

---

## Run locally

### Backend
```bash
cd server
npm install
npm run dev
```
API: http://localhost:4000

### Frontend
```bash
cd client
npm install
npm run dev
```
Web: http://localhost:5173

---

## Optional: ChatGPT integration

Create `server/.env`:
```env
JWT_SECRET=change-me
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

This template works without an API key. If you set `OPENAI_API_KEY`, you can implement the call inside:
`server/src/resumeEnhancer.js`



## AI Agent (OpenAI)

To enable the real AI resume enhancer:
- Copy `server/.env.example` → `server/.env`
- Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`)

The app will fall back to offline enhancement if no key is set.
