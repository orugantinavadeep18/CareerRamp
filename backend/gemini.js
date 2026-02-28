/**
 * gemini.js — Gemini client with automatic key fallback
 *
 * Key order:
 *   0 → GEMINI_API_KEY   (primary)
 *   1 → GEMINI_API_KEY_2 (backup 1)
 *   2 → GEMINI_API_KEY_3 (backup 2)
 *   3 → GEMINI_API_KEY_4 (backup 3)
 *
 * If a key hits quota (429) or any error, the next key is tried automatically.
 */

require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'

const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean)

if (KEYS.length === 0) {
  console.error('❌ No Gemini API keys found. Set GEMINI_API_KEY in backend/.env')
}

/**
 * Call Gemini generateContent with automatic key fallback.
 * @param {string} prompt
 * @param {object} [generationConfig]
 * @returns {Promise<string>} raw text response
 */
async function generateContent(prompt, generationConfig = {}) {
  let lastError
  for (let i = 0; i < KEYS.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(KEYS[i])
      const model = genAI.getGenerativeModel({ model: MODEL, generationConfig })
      const result = await model.generateContent(prompt)
      if (i > 0) console.log(`  ⚡ Key fallback: using key #${i + 1}`)
      return result.response.text()
    } catch (err) {
      lastError = err
      console.warn(`  ⚠️  Key #${i + 1} failed (${err.message?.slice(0, 80)}) — ${i + 1 < KEYS.length ? 'trying next key...' : 'no more keys.'}`)
    }
  }
  throw lastError
}

/**
 * Start a Gemini chat session with automatic key fallback.
 * Tries key 0 first; if startChat/sendMessage fails, retries with key 1.
 * @param {object} chatConfig   — passed to model.startChat()
 * @param {string} userMessage  — the first/current message to send
 * @returns {Promise<string>} assistant reply text
 */
async function chatSend(chatConfig, userMessage) {
  let lastError
  // systemInstruction must go to getGenerativeModel, not startChat
  const { systemInstruction, ...startChatConfig } = chatConfig
  for (let i = 0; i < KEYS.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(KEYS[i])
      const model = genAI.getGenerativeModel({
        model: MODEL,
        ...(systemInstruction ? { systemInstruction } : {}),
      })
      const chat = model.startChat(startChatConfig)
      const result = await chat.sendMessage(userMessage)
      if (i > 0) console.log(`  ⚡ Key fallback: using key #${i + 1}`)
      return result.response.text()
    } catch (err) {
      lastError = err
      console.warn(`  ⚠️  Key #${i + 1} failed (${err.message?.slice(0, 80)}) — ${i + 1 < KEYS.length ? 'trying next key...' : 'no more keys.'}`)
    }
  }
  throw lastError
}

/**
 * One-shot ping to verify a key works.
 * Used at server startup.
 */
async function pingModel() {
  const t0 = Date.now()
  await generateContent('Reply with only: OK')
  return Date.now() - t0
}

module.exports = { generateContent, chatSend, pingModel, MODEL }
