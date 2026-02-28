# CareerRamp — AI Career Navigator for Indian Students

> **GDG Hackathon Solasta 2026 · IIITDM Kurnool**
> Problem Statement 2 — Democratizing Knowledge via GenAI-Powered Web Applications

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
| **AI Model** | Google Gemini 2.5 Flash Lite (`gemini-2.5-flash-lite-preview-06-17`) |
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
| Node.js + Express | REST API server (port 3001) |
| `@google/generative-ai` | Gemini AI integration |
| Mongoose v8 + MongoDB Atlas | Persistent session & user storage |
| jsonwebtoken + bcryptjs | Auth tokens + password hashing |
| express-rate-limit | Rate limiting on AI endpoints |

---

## Core Features

### Adaptive GenAI Backend (Deliverable 1)
- **Dual Gemini key fallback** — if primary key hits quota (429), automatically switches to backup key with zero downtime
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
                                   | Vite proxy /api -> :3001
+----------------------------------v------------------------------+
|                       BACKEND (Express)                         |
|                                                                 |
|  POST /api/auth/register    POST /api/auth/login                |
|  GET  /api/history          POST /api/history                   |
|  DELETE /api/history/:id                                        |
|  POST /api/analyze  -->  gemini.js (key1 -> key2 fallback)      |
|  POST /api/chat     -->  gemini.js                              |
|  POST /api/quiz     -->  gemini.js                              |
|  POST /api/replan   -->  gemini.js                              |
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
|   +-- server.js                  <- Express app, routes, rate limiting
|   +-- gemini.js                  <- Gemini client with dual-key fallback
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
    +-- src/
        +-- App.jsx                <- page router
        +-- context/
        |   +-- AppContext.jsx     <- global state, API calls, auth
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

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_primary_gemini_key
GEMINI_API_KEY_2=your_fallback_gemini_key
```

> Both Gemini keys can be the same key if you only have one. The fallback is a resilience feature for quota limits.

### 3. Run the backend

```bash
cd skillforge/backend
node server.js
# Server starts on http://localhost:3001
```

### 4. Run the frontend

```bash
cd skillforge/frontend
npm run dev
# App starts on http://localhost:5173
```

### 5. Open in browser

Visit **http://localhost:5173**

Register with your phone number → Complete the 5-step onboarding → Get your AI career analysis.

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
