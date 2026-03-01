/**
 * gemini.js — Gemini client with automatic key × model fallback matrix
 *
 * At startup, auto-detects the fastest working model from MODELS list.
 * Falls back across all 4 keys for every call.
 */

require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

// Model priority list — fastest/most available first
const MODELS = [
  process.env.GEMINI_MODEL,          // allow override via env
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i) // deduplicate

const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean)

if (KEYS.length === 0) {
  console.error('❌ No Gemini API keys found. Set GEMINI_API_KEY in backend/.env')
}

// activeModel is discovered at startup by pingModel(); exported for health check
let activeModel = MODELS[0]

/**
 * Try every key × model combination until one succeeds.
 * Order: key1×model1, key2×model1, ... key1×model2, key2×model2 ...
 */
async function tryAllCombinations(fn) {
  if (KEYS.length === 0) throw new Error('No Gemini API keys configured.')
  let lastError
  for (const model of MODELS) {
    for (let ki = 0; ki < KEYS.length; ki++) {
      try {
        const result = await fn(KEYS[ki], model)
        if (model !== activeModel || ki > 0) {
          console.log(`  ⚡ Using key #${ki + 1} × model ${model}`)
          activeModel = model
        }
        return result
      } catch (err) {
        lastError = err
        const reason = err.message?.slice(0, 80)
        console.warn(`  ⚠️  key#${ki + 1} × ${model} failed: ${reason}`)
      }
    }
  }
  throw lastError || new Error('All Gemini key × model combinations failed')
}

/**
 * Call Gemini generateContent with automatic key×model fallback.
 * @param {string} prompt
 * @param {object} [generationConfig]
 * @returns {Promise<string>} raw text response
 */
async function generateContent(prompt, generationConfig = {}) {
  return tryAllCombinations(async (key, model) => {
    const genAI = new GoogleGenerativeAI(key)
    const m = genAI.getGenerativeModel({ model, generationConfig })
    const result = await m.generateContent(prompt)
    return result.response.text()
  })
}

/**
 * Start a Gemini chat session with automatic key×model fallback.
 * @param {object} chatConfig
 * @param {string} userMessage
 * @returns {Promise<string>} assistant reply text
 */
async function chatSend(chatConfig, userMessage) {
  const { systemInstruction, ...startChatConfig } = chatConfig
  return tryAllCombinations(async (key, model) => {
    const genAI = new GoogleGenerativeAI(key)
    const m = genAI.getGenerativeModel({
      model,
      ...(systemInstruction ? { systemInstruction } : {}),
    })
    const chat = m.startChat(startChatConfig)
    const result = await chat.sendMessage(userMessage)
    return result.response.text()
  })
}

/**
 * One-shot ping — tries all model×key combos, returns { model, ms }
 * Called at server startup to discover the fastest working model.
 */
async function pingModel() {
  const t0 = Date.now()
  await generateContent('Reply with only: OK')
  return Date.now() - t0
}

module.exports = { generateContent, chatSend, pingModel, MODELS, KEYS, get activeModel() { return activeModel } }
