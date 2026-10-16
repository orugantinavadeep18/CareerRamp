function cosineSimilarity(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== vectorB.length || vectorA.length === 0) {
    throw new Error('Vectors must be non-empty arrays of equal length')
  }

  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < vectorA.length; i++) {
    dot += vectorA[i] * vectorB[i]
    normA += vectorA[i] ** 2
    normB += vectorB[i] ** 2
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

module.exports = { cosineSimilarity }
