import { useEffect, useRef, useState } from 'react'

const STEPS = [
  {
    number: '01',
    title: 'Search Your Medicine',
    desc: 'Type the medicine name or scan your prescription. Our AI instantly finds it across 500+ verified pharmacies near you.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    color: 'from-brand-500 to-brand-600',
    highlight: 'Scan prescription with camera',
  },
  {
    number: '02',
    title: 'Compare Live Prices',
    desc: 'See real-time prices, discounts, and availability from all nearby pharmacies side-by-side. No hidden charges.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    color: 'from-brand-400 to-brand-500',
    highlight: 'Live price updates every 15 min',
  },
  {
    number: '03',
    title: 'Order in One Tap',
    desc: 'Pick the best deal and order instantly. Pay securely via UPI, card, or cash on delivery — your choice.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    color: 'from-brand-300 to-brand-400',
    highlight: 'UPI · Card · Cash on delivery',
  },
  {
    number: '04',
    title: 'Delivered to Your Door',
    desc: 'Track your order in real-time. Get medicines delivered within 2 hours from the nearest partner pharmacy.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 0 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="1"/>
        <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      </svg>
    ),
    color: 'from-brand-600 to-brand-700',
    highlight: 'Live GPS tracking',
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="py-24 bg-surface-warm relative overflow-hidden" ref={ref}>
      {/* Bg mesh */}
      <div className="absolute inset-0 bg-mesh-subtle pointer-events-none" />

      <div className="section-wrap relative">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-600 ease-spring ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <div className="section-label mx-auto w-fit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            How It Works
          </div>
          <h2 className="font-display text-display-xl text-ink-DEFAULT mb-4">
            Order in{' '}
            <span className="text-gradient">4 simple steps</span>
          </h2>
          <p className="text-ink-muted text-lg max-w-xl mx-auto">
            From search to doorstep in under 2 hours. No app account needed to compare prices.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-600 opacity-40" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`transition-all duration-600 ease-spring ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: visible ? `${i * 120}ms` : '0ms' }}
              >
                <div className="card p-6 h-full flex flex-col group">
                  {/* Number + icon */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-glow-sm group-hover:shadow-glow-brand transition-shadow duration-300`}>
                      {step.icon}
                    </div>
                    <span className="font-display text-4xl font-bold text-ink-faint/40 leading-none">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-ink-DEFAULT mb-2">
                    {step.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed flex-1 mb-4">
                    {step.desc}
                  </p>

                  {/* Highlight pill */}
                  <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    {step.highlight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
