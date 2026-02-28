import { useApp } from '../context/AppContext'
import { MapPin, Zap, Target, TrendingUp, Globe, ArrowRight, Compass, Check } from 'lucide-react'

/* --- Data ---------------------------------------------------------------- */

const STEPS = [
  { n: '01', label: 'Background',    sub: 'Education, stream & location' },
  { n: '02', label: 'Interests',     sub: 'What you enjoy doing' },
  { n: '03', label: 'Aptitude Quiz', sub: '5 adaptive questions' },
  { n: '04', label: 'Constraints',   sub: 'Budget, time & flexibility' },
  { n: '05', label: 'Your Matches',  sub: 'Ranked careers + roadmap' },
]

const FEATURES = [
  { warm: true,  icon: Target,     title: '5-Layer Profiling',       desc: 'We map where you actually stand — not where you wish you were. Education, location, budget, interests, aptitude.' },
  { warm: false, icon: TrendingUp, title: 'Ranked by Match %',       desc: 'Every career gets a score built from your data. No guesswork, no generic advice.' },
  { warm: true,  icon: MapPin,     title: 'State-Level Precision',   desc: 'Scholarships, entrance exams, and colleges specific to your state.' },
  { warm: false, icon: Zap,        title: '5-Year Market Signal',    desc: 'See which careers are growing, stagnant, or fading before you commit 4 years of your life.' },
  { warm: true,  icon: Globe,      title: 'Past Engineering & MBBS', desc: '400+ paths: Animation, Drone Tech, Chartered Accountancy, Law, Agriculture, Nursing, Design.' },
  { warm: false, icon: Target,     title: 'Side-by-Side Compare',    desc: 'Stack two careers on salary, cost, time-to-income, competition level, and work-life score.' },
]

/* --- Component ----------------------------------------------------------- */

export default function Landing() {
  const { setPage } = useApp()

  return (
    <div className="min-h-screen bg-[#08080D] text-[#EDEAE4] overflow-x-hidden">

      {/* NAV */}
      <header className="fixed top-0 w-full z-50 bg-[#08080D]/75 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_2px_12px_rgba(251,191,36,0.3)]">
              <Compass size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[16px] tracking-[-0.02em] text-[#EDEAE4]">
              Career<span className="text-amber-400">Ramp</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage('auth')}
              className="btn-primary text-sm px-5 py-2"
            >
              Login / Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-40 pb-28 px-5 sm:px-8 text-center overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber-400/[0.04] blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.05] blur-3xl" />

        <div className="relative max-w-3xl mx-auto">
          <h1 className="font-display text-5xl sm:text-6xl md:text-[72px] font-bold tracking-[-0.03em] leading-[1.08] mb-7">
            Find a career that
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-indigo-400 bg-clip-text text-transparent">
              fits your real life
            </span>
          </h1>

          <p className="text-[#7E7C8E] text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            A 5-minute AI assessment built for{' '}
            <span className="text-[#EDEAE4] font-medium">Indian students</span>{' '}
            — profiles your background, budget, location, and skills to match you with
            careers that actually work.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => setPage('auth')}
              className="btn-primary text-[15px] px-8 py-3.5 w-full sm:w-auto"
            >
              Login / Sign Up <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#45434F]">
            {['Results in 5 min', '100% free', 'Works on mobile', 'AI-powered'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={12} className="text-amber-400/70" strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-5 sm:px-8 bg-[#0B0B12]">
        <div className="max-w-5xl mx-auto">
          <p className="section-label text-center">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center tracking-tight mb-14">
            From "I have no idea"
            <br className="hidden sm:block" /> to a clear career plan
          </h2>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[calc(10%+32px)] right-[calc(10%+32px)] h-px bg-gradient-to-r from-amber-400/20 via-indigo-400/20 to-amber-400/20" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
              {STEPS.map((step) => (
                <div key={step.n} className="flex md:flex-col gap-4 md:gap-3 md:items-center md:text-center">
                  <div className="shrink-0 w-16 h-16 rounded-2xl bg-[#131320] border border-indigo-400/15 flex items-center justify-center">
                    <span className="text-indigo-300 font-bold text-sm tracking-widest">{step.n}</span>
                  </div>
                  <div className="pt-0.5">
                    <p className="font-semibold text-[14px] text-[#EDEAE4]">{step.label}</p>
                    <p className="text-xs text-[#45434F] mt-0.5 leading-relaxed">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="section-label text-center">What you get</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center tracking-tight mb-14">
            Built for situations counsellors cannot cover
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => {
              const Icon = f.icon
              const warm = f.warm
              return (
                <div
                  key={f.title}
                  className={`card group cursor-default transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]
                    ${warm ? 'hover:border-amber-400/20' : 'hover:border-indigo-400/20'}`}
                >
                  <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center
                    ${warm
                      ? 'bg-amber-400/[0.08] border border-amber-400/15'
                      : 'bg-indigo-400/[0.08] border border-indigo-400/15'
                    }`}
                  >
                    <Icon size={18} className={warm ? 'text-amber-300' : 'text-indigo-300'} />
                  </div>
                  <h3 className="font-semibold text-[14px] text-[#EDEAE4] mb-2">{f.title}</h3>
                  <p className="text-[#7E7C8E] text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-xl mx-auto text-center">
          <div className="card border-white/[0.09] relative overflow-hidden py-12 px-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-400/[0.04] via-transparent to-indigo-500/[0.05]" />
            <div className="relative">
              <p className="section-label justify-center">Start today</p>
              <h2 className="text-3xl font-bold tracking-tight mb-4 mt-2">
                Your career GPS is ready
              </h2>
              <p className="text-[#7E7C8E] mb-8 leading-relaxed">
                5 minutes. No account. A career plan tailored to where you actually are.
              </p>
              <button
                onClick={() => setPage('auth')}
                className="btn-primary text-[15px] px-10 py-3.5 w-full sm:w-auto"
              >
                Start Free Assessment <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] py-8 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Compass size={12} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-medium text-[#45434F]">CareerRamp</span>
          </div>
          <p className="text-xs text-[#45434F]">
            2025 CareerRamp - Built with Gemini AI - Made for India
          </p>
        </div>
      </footer>

    </div>
  )
}
