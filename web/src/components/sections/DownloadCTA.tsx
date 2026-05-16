import { Smartphone, Apple } from 'lucide-react'

export default function DownloadCTA() {
  return (
    <section id="download" className="py-24 bg-brand-700 relative overflow-hidden">
      {/* BG decorations */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-brand-600/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-6">
          <Smartphone size={12} />
          Available on Android & iOS — Free
        </div>

        <h2 className="font-display text-3xl sm:text-4xl text-white mb-5">
          Start saving on medicines today
        </h2>
        <p className="text-base text-brand-100/70 max-w-xl mx-auto mb-10 leading-relaxed">
          Upload your first prescription and see how much you can save. Takes less than 60 seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          {/* Google Play */}
          <a
            href="#"
            className="flex items-center gap-3 px-6 py-3.5 bg-white text-ink-DEFAULT rounded-xl hover:bg-surface-offset transition-colors shadow-md min-w-[180px]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5-14 8.5c-.5.33-1.5.33-1.5-.5z" fill="#34A853"/>
              <path d="M3 3.5L13.06 12 3 20.5V3.5z" fill="#4285F4"/>
              <path d="M13.06 12L17.5 8.17 3.5 3.07l9.56 8.93z" fill="#FBBC05"/>
              <path d="M3.5 20.93l14-5.1L13.06 12 3.5 20.93z" fill="#EA4335"/>
            </svg>
            <div className="text-left">
              <p className="text-xs text-ink-muted leading-none mb-0.5">Get it on</p>
              <p className="text-sm font-semibold leading-none">Google Play</p>
            </div>
          </a>

          {/* App Store */}
          <a
            href="#"
            className="flex items-center gap-3 px-6 py-3.5 bg-white text-ink-DEFAULT rounded-xl hover:bg-surface-offset transition-colors shadow-md min-w-[180px]"
          >
            <Apple size={22} className="text-ink-DEFAULT flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs text-ink-muted leading-none mb-0.5">Download on the</p>
              <p className="text-sm font-semibold leading-none">App Store</p>
            </div>
          </a>
        </div>

        {/* Mini stats */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          {[
            { val: '70%',    desc: 'avg. savings'          },
            { val: '10K+',   desc: 'medicines listed'      },
            { val: '4.8★',   desc: 'patient rating'        },
            { val: '48hr',   desc: 'avg. delivery time'    },
          ].map(({ val, desc }) => (
            <div key={desc} className="text-center">
              <p className="font-display text-xl font-semibold text-white">{val}</p>
              <p className="text-xs text-white/50">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
