const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Human-readable title derived from top career match
  title: { type: String, default: 'Career Analysis' },
  // The full 5-layer profile submitted by the user
  profile: { type: mongoose.Schema.Types.Mixed, required: true },
  // The AI-generated career data (matches, roadmap, etc.)
  careerData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Auto-generate title from careerData top match
sessionSchema.pre('save', async function () {
  try {
    const matches = this.careerData?.careerMatches || []
    if (matches.length > 0) {
      this.title = matches[0].careerName || 'Career Analysis'
    }
  } catch (_) {}
})

module.exports = mongoose.model('Session', sessionSchema)
