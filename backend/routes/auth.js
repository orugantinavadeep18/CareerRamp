const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ phone })
    if (existing) {
      return res.status(409).json({ error: 'This phone number is already registered' })
    }

    const user = await User.create({ phone, password })
    const token = signToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, phone: user.phone },
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ')
      return res.status(400).json({ error: msg })
    }
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' })
    }

    const user = await User.findOne({ phone })
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' })
    }

    const match = await user.matchPassword(password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid phone number or password' })
    }

    const token = signToken(user._id)

    res.json({
      success: true,
      token,
      user: { id: user._id, phone: user.phone },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

module.exports = router
