const express = require('express')
const Session = require('../models/Session')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// All routes below require auth
router.use(authMiddleware)

// GET /api/history — list user's past sessions (newest first, lightweight)
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .select('_id title profile createdAt careerData')
      .sort({ createdAt: -1 })
      .limit(20)
    res.json({ success: true, sessions })
  } catch (err) {
    console.error('History fetch error:', err)
    res.status(500).json({ error: 'Failed to load history' })
  }
})

// GET /api/history/:id — get full session data
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.userId })
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json({ success: true, session })
  } catch (err) {
    console.error('Session fetch error:', err)
    res.status(500).json({ error: 'Failed to load session' })
  }
})

// POST /api/history — save a new session after analysis
router.post('/', async (req, res) => {
  try {
    const { profile, careerData } = req.body
    if (!profile || !careerData) {
      return res.status(400).json({ error: 'profile and careerData are required' })
    }
    const session = await Session.create({ userId: req.userId, profile, careerData })
    res.status(201).json({ success: true, session })
  } catch (err) {
    console.error('Save session error:', err)
    res.status(500).json({ error: 'Failed to save session' })
  }
})

// DELETE /api/history/:id — delete a session
router.delete('/:id', async (req, res) => {
  try {
    await Session.deleteOne({ _id: req.params.id, userId: req.userId })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session' })
  }
})

module.exports = router
