import { Pill, Twitter, Github, Linkedin, Mail } from 'lucide-react'

const LINKS = [
  {
    heading: 'Product',
    items: [
      { label: 'How It Works',  href: '#how-it-works' },
      { label: 'Features',      href: '#features'     },
      { label: 'Download App',  href: '#download'     },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About Us',      href: '#about'    },
      { label: 'Partner With Us', href: 'mailto:partner@vaidyamarg.in' },
      { label: 'Contact',       href: 'mailto:hello@vaidyamarg.in'   },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { label: 'Privacy Policy',   href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Refund Policy',    href: '#' },
    ],
  },
]

const SOCIAL = [
  { icon: Twitter,  href: 'https://twitter.com/vaidyamarg', label: 'Twitter'  },
  { icon: Github,   href: 'https://github.com/ChandraVerse/VAIDYAMARG', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/vaidyamarg', label: 'LinkedIn' },
  { icon: Mail,     href: 'mailto:hello@vaidyamarg.in', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="bg-ink-DEFAULT text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Pill size={16} className="text-white" />
              </div>
              <span className="font-display font-semibold text-lg tracking-tight">VaidyaMarg</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Affordable generic medicines delivered to your door. Save up to 70% on your prescription costs.
            </p>
            <div className="flex gap-3 mt-5">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-brand-500 hover:text-white transition-all ease-spring"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {LINKS.map(({ heading, items }) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">{heading}</h3>
              <ul className="flex flex-col gap-2.5" role="list">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} VaidyaMarg. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Made with ❤️ in Kolkata, India · CDSCO Compliant · WHO-GMP Certified Medicines
          </p>
        </div>
      </div>
    </footer>
  )
}
