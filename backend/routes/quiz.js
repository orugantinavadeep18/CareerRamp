// ─────────────────────────────────────────────────────────
//  routes/quiz.js
//  AI-generated verification quiz per roadmap step
//  Used to verify step completion before marking done
// ─────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { generateContent } = require('../gemini');
const { quizFallback } = require('../demo');

// POST /api/quiz
router.post('/', async (req, res) => {
  const { skill, stepTitle, role, level, count = 4 } = req.body;

  if (!skill) {
    return res.status(400).json({ error: 'Skill topic is required.' });
  }

  const prompt = `Generate ${count} multiple-choice quiz questions to VERIFY that a student has genuinely learned "${stepTitle || skill}" as part of their journey to become a ${role || 'developer'} at ${level || 'beginner'} level.

Questions should test PRACTICAL understanding, not just definitions.
Mix difficulty: 1 easy, 2 medium, 1 hard (tricky/conceptual).

Respond ONLY with valid JSON (no markdown):
{
  "topic": "${stepTitle || skill}",
  "questions": [
    {
      "id": 1,
      "question": "question text here",
      "options": ["A) option text", "B) option text", "C) option text", "D) option text"],
      "correctAnswer": "A",
      "explanation": "Brief explanation of why A is correct and why others are wrong.",
      "difficulty": "easy|medium|hard"
    }
  ],
  "passingScore": 3
}`;

  try {
    const text = await generateContent(prompt);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!data) throw new Error('Failed to parse quiz data');

    return res.json({ success: true, data });

  } catch (err) {
    console.error('Quiz error:', err.message, '— serving demo fallback');
    const fallback = quizFallback(req.body);
    return res.json({ success: true, data: fallback, _demo: true });
  }
});

module.exports = router;
