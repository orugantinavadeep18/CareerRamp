import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Loader2, CheckCircle2, XCircle, Trophy, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function QuizModal({ stepId, stepTitle, onClose }) {
  const { profile, recordQuizScore } = useApp()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  const fetchQuiz = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/api/quiz', {
        skill: stepTitle,
        stepTitle: stepTitle,
        role: profile?.role,
        level: profile?.level,
        count: 4,
      })
      setQuiz(res.data.data)
    } catch (err) {
      console.error('Quiz fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQuiz() }, [])

  const handleAnswer = (qId, answer) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [qId]: answer }))
  }

  const submitQuiz = () => {
    if (!quiz) return
    let score = 0
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++
    })
    const passed = recordQuizScore(stepId, score, quiz.questions.length)
    setResult({ score, total: quiz.questions.length, passed })
    setSubmitted(true)
  }

  const allAnswered = quiz && Object.keys(answers).length === quiz.questions.length
  const pct = result ? Math.round((result.score / result.total) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#12121a] border border-white/[0.07] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="font-display font-bold text-white">Verification Quiz</div>
              <div className="text-xs text-[#8888aa] mt-0.5">{stepTitle}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8888aa] hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 size={28} className="animate-spin text-amber-400" />
              <p className="text-sm text-[#8888aa]">Generating personalized quiz...</p>
            </div>
          )}

          {!loading && quiz && !submitted && (
            <div className="space-y-6">
              {/* Info bar */}
              <div className="bg-[#1a1a26] rounded-xl px-4 py-3 text-xs text-[#8888aa] flex items-center justify-between">
                <span>{quiz.questions.length} questions · Pass with {Math.round((quiz.passingScore / quiz.questions.length) * 100)}%+</span>
                <span className="text-amber-400">{Object.keys(answers).length}/{quiz.questions.length} answered</span>
              </div>

              {/* Questions */}
              {quiz.questions.map((q, qi) => (
                <div key={q.id || qi} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-display font-bold text-amber-400 text-sm mt-0.5">{qi + 1}.</span>
                    <p className="text-sm text-white leading-relaxed">{q.question}</p>
                  </div>
                  <div className="space-y-2 pl-4">
                    {q.options.map((opt, oi) => {
                      const letter = opt.charAt(0) // "A", "B", etc.
                      const selected = answers[q.id] === letter
                      return (
                        <button
                          key={oi}
                          onClick={() => handleAnswer(q.id, letter)}
                          className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-all duration-150 ${
                            selected
                              ? 'bg-amber-500/10 border-amber-500/40 text-white'
                              : 'bg-[#1a1a26] border-white/[0.06] text-[#8888aa] hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              <button
                onClick={submitQuiz}
                disabled={!allAnswered}
                className="btn-primary w-full mt-2"
              >
                Submit Quiz
              </button>
            </div>
          )}

          {/* Results screen */}
          {submitted && result && (
            <div className="space-y-6 animate-fade-up">
              {/* Score card */}
              <div className={`text-center py-8 rounded-2xl border ${
                result.passed
                  ? 'bg-indigo-400/5 border-indigo-400/20'
                  : 'bg-rose-500/5 border-rose-500/20'
              }`}>
                {result.passed
                  ? <Trophy size={40} className="text-amber-400 mx-auto mb-3" />
                  : <XCircle size={40} className="text-rose-400 mx-auto mb-3" />
                }
                <div className={`font-display font-extrabold text-5xl mb-2 ${result.passed ? 'text-indigo-400' : 'text-rose-400'}`}>
                  {pct}%
                </div>
                <div className="text-white font-semibold text-lg">
                  {result.passed ? '🎉 Step Completed!' : 'Keep Practicing'}
                </div>
                <div className="text-[#8888aa] text-sm mt-1">
                  {result.score}/{result.total} correct
                  {result.passed ? ' — roadmap updated!' : ' — try again after reviewing'}
                </div>
              </div>

              {/* Answer review */}
              <div className="space-y-4">
                {quiz.questions.map((q, qi) => {
                  const userAns = answers[q.id]
                  const correct = userAns === q.correctAnswer
                  return (
                    <div key={qi} className={`rounded-xl p-4 border text-sm ${
                      correct ? 'bg-indigo-400/5 border-indigo-400/15' : 'bg-rose-500/5 border-rose-500/15'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        {correct
                          ? <CheckCircle2 size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                          : <XCircle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                        }
                        <span className="text-white font-medium">{q.question}</span>
                      </div>
                      {!correct && (
                        <div className="ml-5 text-xs text-[#8888aa]">
                          <span className="text-rose-400">Your answer: {userAns}</span>
                          <span className="text-indigo-400 ml-3">Correct: {q.correctAnswer}</span>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="ml-5 mt-1.5 text-xs text-[#8888aa] italic">{q.explanation}</div>
                      )}
                    </div>
                  )
                })}
              </div>

              <button onClick={onClose} className="btn-primary w-full">
                {result.passed ? 'Continue Roadmap →' : 'Back to Roadmap'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
