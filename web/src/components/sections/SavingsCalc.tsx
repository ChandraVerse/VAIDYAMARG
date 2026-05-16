import { useEffect, useRef, useState } from 'react'

const PHARMACIES = [
  { name: 'Apollo Pharmacy', saving: 18 },
  { name: 'MedPlus',         saving: 22 },
  { name: 'Netmeds',         saving: 25 },
  { name: 'VaidyaMarg',      saving: 40, best: true },
]

export default function SavingsCalc() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [spend, setSpend] = useState(2000)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const saved   = Math.round(spend * 0.40)
  const yearly  = saved * 12

  return (
    <section id="savings" className="py-24 bg-surface-warm relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-mesh-subtle pointer-events-none" />

      <div className="section-wrap relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left: copy + slider */}
          <div className={`transition-all duration-600 ease-spring ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="section-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Savings Calculator
            </div>
            <h2 className="font-display text-display-xl text-ink-DEFAULT mb-4">
              How much could{' '}
              <span className="text-gradient">you save?</span>
            </h2>
            <p className="text-ink-muted text-lg mb-8">
              Drag the slider to see your estimated monthly and yearly savings with VaidyaMarg.
            </p>

            {/* Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-ink-muted">Monthly medicine spend</span>
                <span className="font-display text-xl font-semibold text-ink-DEFAULT">
                  ₹{spend.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={10000}
                step={100}
                value={spend}
                onChange={e => setSpend(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #01696f ${((spend-200)/9800)*100}%, #d0d7de ${((spend-200)/9800)*100}%)`,
                  accentColor: '#01696f',
                }}
              />
              <div className="flex justify-between text-xs text-ink-muted mt-1.5">
                <span>₹200</span><span>₹10,000</span>
              </div>
            </div>

            {/* Savings result cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-5 bg-gradient-to-br from-brand-50 to-white border-brand-100">
                <p className="text-xs text-ink-muted mb-1">Monthly savings</p>
                <p className="font-display text-display-lg text-gradient">
                  ₹{saved.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-brand-600 font-medium mt-1">vs. buying at MRP</p>
              </div>
              <div className="card p-5 bg-gradient-to-br from-brand-600 to-brand-700">
                <p className="text-xs text-white/70 mb-1">Yearly savings</p>
                <p className="font-display text-display-lg text-white">
                  ₹{yearly.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-white/70 mt-1">That&apos;s real money back</p>
              </div>
            </div>
          </div>

          {/* Right: pharmacy comparison bars */}
          <div className={`transition-all duration-600 delay-200 ease-spring ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="card p-7">
              <h3 className="font-display text-lg font-semibold text-ink-DEFAULT mb-6">
                Average savings by platform
              </h3>
              <div className="space-y-5">
                {PHARMACIES.map((p, i) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-medium ${
                        p.best ? 'text-brand-700' : 'text-ink-DEFAULT'
                      }`}>{p.name}</span>
                      <span className={`text-sm font-bold ${
                        p.best ? 'text-brand-600' : 'text-ink-muted'
                      }`}>{p.saving}% off</span>
                    </div>
                    <div className="h-2.5 bg-ink-faint/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-spring ${
                          p.best ? 'bg-gradient-brand shadow-glow-sm' : 'bg-ink-faint'
                        }`}
                        style={{
                          width: visible ? `${(p.saving / 40) * 100}%` : '0%',
                          transitionDelay: visible ? `${i * 150 + 300}ms` : '0ms',
                        }}
                      />
                    </div>
                    {p.best && (
                      <p className="text-xs text-brand-600 font-medium mt-1">
                        ★ Best savings — that’s ₹{Math.round(spend * p.saving / 100).toLocaleString('en-IN')} back this month
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom note */}
              <div className="mt-6 pt-5 border-t border-ink-faint/30 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#01696f" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <p className="text-xs text-ink-muted">
                  Based on average prices across 500+ pharmacies. Actual savings may vary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
