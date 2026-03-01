# CareerRamp — AI Career Navigator for Indian Students

> **GDG Hackathon Solasta 2026 · IIITDM Kurnool**
> Problem Statement 2 — Democratizing Knowledge via GenAI-Powered Web Applications

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| **Frontend (Vercel)** | https://career-ramp-g8d5.vercel.app |
| **Backend API (Render)** | https://careerramp-1.onrender.com |
| **API Health Check** | https://careerramp-1.onrender.com/api/health |

---

## What is CareerRamp?

CareerRamp is a full-stack, AI-powered career guidance platform built specifically for Indian students and early-career professionals. It bridges the gap between a student's current background and their ideal career — using Google Gemini AI to deliver **personalised**, **adaptive** career roadmaps based on real-world factors: education level, location, financial condition, extracurricular activities, and a live knowledge quiz.

Unlike static career counselling or generic chatbots, CareerRamp **thinks** — it assesses each user's profile, scores their domain knowledge, and generates tailored career matches, skill gap analysis, week-by-week roadmaps, and action plans. Users can save analyses, track goals, replay past reports, and chat with an AI advisor — all from a persistent personal dashboard.

---

## Agent Details

| Field | Value |
|---|---|
| **Agent / App Name** | CareerRamp |
| **Framework** | React 18 + Vite (Frontend) · Node.js + Express (Backend) |
| **AI Model** | Google Gemini 2.5 Flash Lite (`gemini-2.5-flash-lite`) |
| **Database** | MongoDB Atlas (Mongoose v8) |
| **Auth** | JWT (30-day tokens) + bcryptjs |
| **Hosting** | Frontend → Vercel · Backend → Render (free tier) |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite 5 | UI framework + dev server |
| Tailwind CSS v3 | Styling |
| Lucide React | Icons |
| Axios | HTTP client with JWT interceptor |
| Web Audio API | In-app sound effects (no files needed) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| `@google/generative-ai` | Gemini AI integration with 4-key fallback |
| Mongoose v8 + MongoDB Atlas | Persistent session & user storage |
| jsonwebtoken + bcryptjs | Auth tokens + password hashing |
| express-rate-limit | Rate limiting on AI endpoints |

---

## Core Features

### Adaptive GenAI Backend (Deliverable 1)
- **4-key Gemini fallback** — if a key hits quota (429), automatically switches to the next key with zero downtime
- **Self keep-alive bot** — server pings its own `/api/health` every 14 minutes so the Render free tier never sleeps
- **Profile-aware prompting** — full user context (education, location, activities, financial condition, quiz score, career urgency) is injected into every Gemini prompt
- **Quiz-adjusted AI depth** — `basic` / `intermediate` / `advanced` level calculated from quiz score directly changes the complexity of AI explanations and roadmap detail
- **Adaptive replan** — `/api/replan` lets users request a cheaper, faster, or different variation of their roadmap; Gemini regenerates with the new constraint
- **Live agent thinking panel** — streams Gemini reasoning steps to the UI in real time

### Interactive Frontend (Deliverable 2)
- **Multi-step onboarding wizard** — 5 steps: profile → activities → adaptive quiz → financial context → career awareness
- **Full results dashboard** — tabbed sections: Career Matches, Skill Gap Radar, Roadmap Timeline, Action Plan, AI Tutor Chat, Salary Table, Career Comparison
- **Personal UserDashboard** — 4 tabs: Overview (activity heatmap, stats), History (saved analyses), Goals (with reminders), Advisor (persistent Gemini chat)
- **Sound effects** — login chime, analysis fanfare, notification ping (Web Audio API, no audio files)
- **Persistent login** — survives page refresh via `localStorage` JWT storage

### Personalisation & Feedback Loop (Deliverable 3)
| Type | Mechanism |
|---|---|
| Explicit | 36-question adaptive quiz pool → 5 questions selected based on education + activities → `quizScore` drives AI difficulty |
| Explicit | Financial condition, job urgency, career awareness selections feed into Gemini prompt context |
| Explicit | Like / save sessions → surfaces most useful reports in Overview tab |
| Explicit | Goal tracking with completion marking → engagement signal |
| Feedback | Replan endpoint — dissatisfaction triggers AI regeneration with adjusted parameters |

### Accessibility & Inclusivity (Deliverable 4)
- Fully responsive — mobile and desktop
- High contrast dark theme (`#EDEAE4` text on `#08080D` background)
- No plugins or extra software required — runs in any modern browser
- Deployable to Vercel + Render (both free tier)

---

## Architecture

