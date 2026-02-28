import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, User, Sparkles, RefreshCw } from 'lucide-react'
import { useApp } from '../context/AppContext'

const QUICK_PROMPTS = [
  'What is the fastest path for my budget?',
  'How do I start with zero experience?',
  'Which government exams suit my profile?',
  'Give me free resources for week 1',
]

function MessageBubble({ msg }) {
  const isAI = msg.role === 'ai'
  // Render bold markdown
  const formatContent = (text) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\n/g, '<br/>')

  return (
    <div className={`flex items-start gap-2.5 animate-fade-up ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
        isAI
          ? 'bg-gradient-to-br from-amber-400 to-rose-400'
          : 'bg-[#1a1a26] border border-white/[0.07]'
      }`}>
        {isAI ? <Sparkles size={14} className="text-[#0a0a0f]" /> : <User size={14} className="text-[#8888aa]" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] text-sm leading-relaxed px-4 py-3 rounded-2xl ${
          isAI
            ? 'bg-[#1a1a26] border border-white/[0.06] rounded-tl-sm text-[#c8c8d8]'
            : 'bg-amber-500/10 border border-amber-500/15 rounded-tr-sm text-white'
        } ${msg.isReplan ? 'border-indigo-400/20 bg-indigo-400/5' : ''}`}
        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
      />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
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

export default function ChatTutor() {
  const { chatHistory, setChatHistory, sendChat } = useApp()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isTyping])

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content || isTyping) return
    setInput('')
    setIsTyping(true)
    try {
      await sendChat(content)
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = () => {
    setChatHistory([chatHistory[0]])
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
            <div className="flex items-center gap-1.5 text-xs text-indigo-300">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="text-[#8888aa] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto scrollbar-hide flex-nowrap">
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => sendMessage(p)}
            disabled={isTyping}
            className="text-[10px] whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1a1a26] border border-white/[0.06] text-[#8888aa] hover:border-amber-500/30 hover:text-amber-400 transition-all flex-shrink-0 disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {isTyping && <TypingIndicator />}
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
            disabled={isTyping}
            className="input-field flex-1 text-sm py-2.5"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:bg-amber-300 transition-colors flex-shrink-0"
          >
            {isTyping
              ? <Loader2 size={15} className="text-[#0a0a0f] animate-spin" />
              : <Send size={15} className="text-[#0a0a0f]" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
