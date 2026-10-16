const careers = require('../data/careers.json')
const { generateEmbedding } = require('../gemini')
const { cosineSimilarity } = require('./similarity')
const { buildProfileText, careerKnowledgeText } = require('./profileText')

const embeddingCache = new Map()

async function getCareerEmbedding(career) {
  const key = career.career
  if (!embeddingCache.has(key)) {
    const pending = generateEmbedding(careerKnowledgeText(career)).catch(err => {
      embeddingCache.delete(key)
      throw err
    })
    embeddingCache.set(key, pending)
  }
  return embeddingCache.get(key)
}

async function matchCareers(profile, limit = 5) {
  const profileEmbedding = await generateEmbedding(buildProfileText(profile))
  const ranked = await Promise.all(careers.map(async career => ({
    career,
    similarity: cosineSimilarity(profileEmbedding, await getCareerEmbedding(career)),
  })))

  return ranked
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(({ career, similarity }) => ({
      ...career,
      semanticSimilarity: Number(similarity.toFixed(4)),
      semanticMatchScore: Math.round(Math.max(0, Math.min(1, similarity)) * 100),
    }))
}

async function retrieveKnowledge(profile, limit = 5) {
  const matches = await matchCareers(profile, limit)
  return matches.map(career => ({
    title: career.source.title,
    url: career.source.url,
    content: careerKnowledgeText(career),
    semanticSimilarity: career.semanticSimilarity,
  }))
}

module.exports = { matchCareers, retrieveKnowledge }