```
+-----------------------------------------------------------------+
|                        FRONTEND (React)                         |
|              https://career-ramp-g8d5.vercel.app                |
|                                                                 |
|  Landing -> Auth -> Welcome -> Onboarding ------------------+  |
|                                             runAnalysis()   |  |
|  UserDashboard (4 tabs)                                     |  |
|  +-- Overview  (heatmap, stats, top match)                  |  |
|  +-- History   (saved sessions, view/delete/like)           |  |
|  +-- Goals     (add/track/complete, browser reminders)      |  |
|  +-- Advisor   (Gemini chat, suggested prompts)             |  |
|                                                             v  |
|  Dashboard (AI Results)                                        |
|  +-- Career Matches + Match %                                  |
|  +-- Skill Gap RadarChart + SkillBars                          |
|  +-- Roadmap Timeline                                          |
|  +-- Action Plan                                               |
|  +-- Salary Table + Career Comparison                          |
|  +-- ChatTutor (context-aware Gemini chat)                     |
+----------------------------------+------------------------------+
                                   | Axios + JWT Bearer token
                                   | VITE_API_URL → Render backend
+----------------------------------v------------------------------+
|                       BACKEND (Express)                         |
|              https://careerramp-1.onrender.com                  |
|                                                                 |
|  POST /api/auth/register    POST /api/auth/login                |
|  GET  /api/history          POST /api/history                   |
|  DELETE /api/history/:id                                        |
|  POST /api/analyze  -->  gemini.js (key1->key2->key3->key4)     |
|  POST /api/chat     -->  gemini.js                              |
|  POST /api/quiz     -->  gemini.js                              |
|  POST /api/replan   -->  gemini.js                              |
|  GET  /api/health   -->  status check + keep-alive target       |
|                                                                 |
|  🤖 Keep-alive: self-pings /api/health every 14 min            |
+----------------------------------+------------------------------+
                                   | Mongoose v8
                      +------------v------------+
                      |     MongoDB Atlas        |
                      |  users  .  sessions      |
                      +-------------------------+
```

---

## Project Structure

```
skillforge/
+-- backend/
|   +-- server.js                  <- Express app, CORS, routes, keep-alive bot
|   +-- gemini.js                  <- Gemini client with 4-key fallback
|   +-- .env                       <- secrets (not committed)
|   +-- .env.example               <- template for setup
|   +-- middleware/
|   |   +-- auth.js                <- JWT verification middleware
|   +-- models/
|   |   +-- User.js                <- user schema (phone, password hash)
|   |   +-- Session.js             <- analysis session schema
|   +-- routes/
|       +-- auth.js                <- register / login
|       +-- history.js             <- CRUD for saved sessions
|       +-- analyze.js             <- core career analysis (Gemini)
|       +-- chat.js                <- AI tutor chat (Gemini)
|       +-- quiz.js                <- MCQ generation (Gemini)
|       +-- replan.js              <- adaptive roadmap replan (Gemini)
+-- frontend/
    +-- .env                       <- VITE_API_URL (not committed)
    +-- .env.example               <- template for setup
    +-- src/
        +-- App.jsx                <- page router
        +-- context/
        |   +-- AppContext.jsx     <- global state, shared api instance, auth
        +-- utils/
        |   +-- sounds.js          <- Web Audio API sound effects
        +-- pages/
        |   +-- Landing.jsx        <- marketing landing page
        |   +-- Auth.jsx           <- login / register
        |   +-- Welcome.jsx        <- post-login welcome
        |   +-- Onboarding.jsx     <- 5-step form + adaptive quiz
        |   +-- Dashboard.jsx      <- AI results (tabbed sections)
        |   +-- UserDashboard.jsx  <- personal hub (4 tabs)
        +-- components/
            +-- AgentThinkingPanel.jsx   <- live AI reasoning stream
            +-- CareerMatchCard.jsx      <- career result card
            +-- CareerComparison.jsx     <- side-by-side career compare
            +-- RadarChart.jsx           <- skill gap visualisation
            +-- SkillBars.jsx            <- skill level bars
            +-- RoadmapTimeline.jsx      <- week-by-week roadmap
            +-- RoadmapPlan.jsx          <- structured plan view
            +-- SalaryTable.jsx          <- salary range table
            +-- QuizModal.jsx            <- milestone quiz
            +-- ChatTutor.jsx            <- in-dashboard AI chat
            +-- Navbar.jsx               <- top navigation
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier works): https://mongodb.com/atlas
- Google AI Studio API key: https://aistudio.google.com/app/apikey

### 1. Clone and install dependencies

```bash
# Backend
cd skillforge/backend
npm install

# Frontend (separate terminal)
cd skillforge/frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_primary_gemini_key
GEMINI_API_KEY_2=your_fallback_gemini_key
GEMINI_API_KEY_3=your_fallback_gemini_key_3
GEMINI_API_KEY_4=your_fallback_gemini_key_4
GEMINI_MODEL=gemini-2.5-flash-lite
FRONTEND_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

