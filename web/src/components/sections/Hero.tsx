import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 500,  suffix: '+', label: 'Pharmacies' },
  { value: 40,   suffix: '%', label: 'Avg. Savings' },
  { value: 1,    suffix: 'L+', label: 'Happy Users' },
]

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

const MEDICINES = [
  { name: 'Crocin 650mg (10 tabs)', stores: [
    { store: 'MedPlus',    price: 32, badge: '' },
    { store: 'VaidyaMarg', price: 21, badge: 'best' },
    { store: 'Apollo',     price: 34, badge: '' },
  ]},
  { name: 'Azithromycin 500mg (3 tabs)', stores: [
    { store: 'Netmeds',    price: 89, badge: '' },
    { store: 'VaidyaMarg', price: 61, badge: 'best' },
    { store: '1mg',        price: 94, badge: '' },
  ]},
]

export default function Hero() {
  const heroRef  = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [activeCard, setActiveCard] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  // cycle between medicine cards
  useEffect(() => {
    const id = setInterval(() => setActiveCard(c => (c + 1) % MEDICINES.length), 3500)
    return () => clearInterval(id)
  }, [])

  const stat0 = useCountUp(STATS[0].value, 1800, visible)
  const stat1 = useCountUp(STATS[1].value, 1600, visible)
  const stat2 = useCountUp(STATS[2].value,  900, visible)

  const counts = [stat0, stat1, stat2]

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-surface-DEFAULT"
    >
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-mesh-hero pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(1,105,111,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(1,105,111,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-72 h-72 bg-brand-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="section-wrap w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: copy ── */}
          <div className={`transition-all duration-700 ease-spring ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>

            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-brand" />
              India&apos;s #1 Medicine Price Comparator
            </div>

            {/* Headline */}
            <h1 className="font-display text-display-2xl text-ink-DEFAULT mb-6 leading-[1.05]">
              Save up to{' '}
              <span className="text-gradient-shimmer">40%</span>
              <br />
              on every{' '}
              <span className="relative inline-block">
                medicine
                <svg
                  className="absolute -bottom-2 left-0 w-full text-brand-300"
                  viewBox="0 0 200 12" fill="none" preserveAspectRatio="none"
                  style={{ height: 10 }}
                >
                  <path d="M2 8 Q50 2 100 8 Q150 14 198 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
              {' '}you buy
            </h1>

            <p className="text-ink-muted text-lg leading-relaxed mb-8 max-w-lg">
              VaidyaMarg compares prices across 500+ pharmacies and delivers your medicines
              to your doorstep — faster and cheaper than ever before.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <a href="#download" className="btn-primary gap-2.5 text-base px-8 py-4 animate-pulse-brand">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <path d="M12 18h.01"/>
                </svg>
                Download Free App
              </a>
              <a
                href="#how-it-works"
                className="btn-secondary gap-2.5 text-base px-8 py-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
                See How It Works
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4">
              {[
                { icon: '✓', label: 'FSSAI Approved' },
                { icon: '★', label: '4.8 Rated App' },
                { icon: '🔒', label: 'Secure Payments' },
                { icon: '⚡', label: '2-hr Delivery' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span className="text-brand-500">{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: floating price comparison card ── */}
          <div className={`relative flex justify-center transition-all duration-700 delay-200 ease-spring ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>

            {/* Floating card */}
            <div className="animate-float w-full max-w-sm">
              <div className="card p-5 shadow-float border-gradient">
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                      </svg>
                    </div>
                    <span className="font-display font-semibold text-sm text-ink-DEFAULT">Price Comparison</span>
                  </div>
                  <span className="pill bg-brand-50 text-brand-700 text-xs">Live Prices</span>
                </div>

                {/* Medicine name */}
                <div className="mb-3">
                  <p className="text-xs text-ink-muted mb-1">Comparing</p>
                  <p className="font-semibold text-ink-DEFAULT text-sm leading-tight">
                    {MEDICINES[activeCard].name}
                  </p>
                </div>

                {/* Price rows */}
                <div className="space-y-2">
                  {MEDICINES[activeCard].stores.map((s, i) => (
                    <div
                      key={s.store}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 ${
                        s.badge === 'best'
                          ? 'bg-brand-50 border border-brand-200'
                          : 'bg-surface-warm'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          s.badge === 'best' ? 'bg-brand-600 text-white' : 'bg-ink-faint/50 text-ink-muted'
                        }`}>
                          {s.store[0]}
                        </div>
                        <span className={`text-sm ${
                          s.badge === 'best' ? 'font-semibold text-brand-700' : 'text-ink-muted'
                        }`}>{s.store}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${
                          s.badge === 'best' ? 'text-brand-600' : 'text-ink-DEFAULT'
                        }`}>
                          ₹{s.price}
                        </span>
                        {s.badge === 'best' && (
                          <span className="text-xs bg-brand-600 text-white px-1.5 py-0.5 rounded-full font-medium">Best</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Savings banner */}
                <div className="mt-3 bg-gradient-brand rounded-2xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-white/90 text-xs font-medium">You save</span>
                  <span className="text-white font-bold text-sm">
                    ₹{Math.max(...MEDICINES[activeCard].stores.map(s => s.price)) - Math.min(...MEDICINES[activeCard].stores.map(s => s.price))} ({Math.round(((Math.max(...MEDICINES[activeCard].stores.map(s => s.price)) - Math.min(...MEDICINES[activeCard].stores.map(s => s.price))) / Math.max(...MEDICINES[activeCard].stores.map(s => s.price))) * 100)}% off)
                  </span>
                </div>
              </div>
            </div>

            {/* Floating mini badges */}
            <div className="absolute -top-4 -right-4 animate-float-slow">
              <div className="bg-white rounded-2xl shadow-card border border-ink-faint/30 px-3 py-2 flex items-center gap-2">
                <span className="text-lg">🚚</span>
                <div>
                  <p className="text-xs font-semibold text-ink-DEFAULT">Express Delivery</p>
                  <p className="text-xs text-ink-muted">in 2 hours</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="bg-white rounded-2xl shadow-card border border-ink-faint/30 px-3 py-2 flex items-center gap-2">
                <span className="text-lg">💊</span>
                <div>
                  <p className="text-xs font-semibold text-ink-DEFAULT">500+ Pharmacies</p>
                  <p className="text-xs text-brand-600 font-medium">compared instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className={`mt-16 pt-8 border-t border-ink-faint/30 grid grid-cols-3 gap-6 transition-all duration-700 delay-400 ease-spring ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-display-lg text-gradient mb-1">
                {counts[i]}{s.suffix}
              </div>
              <div className="text-ink-muted text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
