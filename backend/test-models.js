/**
 * Gemini free-tier model speed benchmark
 * Run: node test-models.js
 * Picks the fastest model and prints it for use in routes.
 */

require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const FREE_TIER_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
]

const TEST_PROMPT = 'Say "hello" in exactly 3 words.'

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName })
    const start = Date.now()
    const result = await model.generateContent(TEST_PROMPT)
    const elapsed = Date.now() - start
    const text = result.response.text().trim().slice(0, 60)
    return { modelName, elapsed, text, ok: true }
  } catch (err) {
    return { modelName, elapsed: null, text: err.message.slice(0, 80), ok: false }
  }
}

async function main() {
  console.log('\n🔍 Testing Gemini free-tier models...\n')
  console.log('Model'.padEnd(30), 'Latency'.padEnd(12), 'Status'.padEnd(10), 'Response')
  console.log('─'.repeat(80))

  const results = []

  // Sequential so we don't trigger rate limits immediately
  for (const name of FREE_TIER_MODELS) {
    const r = await testModel(name)
    const latency = r.ok ? `${r.elapsed} ms` : 'FAILED'
    const status  = r.ok ? '✅ OK' : '❌ ERR'
    console.log(name.padEnd(30), latency.padEnd(12), status.padEnd(10), r.text)
    results.push(r)
    // Small pause between calls to respect rate limits
    await new Promise(res => setTimeout(res, 1000))
  }

  const passing = results.filter(r => r.ok).sort((a, b) => a.elapsed - b.elapsed)

  console.log('\n' + '═'.repeat(80))
  if (passing.length === 0) {
    console.log('\n❌ All models failed. Check your GEMINI_API_KEY in .env')
    process.exit(1)
  }

  const best = passing[0]
  console.log(`\n🏆 Fastest model: ${best.modelName}  (${best.elapsed} ms)`)
  console.log(`\nUpdate GEMINI_MODEL in your .env:\n  GEMINI_MODEL=${best.modelName}\n`)
}

main().catch(console.error)