> In development the Vite proxy handles `/api` → `localhost:3001` automatically.

### 3. Run locally

```bash
# Terminal 1 — backend
cd skillforge/backend
node server.js
# → http://localhost:3001

# Terminal 2 — frontend
cd skillforge/frontend
npm run dev
# → http://localhost:5173
```

Visit **http://localhost:5173** → Register → Complete onboarding → Get your AI career analysis.

---

## Deployment

### Backend → Render

1. Connect your GitHub repo to [render.com](https://render.com)
2. **Root Directory:** `skillforge/backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. **Environment Variables** (Render dashboard → Environment):

```
GEMINI_API_KEY        = your_key_1
GEMINI_API_KEY_2      = your_key_2
GEMINI_API_KEY_3      = your_key_3
GEMINI_API_KEY_4      = your_key_4
GEMINI_MODEL          = gemini-2.5-flash-lite
MONGODB_URI           = your_mongodb_atlas_uri
JWT_SECRET            = your_jwt_secret
FRONTEND_URL          = https://your-vercel-app.vercel.app
```

> `PORT` is set automatically by Render — do not add it manually.

### Frontend → Vercel

1. Connect your GitHub repo to [vercel.com](https://vercel.com)
2. **Root Directory:** `skillforge/frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variables** (Vercel dashboard → Settings → Environment Variables):

```
VITE_API_URL = https://careerramp-1.onrender.com
```

---

## Keep-Alive Bot (Anti-Sleep)

Render free tier spins down after 15 minutes of inactivity. CareerRamp solves this with a built-in self-ping:

```js
// runs automatically after server starts
setInterval(() => {
  https.get(`${RENDER_EXTERNAL_URL}/api/health`, ...)
}, 14 * 60 * 1000) // every 14 minutes
```

- Uses `RENDER_EXTERNAL_URL` which Render sets automatically — no config needed
- Falls back to `localhost` in development (harmless)
- Logs: `🤖 Keep-alive ping → https://careerramp-1.onrender.com/api/health [200]`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register with phone + password |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/history` | ✅ | List all saved analyses |
| POST | `/api/history` | ✅ | Save an analysis session |
| GET | `/api/history/:id` | ✅ | Get a single session |
| DELETE | `/api/history/:id` | ✅ | Delete a session |
| POST | `/api/analyze` | ✅ | Run full AI career analysis |
| POST | `/api/chat` | ✅ | AI tutor chat message |
| POST | `/api/quiz` | ✅ | Generate quiz questions |
| POST | `/api/replan` | ✅ | Regenerate roadmap with new constraints |
| GET | `/api/health` | ❌ | Server health check |

---

## How the Personalisation Works

```
User fills profile
      |
      +-- Education level  --+
      +-- Location            +-- Selects 5 quiz questions
      +-- Activities        --+   from 36-question pool
                                  across 6 domains
              |
              v
       Quiz Score (0-10)
              |
         +----+----+
      basic  inter  advanced
              |
              v
   Gemini prompt includes:
   - Education, location, activities
   - Financial condition
   - Job urgency (needJobIn)
   - Career awareness choices
   - Quiz level (basic/intermediate/advanced)
              |
              v
   Personalised output:
   - Career matches ranked by fit %
   - Skill gaps specific to user's current level
   - Roadmap complexity matched to quiz score
   - Salary ranges relevant to Indian market
   - Action plan steps within financial constraints
```

---

## Demo Flow

1. **Login / Register** — JWT stored in `localStorage`, persists across refresh
2. **Onboarding** — 5 steps including the adaptive quiz
3. **Analysis** — Live agent thinking panel shows AI reasoning → full results dashboard
4. **Dashboard** — Explore career matches, skill gaps, roadmap, salary data, AI chat
5. **Replan** — Request a faster or cheaper variation and Gemini regenerates
6. **UserDashboard** — History tab shows all past analyses; Goals tab for tracking; Advisor tab for ongoing chat
7. **Notifications** — Goal reminders fire as browser notifications + in-app toast + sound

---

## Evaluation Criteria Mapping

| Criterion | How CareerRamp Addresses It |
|---|---|
| Relevance & impact | Targets underserved Indian students with zero access to personalised career counselling |
| GenAI effectiveness | Quiz score + full profile → adaptive prompt depth; replan endpoint for iterative AI refinement |
| Frontend UI/UX | Multi-page product with dashboard, radar charts, timeline, sound effects — not a chatbot |
| Personalisation loop | Explicit quiz + profile + financial constraint → implicit likes/saves + replan feedback |
| Cross-device accessibility | Responsive Tailwind layout, tested on mobile and desktop |
| Code quality | JWT auth middleware, rate limiting, Mongoose models, modular routes, React context |
| Demo clarity | Live analysis: shows thinking panel → full results → save → history → goal tracking |
