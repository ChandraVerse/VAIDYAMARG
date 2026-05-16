const FOOTER_LINKS = {
  Product: [
    { label: 'Features',     href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Price Compare', href: '#savings' },
    { label: 'Reviews',      href: '#testimonials' },
  ],
  Company: [
    { label: 'About Us',    href: '#' },
    { label: 'Contact',     href: '#' },
    { label: 'Blog',        href: '#' },
    { label: 'Careers',     href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use',   href: '#' },
    { label: 'Refund Policy',  href: '#' },
    { label: 'Cookie Policy',  href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gradient-dark relative overflow-hidden">
      {/* Mesh glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-500/8 rounded-full blur-2xl" />
      </div>

      <div className="section-wrap relative">
        {/* Top CTA strip */}
        <div className="border-b border-white/8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-display-md text-white mb-2">
                Ready to save on medicines?
              </h3>
              <p className="text-ink-faint/70 text-sm max-w-sm">
                Download VaidyaMarg and start comparing prices across 500+ pharmacies instantly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {/* Google Play */}
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/12 text-white px-5 py-3 rounded-2xl transition-all duration-200 group"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.5c.37.21.79.22 1.18.02L16.72 12 4.36.48c-.39-.2-.81-.19-1.18.02C2.43.91 2 1.7 2 2.56v18.88c0 .86.43 1.65 1.18 2.06Z" opacity=".6"/>
                  <path d="m16.72 12-3.43-3.43L5.54.48l11.18 6.45L16.72 12Z" opacity=".8"/>
                  <path d="M16.72 12 5.54 17.57.11 23.02l11.18-6.45L16.72 12Z" opacity=".8"/>
                  <path d="m16.72 12 5.1-2.95c.75-.43.75-1.69 0-2.12L16.72 4l-3.43 3.57L16.72 12Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-white/60 leading-none mb-0.5">Get it on</div>
                  <div className="text-sm font-semibold leading-none">Google Play</div>
                </div>
              </a>
              {/* App Store */}
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/12 text-white px-5 py-3 rounded-2xl transition-all duration-200 group"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-white/60 leading-none mb-0.5">Download on the</div>
                  <div className="text-sm font-semibold leading-none">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </div>
              <span className="font-display text-lg font-semibold text-white">VaidyaMarg</span>
            </a>
            <p className="text-ink-faint/60 text-sm leading-relaxed mb-5">
              India&apos;s trusted medicine delivery platform. Compare prices, order fast, live healthy.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { label: 'Twitter', path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' },
                { label: 'Instagram', path: 'M16 4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4zm-4 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.5-7a1 1 0 1 1 0 2 1 1 0 0 1 0-2z' },
                { label: 'LinkedIn', path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
              ].map(s => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-brand-600 flex items-center justify-center text-ink-faint/70 hover:text-white transition-all duration-200"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white text-sm font-semibold mb-4 tracking-wide">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-ink-faint/55 hover:text-brand-300 text-sm transition-colors duration-150"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-ink-faint/40 text-xs">
            &copy; {new Date().getFullYear()} VaidyaMarg. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-ink-faint/40 text-xs">
            <span>Made with</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#01696f" className="inline">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
