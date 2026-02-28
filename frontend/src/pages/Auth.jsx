import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Compass, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

export default function Auth() {
  const { login, register } = useApp()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!phone || !password) return setError('Fill in all fields')
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a valid 10-digit mobile number')
    if (password.length < 6) return setError('Password must be at least 6 characters')

    setLoading(true)
    try {
      const fn = mode === 'login' ? login : register
      const result = await fn(phone, password)
      if (result?.error) setError(result.error)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08080D] flex items-center justify-center px-5">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] bg-amber-400/[0.03] rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-3xl" />

      <div className="relative w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_2px_12px_rgba(251,191,36,0.3)]">
            <Compass size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[18px] tracking-[-0.02em] text-[#EDEAE4]">
            Career<span className="text-amber-400">Ramp</span>
          </span>
        </div>

        {/* Card */}
        <div className="card px-7 py-8">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#EDEAE4] tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-sm text-[#45434F] mt-1.5">
              {mode === 'login'
                ? 'Sign in to see your career history'
                : 'Save your results and track your journey'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-[#7E7C8E] mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45434F]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="input-field w-full pl-9 pr-4"
                  autoFocus
                  maxLength={10}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#7E7C8E] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45434F]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field w-full pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#45434F] hover:text-[#7E7C8E] transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/[0.08] border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-[15px] py-3 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={15} />
                  </>
              }
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-5 pt-5 border-t border-white/[0.06] text-center text-sm text-[#45434F]">
            {mode === 'login' ? (
              <>
                No account yet?{' '}
                <button
                  onClick={() => { setMode('register'); setError('') }}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError('') }}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Skip */}
        <p className="text-center mt-5 text-xs text-[#45434F]">
          <button
            onClick={() => { if(window.__skipAuth) window.__skipAuth() }}
            className="hover:text-[#7E7C8E] transition-colors underline underline-offset-2"
          >
            Continue without account
          </button>
        </p>
      </div>
    </div>
  )
}