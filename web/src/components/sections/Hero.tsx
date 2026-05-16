import { ArrowDown, Sparkles, ShieldCheck, Star } from 'lucide-react'

const STATS = [
  { value: '70%',    label: 'avg. savings on generics' },
  { value: '10,000+', label: 'medicines in catalogue'  },
  { value: '48hr',   label: 'delivery in major cities' },
  { value: '4.8★',   label: 'patient rating'           },
]

export default function Hero() {
  const scrollToHIW = () => {
    document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center pt-16 overflow-hidden bg-surface-DEFAULT bg-mesh">
      {/* Decorative circles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/8 blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-80 h-80 rounded-full bg-brand-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-brand-500/6 blur-2xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 text-xs font-medium mb-8">
          <Sparkles size={12} />
          AI-powered prescription reader — works in 60 seconds
        </div>

        {/* Headline */}
        <h1 className="font-display font-semibold text-ink-DEFAULT mb-6" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.1 }}>
          Your branded medicine costs{' '}
          <span className="text-gradient">10x more</span>
          <br className="hidden sm:block" />
          than the same generic.
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          VaidyaMarg reads your prescription, shows you the WHO-GMP certified generic alternative, and delivers it to your door. 
          Same molecule. Same quality. Up to 70% cheaper.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <a
            href="#download"
            onClick={e => { e.preventDefault(); document.querySelector('#download')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 active:bg-brand-700 transition-all ease-spring shadow-md hover:shadow-lg"
          >
            Download Free App
          </a>
          <button
            onClick={scrollToHIW}
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-ink-faint text-ink-DEFAULT text-sm font-medium rounded-xl hover:border-brand-500/40 hover:text-brand-600 transition-all ease-spring shadow-sm"
          >
            See How It Works
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted mb-16">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-brand-500" /> WHO-GMP Certified</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-brand-500" /> CDSCO Compliant</span>
          <span className="flex items-center gap-1.5"><Star size={13} className="text-brand-500 fill-brand-500" /> 4.8★ from 2,400+ patients</span>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-ink-faint/30 px-4 py-5 shadow-sm"
            >
              <p className="font-display text-2xl font-semibold text-brand-500 mb-1">{value}</p>
              <p className="text-xs text-ink-muted leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={scrollToHIW}
        aria-label="Scroll to How It Works"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-ink-muted/50 hover:text-brand-500 transition-colors animate-bounce"
      >
        <ArrowDown size={18} />
      </button>
    </section>
  )
}
