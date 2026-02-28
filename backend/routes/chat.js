// ─────────────────────────────────────────────────────────
//  routes/chat.js — CareerRamp career mentor chat
//  Uses generateContent (prompt-based) — avoids chat session constraints
// ─────────────────────────────────────────────────────────
const express = require('express')
const router = express.Router()
const { generateContent } = require('../gemini')

router.post('/', async (req, res) => {
  const { message, history = [], context } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required.' })

  const profileBlock = context ? `
=== Student Profile ===
Name: ${context.name || 'Student'} | Age: ${context.age || 'unknown'} | Education: ${context.education || 'unknown'}
Location: ${context.location || 'India'} | Financial: ${context.financialCondition || 'not specified'}
Top career match: ${context.topCareer || 'not yet determined'}
Skills to learn: ${context.skillGaps?.join(', ') || 'not yet analyzed'}
======================` : ''

  // Build conversation turns as plain text
  const historyText = history.slice(-6).map(m =>
    m.role === 'user' ? `Student: ${m.content}` : `CareerRamp AI: ${m.content}`
  ).join('\n')

  const prompt = `You are CareerRamp AI — a warm, practical Indian career mentor. Your expertise spans Engineering, Medicine, Government exams (UPSC, SSC, Banking, Railways, Defense, State PSC), Law, Commerce, Arts, Creative careers (Design, Animation, Film), Business & Entrepreneurship, Skilled Trades (Electrician, CNC, Hotel Management), and Emerging Careers (Drone Tech, Ethical Hacking, Renewable Energy).

Rules:
- NEVER assume the student must become an engineer or doctor
- Always tailor advice to their financial situation and location
- Use **bold** for career names, exam names, salary figures
- Keep answers to 4-5 sentences unless more detail is asked for
- Cite specific free resources (YouTube channels, websites, government schemes)
${profileBlock}

${historyText ? `Conversation so far:\n${historyText}\n` : ''}Student: ${message}
CareerRamp AI:`

  try {
    const reply = await generateContent(prompt, { maxOutputTokens: 512, temperature: 0.7 })
    return res.json({ success: true, reply: reply.trim() })
  } catch (err) {
    console.error('Chat error:', err.message)
    return res.status(500).json({
      error: 'Chat unavailable',
      reply: "I'm having trouble connecting right now. Please try again in a moment!",
    })
  }
})

module.exports = router
