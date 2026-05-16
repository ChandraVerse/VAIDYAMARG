import { useState, useEffect } from 'react'
import { Menu, X, Pill } from 'lucide-react'

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features',     href: '#features'     },
  { label: 'Savings',      href: '#savings'      },
  { label: 'Testimonials', href: '#testimonials'  },
]

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleNav = (href: string) => {
    setOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-spring ${
        scrolled
          ? 'bg-surface-DEFAULT/90 backdrop-blur-md border-b border-ink-faint/30 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group" aria-label="VaidyaMarg home">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
            <Pill size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-ink-DEFAULT tracking-tight">
            VaidyaMarg
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <button
                onClick={() => handleNav(href)}
                className="text-sm text-ink-muted hover:text-brand-500 transition-colors font-body"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#download"
            onClick={e => { e.preventDefault(); handleNav('#download') }}
            className="px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 active:bg-brand-700 transition-all ease-spring shadow-sm hover:shadow-md"
          >
            Download App
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-ink-muted hover:text-ink-DEFAULT hover:bg-surface-offset transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-surface-DEFAULT/95 backdrop-blur-md border-b border-ink-faint/30 px-4 pb-5 pt-2">
          <ul className="flex flex-col gap-1" role="list">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <button
                  onClick={() => handleNav(href)}
                  className="w-full text-left px-3 py-2.5 text-sm text-ink-muted hover:text-brand-500 hover:bg-surface-offset rounded-lg transition-colors"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <a
            href="#download"
            onClick={e => { e.preventDefault(); handleNav('#download') }}
            className="mt-3 block w-full text-center px-4 py-2.5 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Download App
          </a>
        </div>
      )}
    </header>
  )
}
