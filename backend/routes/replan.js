// ─────────────────────────────────────────────────────────
//  routes/replan.js
//  Adaptive re-planning: when user marks steps done or
//  fails a quiz, AI re-evaluates and adjusts the roadmap
//  This is the core "adaptive agent" feature for PS1
// ─────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { generateContent } = require('../gemini');

// POST /api/replan
router.post('/', async (req, res) => {
  const {
    role,
    level,
    completedSteps = [],
    failedSteps = [],
    currentRoadmap = [],
    quizScores = {},
    skippedSteps = [],
  } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required for re-planning.' });
  }

  const progress = `
Completed milestones: ${completedSteps.join(', ') || 'None yet'}
Failed/struggling steps: ${failedSteps.join(', ') || 'None'}
Skipped steps: ${skippedSteps.join(', ') || 'None'}
Quiz performance: ${Object.entries(quizScores).map(([k, v]) => `${k}: ${v}%`).join(', ') || 'No quizzes taken'}
Remaining roadmap: ${currentRoadmap.filter(s => s.status === 'pending').map(s => s.title).join(', ')}
`;

  const prompt = `You are the SkillForge AI Planning Agent re-evaluating a student's roadmap.

Target Role: ${role}
Level: ${level}

Progress Report:
${progress}

TASK: Analyze their progress and generate an UPDATED roadmap. 
- If they completed steps fast → add advanced/bonus topics
- If they failed quizzes → add foundational reinforcement steps before advancing
- Remove completed steps
- Re-order by priority based on quiz scores
- Add estimated completion dates

Think step by step, then respond ONLY with valid JSON:
{
  "agentThoughts": [
    "Reviewing completed steps...",
    "Analyzing quiz performance patterns...",
    "Identifying knowledge gaps from failed quizzes...",
    "Restructuring remaining path...",
    "Adding adaptive content based on performance..."
  ],
  "adaptation": "accelerate|reinforce|maintain",
  "adaptationReason": "One sentence explanation of why we're adapting.",
  "newReadinessScore": <0-100>,
  "updatedRoadmap": [
    {
      "id": "step-id",
      "week": "Wk X–Y",
      "title": "Step title",
      "description": "Description",
      "tags": ["tag1", "tag2"],
      "resources": ["resource1"],
      "status": "pending",
      "priority": "critical|high|medium|bonus",
      "isNew": true,
      "estimatedHours": <number>,
      "verificationQuiz": true
    }
  ],
  "message": "Personalized motivational message about their progress and what's next."
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

    if (!data) throw new Error('Failed to parse re-plan data');

    return res.json({ success: true, data });

  } catch (err) {
    console.error('Replan error:', err.message, '— serving demo fallback');
    const { replanFallback } = require('../demo');
    const fallback = replanFallback(req.body);
    return res.json({ success: true, data: fallback, _demo: true });
  }
});

module.exports = router;
