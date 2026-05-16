import { useEffect, useRef, useState } from 'react'

const REVIEWS = [
  {
    name: 'Priya Sharma',
    city: 'Mumbai',
    avatar: 'PS',
    rating: 5,
    text: 'Saved ₹1,200 on my mom’s monthly diabetes medicines! The price comparison is incredible — I had no idea the same strip was ₹40 cheaper two streets away.',
    tag: 'Diabetes Care',
    verified: true,
  },
  {
    name: 'Rahul Verma',
    city: 'Bengaluru',
    avatar: 'RV',
    rating: 5,
    text: 'The prescription scan feature is a game-changer. Uploaded my doctor’s prescription and within 2 minutes had 5 quotes. Ordered in one tap. Delivered in 90 mins.',
    tag: 'Express Delivery',
    verified: true,
  },
  {
    name: 'Meera Nair',
    city: 'Kochi',
    avatar: 'MN',
    rating: 5,
    text: 'As a senior citizen, finding affordable medicines was always stressful. VaidyaMarg made it so simple — my daughter set it up and now I save every month effortlessly.',
    tag: 'Senior Care',
    verified: true,
  },
  {
    name: 'Arjun Patel',
    city: 'Ahmedabad',
    avatar: 'AP',
    rating: 5,
    text: 'The generic alternatives suggestion alone saved me ₹800 per month on my BP medicines. Same salt, same efficacy, 60% cheaper. Why didn’t I know this before?',
    tag: 'Generic Medicines',
    verified: true,
  },
  {
    name: 'Sunita Reddy',
    city: 'Hyderabad',
    avatar: 'SR',
    rating: 5,
    text: 'My family spend on medicines dropped from ₹5,500 to ₹3,200 in the first month. The app is clean, delivery is always on time, and customer support is excellent.',
    tag: 'Family Plan',
    verified: true,
  },
  {
    name: 'Karthik Iyer',
    city: 'Chennai',
    avatar: 'KI',
    rating: 5,
    text: 'I was skeptical at first but the savings are real. Been using it for 6 months, saved over ₹12,000 total. The reminders keep me consistent with my medication schedule.',
    tag: 'Long-term User',
    verified: true,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
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
    <section id="testimonials" className="py-24 bg-surface-DEFAULT" ref={ref}>
      <div className="section-wrap">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-600 ease-spring ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <div className="section-label mx-auto w-fit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Real Stories
          </div>
          <h2 className="font-display text-display-xl text-ink-DEFAULT mb-4">
            Trusted by{' '}
            <span className="text-gradient">1 lakh+ families</span>
          </h2>
          <p className="text-ink-muted text-lg max-w-xl mx-auto">
            Real savings, real deliveries, real people across India.
          </p>
          {/* Aggregate rating */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span className="font-display text-xl font-bold text-ink-DEFAULT">4.8</span>
            <span className="text-ink-muted text-sm">from 12,000+ reviews</span>
          </div>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {REVIEWS.map((r, i) => (
            <div
              key={r.name}
              className={`break-inside-avoid transition-all duration-600 ease-spring ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${i * 80}ms` : '0ms' }}
            >
              <div className="card p-6 group hover:-translate-y-1 transition-transform duration-300">
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {r.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-DEFAULT">{r.name}</p>
                      <p className="text-xs text-ink-muted">{r.city}</p>
                    </div>
                  </div>
                  {r.verified && (
                    <div className="flex items-center gap-1 text-xs text-brand-600 bg-brand-50 border border-brand-100 px-2 py-1 rounded-full">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                      Verified
                    </div>
                  )}
                </div>

                <Stars count={r.rating} />

                <p className="text-ink-muted text-sm leading-relaxed mt-3 mb-4">
                  &ldquo;{r.text}&rdquo;
                </p>

                <span className="pill bg-surface-warm text-ink-muted text-xs border border-ink-faint/40">
                  {r.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
