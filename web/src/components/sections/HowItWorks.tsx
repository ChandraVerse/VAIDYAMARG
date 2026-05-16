import { Camera, Search, ShoppingCart, Truck } from 'lucide-react'

const STEPS = [
  {
    icon: Camera,
    title: 'Upload Prescription',
    desc: 'Take a photo of your doctor\'s prescription. Our AI reads it instantly — printed or handwritten — using Google Vision OCR.',
    tag:  'Supports JPG, PNG & PDF',
  },
  {
    icon: Search,
    title: 'Compare & Choose',
    desc: 'See every medicine with its generic alternative. Compare prices, manufacturers, WHO-GMP certification side-by-side.',
    tag:  'All generics pharmacist-verified',
  },
  {
    icon: ShoppingCart,
    title: 'Order in Seconds',
    desc: 'Add generics to cart and checkout with UPI, card, net banking or cash on delivery. One-tap reorder for chronic patients.',
    tag:  'Razorpay secure payments',
  },
  {
    icon: Truck,
    title: 'Track & Receive',
    desc: 'Live order tracking via the app. Get SMS and push notifications at every step. Same-day dispatch in major cities.',
    tag:  'Free delivery above ₹500',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-surface-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-xs text-brand-500 font-semibold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="font-display text-3xl text-ink-DEFAULT mb-4">
            From prescription to doorstep<br className="hidden sm:block" /> in under 60 seconds
          </h2>
          <p className="text-base text-ink-muted">No prior knowledge needed. If you can take a photo, you can use VaidyaMarg.</p>
        </div>

        {/* Connector line desktop */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-500/25 to-transparent"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map(({ icon: Icon, title, desc, tag }, idx) => (
              <div key={title} className="group flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:bg-brand-500 group-hover:border-brand-500 transition-all duration-300 ease-spring">
                    <Icon size={24} className="text-brand-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg text-ink-DEFAULT mb-2">{title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed mb-3">{desc}</p>
                <span className="text-xs text-brand-600 bg-brand-500/8 px-3 py-1 rounded-full">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
