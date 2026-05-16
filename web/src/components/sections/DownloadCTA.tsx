import { useEffect, useRef, useState } from 'react'

const STORE_LINKS = [
  {
    name: 'Google Play',
    sub: 'Get it on',
    href: '#',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.18 23.5c.37.21.79.22 1.18.02L16.72 12 4.36.48c-.39-.2-.81-.19-1.18.02C2.43.91 2 1.7 2 2.56v18.88c0 .86.43 1.65 1.18 2.06Z" opacity=".6"/>
        <path d="m16.72 12-3.43-3.43L5.54.48l11.18 6.45L16.72 12Z" opacity=".8"/>
        <path d="M16.72 12 5.54 17.57.11 23.02l11.18-6.45L16.72 12Z" opacity=".8"/>
        <path d="m16.72 12 5.1-2.95c.75-.43.75-1.69 0-2.12L16.72 4l-3.43 3.57L16.72 12Z"/>
      </svg>
    ),
  },
  {
    name: 'App Store',
    sub: 'Download on the',
    href: '#',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
      </svg>
    ),
  },
]

const PERKS = [
  { icon: '🎁', text: 'Free for life — no subscription' },
  { icon: '⚡', text: 'Setup in under 60 seconds' },
  { icon: '🔒', text: '100% secure & private' },
  { icon: '🌍', text: 'Available across India' },
]

export default function DownloadCTA() {
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
    <section id="download" className="py-24 relative overflow-hidden bg-gradient-dark" ref={ref}>
      {/* Glow orbs */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-brand-600/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-400/8 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(1,150,158,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(1,150,158,0.15) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="section-wrap relative">
        <div className="max-w-3xl mx-auto text-center">

          {/* Eyebrow */}
          <div className={`transition-all duration-600 ease-spring ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Available on iOS & Android — 100% Free
            </div>
          </div>

          {/* Headline */}
          <div className={`transition-all duration-600 delay-100 ease-spring ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="font-display text-display-2xl text-white mb-6">
              Start saving on
              <br />
              <span className="text-gradient-shimmer">medicines today</span>
            </h2>
            <p className="text-ink-faint/70 text-lg mb-10 max-w-lg mx-auto">
              Join 1 lakh+ families who already save up to 40% every month.
              Download free — no credit card, no subscription.
            </p>
          </div>

          {/* Store buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 transition-all duration-600 delay-200 ease-spring ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {STORE_LINKS.map(s => (
              <a
                key={s.name}
                href={s.href}
                className="flex items-center gap-4 bg-white/10 hover:bg-white/16 border border-white/15 hover:border-brand-400/50 text-white px-6 py-4 rounded-2xl transition-all duration-200 group w-full sm:w-auto"
              >
                <span className="text-white/80 group-hover:text-white transition-colors">
                  {s.icon}
                </span>
                <div className="text-left">
                  <div className="text-xs text-white/55 leading-none mb-1">{s.sub}</div>
                  <div className="text-base font-semibold leading-none">{s.name}</div>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" className="ml-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            ))}
          </div>

          {/* Perks row */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 transition-all duration-600 delay-300 ease-spring ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            {PERKS.map(p => (
              <div key={p.text} className="flex flex-col items-center gap-2 bg-white/5 border border-white/8 rounded-2xl px-3 py-4">
                <span className="text-2xl">{p.icon}</span>
                <span className="text-white/65 text-xs text-center leading-snug">{p.text}</span>
              </div>
            ))}
          </div>

          {/* Social proof strip */}
          <div className={`flex items-center justify-center gap-3 transition-all duration-600 delay-400 ease-spring ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {['PS','RV','MN','AP','SR'].map((initials, i) => (
                <div
                  key={initials}
                  className="w-8 h-8 rounded-full bg-gradient-brand border-2 border-ink-soft flex items-center justify-center text-white text-xs font-bold"
                  style={{ zIndex: 5 - i }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-white/50 text-xs">1,00,000+ downloads &bull; 4.8 ★ rated</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
