"use client"

import Link from "next/link"

export default function SiteNav({ onNavigate }: { onNavigate?: () => void }) {
  const go = (id: string) => {
    onNavigate?.()
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  const navLinkClass =
    "font-mono text-xs tracking-widest uppercase text-white hover:text-cream/70 transition-colors duration-200 cursor-pointer"

  return (
    <nav className="absolute top-8 left-1/2 -translate-x-1/2 sm:left-auto sm:right-10 sm:translate-x-0 z-50 flex gap-8">
      <button onClick={() => go("about")} className={navLinkClass}>
        About
      </button>
      <Link href="/blog" className={navLinkClass}>
        Blog
      </Link>
      <button onClick={() => go("contact")} className={navLinkClass}>
        Contact
      </button>
    </nav>
  )
}
