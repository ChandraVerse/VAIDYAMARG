import { Scan, ShieldCheck, Bell, Clock, CreditCard, MapPin, Star, Zap } from 'lucide-react'

const FEATURES = [
  { icon: Scan,        title: 'AI Prescription Reader',    desc: 'Google Vision + Tesseract OCR reads printed and handwritten prescriptions with ~95% accuracy. Supports English, Hindi, and Bengali.',  wide: true  },
  { icon: ShieldCheck, title: 'Pharmacist Verified',       desc: 'Every prescription reviewed by a licensed pharmacist before dispatch. No shortcuts on safety.',                                         wide: false },
  { icon: Bell,        title: 'Refill Reminders',          desc: 'Set monthly reminders for chronic medications — never run out of diabetes, thyroid or BP tablets again.',                            wide: false },
  { icon: Clock,       title: 'Same-Day Dispatch',         desc: 'Orders placed before 2 PM dispatched the same day in Tier-1 cities.',                                                                 wide: false },
  { icon: CreditCard,  title: 'All Indian Payment Methods',desc: 'UPI, Cards, Net Banking, Wallets and Cash on Delivery — all powered by Razorpay.',                                                  wide: false },
  { icon: MapPin,      title: 'Live Order Tracking',       desc: 'Real-time delivery tracking with push notifications and SMS alerts at every stage of your order.',                                      wide: true  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-surface-DEFAULT">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs text-brand-500 font-semibold uppercase tracking-widest mb-3">Built for India</p>
          <h2 className="font-display text-3xl text-ink-DEFAULT mb-4">Everything you need to save on medicines</h2>
          <p className="text-base text-ink-muted">Designed ground-up for Indian patients, Indian payment rails, and Indian prescriptions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl bg-white border border-ink-faint/25 p-6 hover:shadow-lg hover:border-brand-500/25 transition-all duration-300 ease-spring"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/15 transition-colors">
                <Icon size={20} className="text-brand-500" />
              </div>
              <h3 className="font-display text-lg text-ink-DEFAULT mb-2">{title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Certification strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-5 px-8 bg-brand-500/5 rounded-2xl border border-brand-500/15">
          {[
            { icon: Star,        label: 'WHO-GMP Certified Medicines'  },
            { icon: ShieldCheck, label: 'CDSCO Compliant Platform'     },
            { icon: Zap,         label: 'DPDP Act Data Privacy Ready'  },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-brand-600">
              <Icon size={14} className="text-brand-500" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
