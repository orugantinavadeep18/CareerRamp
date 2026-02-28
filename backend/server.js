// ─────────────────────────────────────────────────────────
//  SkillForge Backend — server.js
//  Stack: Node.js + Express + Google Gemini
//  Innovative: AI Agent with visible planning, adaptive
//  re-planning, step verification, quiz generation
// ─────────────────────────────────────────────────────────

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const analyzeRoutes = require('./routes/analyze');
const chatRoutes = require('./routes/chat');
const quizRoutes = require('./routes/quiz');
const replanRoutes = require('./routes/replan');
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ──
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));

// Rate limiting — only on expensive AI routes, not auth/history
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10,             // max 10 AI calls/min → comfortably under 15 RPM
  message: { error: 'Rate limit reached. Please wait a moment before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/analyze', limiter);
app.use('/api/chat', limiter);
app.use('/api/quiz', limiter);
app.use('/api/replan', limiter);

// ── Request / Response Logger ──
app.use((req, res, next) => {
  const start = Date.now()
  const origJson = res.json.bind(res)
  let resBody
  res.json = (body) => { resBody = body; return origJson(body) }
  res.on('finish', () => {
    const ms = Date.now() - start
    const ok = res.statusCode < 400
    const icon = res.statusCode < 400 ? '✅' : res.statusCode < 500 ? '⚠️ ' : '❌'
    console.log(`\n${icon} ${req.method} ${req.path}  →  ${res.statusCode}  (${ms} ms)`)
    if (req.body && Object.keys(req.body).length) {
      const preview = JSON.stringify(req.body)
      console.log(`   📥 REQ : ${preview.length > 220 ? preview.slice(0, 220) + '…' : preview}`)
    }
    if (resBody !== undefined) {
      const preview = JSON.stringify(resBody)
      const short = preview.length > 320 ? preview.slice(0, 320) + '…' : preview
      console.log(`   📤 RES : ${short}`)
    }
  })
  next()
})

// ── ROUTES ──
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/replan', replanRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'running',
    engine: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'

// ── Connect MongoDB then start server ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('  ✅ MongoDB connected'))
  .catch(err => console.error('  ❌ MongoDB connection failed:', err.message))

app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   SkillForge AI Agent — Running on :${PORT}     ║
║   Engine : ${MODEL.padEnd(32)}║
║   Mode   : ${(process.env.NODE_ENV || 'development').padEnd(32)}║
╚═══════════════════════════════════════════════╝
  `);

  // ── Startup model ping (uses fallback client) ──
  try {
    const { pingModel, MODEL: m } = require('./gemini')
    const ms = await pingModel()
    console.log(`  ✅ Model ping OK  (${ms} ms) — ${m}`)
  } catch (e) {
    console.error(`  ❌ Model ping FAILED — ${e.message.slice(0, 120)}`)
    console.error('     Check GEMINI_API_KEY / GEMINI_API_KEY_2 in backend/.env')
  }
});

module.exports = app;
