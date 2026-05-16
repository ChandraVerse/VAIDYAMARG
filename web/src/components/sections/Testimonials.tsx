import { Star, Quote } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Priya Sharma',    city: 'Patna, Bihar',        condition: 'Type 2 Diabetes', avatar: 'PS',
    text: 'My husband takes Metformin every day. We were spending ₹450 a month on Glucophage. VaidyaMarg switched us to the same generic for ₹65. That\'s ₹4,620 saved every year. Unbelievable.',
  },
  {
    name: 'Rajan Verma',     city: 'Lucknow, UP',         condition: 'Hypertension',    avatar: 'RV',
    text: 'The prescription upload feature is magic. I clicked a photo, and within 30 seconds all five medicines were in my cart with generic alternatives shown. Delivery in two days.',
  },
  {
    name: 'Sunita Patel',    city: 'Ahmedabad, Gujarat',  condition: 'Thyroid',         avatar: 'SP',
    text: 'I was skeptical about generic medicines. But the app shows WHO-GMP certification and the pharmacist verified stamp. Now I recommend VaidyaMarg to everyone in my family.',
  },
  {
    name: 'Arjun Mehta',     city: 'Kolkata, WB',         condition: 'BP & Diabetes',   avatar: 'AM',
    text: 'I\'m 67 and on 8 medications a day. The monthly refill reminder saves me every time. My doctor is impressed with how organized I\'ve become.',
  },
  {
    name: 'Kavita Nair',     city: 'Kochi, Kerala',       condition: 'Acid Reflux',     avatar: 'KN',
    text: 'Pantoprazole was ₹195 at my local medical shop. Same drug on VaidyaMarg costs ₹28. Free delivery above ₹500. I order 3 months at a time now.',
  },
  {
    name: 'Deepak Singh',    city: 'Jaipur, Rajasthan',   condition: 'Post-surgery',    avatar: 'DS',
    text: 'After my surgery I needed antibiotics and painkillers for a month. Branded bill: ₹3,200. VaidyaMarg bill: ₹780. Same medicines, completely different bill.',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-surface-DEFAULT">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs text-brand-500 font-semibold uppercase tracking-widest mb-3">Real Patients. Real Savings.</p>
          <h2 className="font-display text-3xl text-ink-DEFAULT mb-4">Trusted by patients across India</h2>
          <p className="text-base text-ink-muted">From Kochi to Kolkata — people saving on medicines they need every day.</p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:balance]">
          {REVIEWS.map(({ name, city, condition, avatar, text }) => (
            <div
              key={name}
              className="break-inside-avoid mb-4 bg-white rounded-2xl border border-ink-faint/25 p-6 hover:shadow-md hover:border-brand-500/20 transition-all duration-300"
            >
              <Quote size={18} className="text-brand-500/30 mb-3" />
              <p className="text-sm text-ink-muted leading-relaxed mb-5">{text}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-600 text-xs font-bold flex-shrink-0">
                  {avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-DEFAULT truncate">{name}</p>
                  <p className="text-xs text-ink-muted truncate">{city} · {condition}</p>
                </div>
                <div className="ml-auto flex gap-0.5 flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
