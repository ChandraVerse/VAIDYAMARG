import { useState } from 'react'
import { TrendingDown, IndianRupee } from 'lucide-react'

const MEDICINES = [
  { name: 'Metformin 500mg (Diabetes)',      branded: 450,  generic: 65  },
  { name: 'Atorvastatin 10mg (Cholesterol)', branded: 380,  generic: 52  },
  { name: 'Amlodipine 5mg (BP)',             branded: 210,  generic: 38  },
  { name: 'Pantoprazole 40mg (Acidity)',     branded: 195,  generic: 28  },
  { name: 'Levothyroxine 50mcg (Thyroid)',   branded: 165,  generic: 30  },
  { name: 'Azithromycin 500mg (Antibiotic)', branded: 290,  generic: 45  },
]

export default function SavingsCalc() {
  const [selected, setSelected] = useState<number[]>([])

  const toggle = (idx: number) =>
    setSelected(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )

  const brandedTotal = selected.reduce((s, i) => s + MEDICINES[i].branded, 0)
  const genericTotal = selected.reduce((s, i) => s + MEDICINES[i].generic, 0)
  const saving       = brandedTotal - genericTotal
  const pct          = brandedTotal > 0 ? Math.round((saving / brandedTotal) * 100) : 0

  return (
    <section id="savings" className="py-24 bg-surface-2">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs text-brand-500 font-semibold uppercase tracking-widest mb-3">Savings Calculator</p>
          <h2 className="font-display text-3xl text-ink-DEFAULT mb-4">See exactly how much you\'d save</h2>
          <p className="text-base text-ink-muted">Select the medicines you take. We\'ll show you the monthly savings if you switched to generics.</p>
        </div>

        <div className="bg-white rounded-2xl border border-ink-faint/25 shadow-md overflow-hidden">
          {/* Medicine list */}
          <div className="divide-y divide-ink-faint/20">
            {MEDICINES.map(({ name, branded, generic }, idx) => {
              const active  = selected.includes(idx)
              const savedAmt = branded - generic
              const savedPct = Math.round((savedAmt / branded) * 100)
              return (
                <button
                  key={name}
                  onClick={() => toggle(idx)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                    active ? 'bg-brand-500/5' : 'hover:bg-surface-DEFAULT'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ease-spring ${
                    active ? 'bg-brand-500 border-brand-500' : 'border-ink-faint'
                  }`}>
                    {active && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>

                  <span className="flex-1 text-sm font-medium text-ink-DEFAULT">{name}</span>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-ink-muted line-through">₹{branded}/mo</p>
                      <p className="text-sm font-semibold text-brand-500">₹{generic}/mo</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      -{savedPct}%
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Result bar */}
          <div className={`px-5 py-5 border-t border-ink-faint/20 transition-colors ${
            selected.length > 0 ? 'bg-brand-500' : 'bg-surface-DEFAULT'
          }`}>
            {selected.length === 0 ? (
              <p className="text-sm text-ink-muted text-center">Select medicines above to calculate your savings ↑</p>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-white">
                  <TrendingDown size={24} />
                  <div>
                    <p className="text-sm opacity-80">Monthly savings if you switch to generics</p>
                    <p className="font-display text-2xl font-semibold">₹{saving.toLocaleString('en-IN')} / month</p>
                  </div>
                </div>
                <div className="text-center text-white">
                  <p className="font-display text-3xl font-bold">{pct}%</p>
                  <p className="text-xs opacity-70">cheaper</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-ink-muted text-center mt-4">
          * Prices are indicative monthly costs per medicine. Actual savings may vary.
        </p>
      </div>
    </section>
  )
}
