// ─────────────────────────────────────────────────────────
//  routes/analyze.js — CareerRamp
//  5-layer adaptive career intelligence analysis
// ─────────────────────────────────────────────────────────
const express = require('express')
const router = express.Router()
const { generateContent } = require('../gemini')

router.post('/', async (req, res) => {
  const {
    name, age, education, stream, location, language,
    activities = [], preferences = [],
    quizScore = 0, quizLevel = 'basic',
    financialCondition, needJobIn, canRelocate, studyAbroad, canAffordHigherEd,
    careerAwareness = [],
    goal,
  } = req.body

  if (!education) return res.status(400).json({ error: 'Education level is required.' })

  const prompt = `You are CareerRamp AI — an intelligent Career Navigation System designed to democratize career guidance for Indian students. Act like a GPS system for careers: precise, practical, and personalized.

## User Profile (5-Layer Assessment)
### Layer 1 — Background
- Name: ${name || 'Student'}
- Age: ${age || 'Not specified'}
- Education: ${education}${stream ? ' — ' + stream : ''}
- Location: ${location || 'India'}
- Preferred Language: ${language || 'English'}

### Layer 2 — Interests & Personality
- Enjoyable Activities: ${activities.length ? activities.join(', ') : 'Not specified'}
- Work Style Preferences: ${preferences.length ? preferences.join(', ') : 'Not specified'}

### Layer 3 — Adaptive Skill Assessment
- Quiz Score: ${quizScore}/10 (${quizLevel} aptitude level)

### Layer 4 — Constraints
- Financial Condition: ${financialCondition || 'Not specified'}
- Needs income in: ${needJobIn || 'Flexible'}
- Can Relocate: ${canRelocate ? 'Yes' : 'No'}
- Study Abroad Interest: ${studyAbroad ? 'Yes' : 'No'}
- Can Afford Higher Education: ${canAffordHigherEd || 'Unsure'}

### Layer 5 — Career Exposure
- Fields already aware of: ${careerAwareness.length ? careerAwareness.join(', ') : 'Limited — mostly Engineering/Medicine'}
- Personal Goal: ${goal || 'Not specified'}

## Your Mission
Think step-by-step:
1. Map personality type from activities/preferences
2. Match aptitude score to suitable career requirements
3. Factor in financial constraints — prioritize realistic paths
4. Suggest careers BEYOND just Engineering/Medicine that this student may not know
5. Provide localized opportunities for ${location || 'their state'}
6. Predict 5-year market demand

Respond ONLY with valid JSON (no markdown):

{
  "agentThoughts": [
    "Analyzing personality profile from ${activities.slice(0,2).join(', ')}...",
    "Aptitude score ${quizScore}/10 → mapping to ${quizLevel}-level career tracks...",
    "Filtering careers by financial situation: ${financialCondition || 'not specified'}...",
    "Identifying localized opportunities in ${location || 'your region'}...",
    "Generating career roadmap and 5-year market forecast..."
  ],
  "personalityType": "One sentence describing their personality archetype e.g. 'Analytical Problem-Solver with Creative Inclinations'",
  "topMatches": [
    {
      "career": "Career Name",
      "domain": "Tech|Government|Creative|Business|Skilled Trades|Academic|Emerging",
      "matchScore": 87,
      "whyFit": "2 sentences explaining exactly how their specific activities, aptitude, and constraints match this career",
      "avgEntrySalary": "₹X–Y LPA",
      "avgMidSalary": "₹X–Y LPA",
      "growthRate": "High|Medium|Low",
      "risk": "Low|Medium|High",
      "studyDuration": "X months/years",
      "approxCost": "₹XX,000–X,00,000",
      "roi": "High|Medium|Low",
      "competitionLevel": "Very High|High|Medium|Low",
      "demandIn5Years": "Surging|High|Stable|Declining",
      "localOpportunities": ["specific opportunity 1 in ${location || 'India'}", "specific opportunity 2"]
    }
  ],
  "skillGapAnalysis": {
    "forCareer": "Name of top matched career",
    "required": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "currentlyHave": ["skill based on their profile"],
    "needToLearn": ["skill1", "skill3", "skill4"],
    "difficultyToAcquire": "Easy|Moderate|Challenging"
  },
  "roadmap": [
    {
      "month": "Month 1",
      "focus": "Core topic/skill to study",
      "tasks": ["specific task 1", "specific task 2", "specific task 3"],
      "milestone": "Concrete achievement by end of this month",
      "resources": ["Free resource 1", "Platform/Course 2"]
    }
  ],
  "salaryComparison": [
    {
      "career": "career name",
      "entry": "₹X LPA",
      "mid": "₹X LPA",
      "senior": "₹X LPA",
      "growth": "High|Medium|Low",
      "risk": "Low|Medium|High",
      "competition": "High|Medium|Low"
    }
  ],
  "careerComparison": [
    {
      "career": "career name",
      "studyDuration": "X years",
      "cost": "₹X–X lakh",
      "roi": "High|Medium|Low",
      "competition": "High|Medium|Low",
      "jobAvailability": "High|Medium|Low",
      "workLifeBalance": "Good|Average|Poor"
    }
  ],
  "marketDemand": {
    "analysis": "2-sentence market forecast specifically for their top career match",
    "growingFields": ["field 1", "field 2", "field 3", "field 4"],
    "decliningFields": ["declining field 1", "declining field 2"],
    "prediction": "Bold 1-sentence 5-year prediction for their top career"
  },
  "localizedOpportunities": {
    "region": "${location || 'India'}",
    "relevantExams": ["exam relevant to location and profile"],
    "skillPrograms": ["state/central skill program 1", "program 2"],
    "industries": ["key industry in their region"]
  },
  "hiddenCareers": ["Lesser-known career 1 they should explore", "career 2", "career 3"],
  "radarData": {
    "labels": ["Analytical", "Creative", "Communication", "Technical", "Leadership", "Practical"],
    "scores": [70, 60, 55, 65, 50, 60]
  },
  "personalizedAdvice": "Warm, specific 2-sentence message for ${name || 'this student'} referencing their exact background."
}`

  try {
    const text = await generateContent(prompt)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    let data
    try { data = JSON.parse(cleaned) }
    catch {
      const m = cleaned.match(/\{[\s\S]*\}/)
      if (m) data = JSON.parse(m[0])
      else throw new Error('AI returned invalid JSON')
    }
    return res.json({ success: true, data })
  } catch (err) {
    console.error('Analyze error:', err.message)
    return res.status(500).json({ error: 'Analysis failed', message: err.message })
  }
})

module.exports = router
