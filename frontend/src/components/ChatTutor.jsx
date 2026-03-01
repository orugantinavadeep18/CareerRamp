import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Send, Loader2, User, Sparkles, RefreshCw } from 'lucide-react'
import { useApp, api } from '../context/AppContext'

const QUICK_PROMPTS = [
  'What is the fastest path for my budget?',
  'How do I start with zero experience?',
  'Which government exams suit my profile?',
  'Give me free resources for week 1',
]

// Converts **bold** and newlines to HTML
function formatContent(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\n/g, '<br/>')
}

function MessageBubble({ msg }) {
  const isAI = msg.role === 'ai'
  return (
    <div className={`flex items-start gap-2.5 animate-fade-up ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
        isAI
          ? 'bg-gradient-to-br from-amber-400 to-rose-400'
          : 'bg-[#1a1a26] border border-white/[0.07]'
      }`}>
        {isAI ? <Sparkles size={14} className="text-[#0a0a0f]" /> : <User size={14} className="text-[#8888aa]" />}
      </div>
      <div
        className={`max-w-[78%] text-sm leading-relaxed px-4 py-3 rounded-2xl ${
          isAI
            ? 'bg-[#1a1a26] border border-white/[0.06] rounded-tl-sm text-[#c8c8d8]'
            : 'bg-amber-500/10 border border-amber-500/15 rounded-tr-sm text-white'
        } ${msg.isReplan ? 'border-indigo-400/20 bg-indigo-400/5' : ''}`}
      >
        {isAI ? (
          <span
            dangerouslySetInnerHTML={{ __html: formatContent(msg.displayed || msg.content) }}
          />
        ) : (
          <span>{msg.content}</span>
        )}
        {/* blinking cursor while streaming */}
        {msg.streaming && (
          <span className="inline-block w-[2px] h-[14px] bg-amber-400 ml-0.5 align-middle animate-pulse" />
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div role="status" aria-label="AI is typing a response" className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center">
        <Sparkles size={14} className="text-[#0a0a0f]" />
      </div>
      <div className="bg-[#1a1a26] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#8888aa] animate-bounce"
                 style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const INITIAL_MSG = {
  role: 'ai',
  content: "Hi! I'm CareerRamp AI 👋 Ask me about careers, entrance exams, courses, salaries, or anything career-related. I'm here to help!",
  displayed: "Hi! I'm CareerRamp AI 👋 Ask me about careers, entrance exams, courses, salaries, or anything career-related. I'm here to help!",
}

export default function ChatTutor() {
  const { profile, careerData } = useApp()
  const [messages, setMessages] = useState([INITIAL_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Typewriter: reveal fullText char by char into the last message
  const typewrite = useCallback((fullText) => {
    setStreaming(true)
    let i = 0
    intervalRef.current = setInterval(() => {
      i++
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        updated[updated.length - 1] = { ...last, displayed: fullText.slice(0, i), streaming: true }
        return updated
      })
      // scroll while typing
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      if (i >= fullText.length) {
        clearInterval(intervalRef.current)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...updated[updated.length - 1], streaming: false }
          return updated
        })
        setStreaming(false)
      }
    }, 12) // 12ms per char ≈ 80 chars/sec
  }, [])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content || loading || streaming) return
    setInput('')
    setLoading(true)

    const history = messages.slice(-6).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content }])

    try {
      // Detect repeated / confusion queries and adapt the prompt
      const stopwords = new Set(['what','that','this','have','from','with','about','your','like','into','more','some','when','then','than','they','been','just','also','over','after'])
      const extractKW = (text) => text.toLowerCase().split(/\W+/).filter(w => w.length > 4 && !stopwords.has(w))
      const recentUserMsgs = messages.filter(m => m.role === 'user').slice(-4)
      const recentKW = new Set(recentUserMsgs.flatMap(m => extractKW(m.content)))
      const newKW = extractKW(content)
      const overlap = newKW.filter(w => recentKW.has(w))
      const apiMessage = overlap.length >= 2
        ? `${content}\n\n[AI instruction: The student appears confused — they have asked about similar topics (${overlap.slice(0, 3).join(', ')}) before. Please explain more simply with a step-by-step breakdown and a concrete example.]`
        : content
      const res = await api.post('/api/chat', {
        message: apiMessage,
        history,
        context: {
          name: profile?.name,
          age: profile?.age,
          education: profile?.education,
          location: profile?.location,
          topCareer: careerData?.topMatches?.[0]?.career,
          skillGaps: careerData?.skillGapAnalysis?.needToLearn,
          financialCondition: profile?.financialCondition,
        },
      })
      const reply = res.data.reply || "I'm having trouble connecting. Please try again!"
      // Add AI message with empty displayed, then typewrite
      setMessages(prev => [...prev, { role: 'ai', content: reply, displayed: '', streaming: true }])
      setLoading(false)
      typewrite(reply)
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "I'm having trouble connecting right now. Please try again!",
        displayed: "I'm having trouble connecting right now. Please try again!",
      }])
      setLoading(false)
    }
  }

  const clearChat = () => {
    clearInterval(intervalRef.current)
    setStreaming(false)
    setMessages([INITIAL_MSG])
  }

  return (
    <div className="card flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center">
            <Bot size={17} className="text-[#0a0a0f]" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#EDEAE4]">CareerRamp AI</div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-300" role="status" aria-live="polite">
              <div className={`w-1.5 h-1.5 rounded-full ${streaming ? 'bg-amber-400' : 'bg-indigo-400'} animate-pulse`} />
              {streaming ? 'Typing...' : 'Online'}
            </div>
          </div>
        </div>
        <button onClick={clearChat} aria-label="Clear chat history" className="text-[#8888aa] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto scrollbar-hide flex-nowrap">
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => sendMessage(p)}
            disabled={loading || streaming}
            aria-label={`Ask: ${p}`}
            className="text-[10px] whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1a1a26] border border-white/[0.06] text-[#8888aa] hover:border-amber-500/30 hover:text-amber-400 transition-all flex-shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask CareerRamp AI anything..."
            disabled={loading || streaming}
            className="input-field flex-1 text-sm py-2.5"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || streaming}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:bg-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 flex-shrink-0"
          >
            {loading
              ? <Loader2 size={15} className="text-[#0a0a0f] animate-spin" />
              : <Send size={15} className="text-[#0a0a0f]" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
