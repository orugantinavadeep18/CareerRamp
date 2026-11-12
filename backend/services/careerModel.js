const fs = require('fs')
const path = require('path')

const modelPath = path.join(__dirname, '..', 'ml', 'career_model.json')
let model

function loadModel() {
  if (!model) {
    try {
      model = JSON.parse(fs.readFileSync(modelPath, 'utf8'))
    } catch (error) {
      throw new Error(`Career evidence model is unavailable: ${error.message}`)
    }
  }
  return model
}

function tokenize(text) {
  return text.toLowerCase().normalize('NFKD').replace(/[^\w+#.]+/g, ' ')
    .split(/\s+/).filter(token => token.length > 1)
}

function buildModelText(profile = {}) {
  return [
    profile.education,
    profile.stream,
    ...(profile.activities || []),
    ...(profile.preferences || []),
    profile.goal,
    profile.location,
    profile.quizLevel,
  ].filter(Boolean).join(' ')
}

function predictCareerRoles(profile, limit = 5) {
  const currentModel = loadModel()
  const vector = new Array(currentModel.vectorizer.idf.length).fill(0)
  const counts = new Map()
  tokenize(buildModelText(profile)).forEach(token => {
    counts.set(token, (counts.get(token) || 0) + 1)
  })

  for (const [token, count] of counts) {
    const index = currentModel.vectorizer.vocabulary[token]
    if (index !== undefined) vector[index] = (1 + Math.log(count)) * currentModel.vectorizer.idf[index]
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
  if (!norm) return []

  const logits = currentModel.coefficients.map((coefficient, index) => ({
    role: currentModel.classes[index],
    logit: coefficient.reduce((sum, value, dimension) => sum + value * (vector[dimension] / norm), 0)
      + currentModel.intercepts[index],
    trainingExamples: currentModel.support[index],
  }))
  const maxLogit = Math.max(...logits.map(item => item.logit))
  const probabilities = logits.map(item => ({ ...item, score: Math.exp(item.logit - maxLogit) }))
  const total = probabilities.reduce((sum, item) => sum + item.score, 0)
  return probabilities.sort((a, b) => b.score - a.score).slice(0, limit)
    .map(item => ({ role: item.role, score: Number((item.score / total).toFixed(4)), trainingExamples: item.trainingExamples }))
}

module.exports = { predictCareerRoles }
