import Link from "next/link"

export function BlogHeader() {
  return (
    <header className="px-6 sm:px-10 pt-10 pb-6">
      <Link
        href="/"
        className="font-mono text-xs tracking-widest uppercase text-cream/45 hover:text-cream/90 transition-colors duration-200"
      >
        &larr; Kye Mora
      </Link>
    </header>
  )
}
