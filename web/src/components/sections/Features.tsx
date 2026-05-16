import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  {
    id: 'compare',
    size: 'large',
    title: 'Real-Time Price Comparison',
    desc: 'Compare medicine prices across 500+ pharmacies instantly. Our engine refreshes every 15 minutes so you always see the lowest price — guaranteed.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    accent: 'brand',
    badge: 'Core Feature',
    extra: (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[['MedPlus','₹32'],['VaidyaMarg','₹21'],['Apollo','₹34']].map(([store, price], i) => (
          <div key={store} className={`rounded-xl p-2 text-center ${
            i === 1 ? 'bg-brand-600 text-white' : 'bg-surface-warm'
          }`}>
            <div className={`text-xs font-medium mb-0.5 ${ i===1 ? 'text-white/80':'text-ink-muted'}`}>{store}</div>
            <div className={`text-sm font-bold ${i===1?'text-white':'text-ink-DEFAULT'}`}>{price}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'prescription',
    size: 'small',
    title: 'Scan Prescription',
    desc: 'Upload or photograph your prescription. Our OCR reads it and auto-fills your order in seconds.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    accent: 'teal',
  },
  {
    id: 'delivery',
    size: 'small',
    title: '2-Hour Express Delivery',
    desc: 'Order before 8 PM and receive your medicines the same day. Real-time GPS tracking included.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 0 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="1"/>
        <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      </svg>
    ),
    accent: 'teal',
  },
  {
    id: 'generic',
    size: 'small',
    title: 'Generic Alternatives',
    desc: 'Discover cheaper generic equivalents for branded medicines with the same active ingredients.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
        <path d="m8.5 8.5 7 7"/>
      </svg>
    ),
    accent: 'teal',
  },
  {
    id: 'reminders',
    size: 'small',
    title: 'Medicine Reminders',
    desc: 'Never miss a dose. Set smart reminders and auto-reorder when you\'re running low.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    accent: 'teal',
  },
  {
    id: 'history',
    size: 'small',
    title: 'Order History & Savings',
    desc: 'Track every order and see exactly how much you\'ve saved vs. buying at MRP. Monthly savings report included.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    accent: 'teal',
  },
]

export default function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="features" className="py-24 bg-surface-DEFAULT" ref={ref}>
      <div className="section-wrap">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-600 ease-spring ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <div className="section-label mx-auto w-fit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Everything You Need
          </div>
          <h2 className="font-display text-display-xl text-ink-DEFAULT mb-4">
            Built for{' '}
            <span className="text-gradient">smarter healthcare</span>
          </h2>
          <p className="text-ink-muted text-lg max-w-xl mx-auto">
            Every feature is designed to save you money, time, and effort on your daily medicines.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Large card — spans 2 cols on lg */}
          {(() => {
            const f = FEATURES[0]
            return (
              <div
                key={f.id}
                className={`lg:col-span-2 transition-all duration-600 ease-spring ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0ms' }}
              >
                <div className="card p-7 h-full group bg-gradient-to-br from-brand-50 to-white border-brand-100">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-glow-sm group-hover:shadow-glow-brand transition-shadow duration-300">
                      {f.icon}
                    </div>
                    <span className="section-label mb-0 text-xs">{f.badge}</span>
                  </div>
                  <h3 className="font-display text-display-md text-ink-DEFAULT mb-3">{f.title}</h3>
                  <p className="text-ink-muted leading-relaxed mb-2">{f.desc}</p>
                  {f.extra}
                </div>
              </div>
            )
          })()}

          {/* Small cards */}
          {FEATURES.slice(1).map((f, i) => (
            <div
              key={f.id}
              className={`transition-all duration-600 ease-spring ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${(i + 1) * 100}ms` : '0ms' }}
            >
              <div className="card p-6 h-full group">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-DEFAULT mb-2">{f.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
