import Link from "next/link"

interface BlogSeriesEntry {
  name: string
  title: string
  href: string
}

interface BlogHeroPanelProps {
  entries: BlogSeriesEntry[]
}

// Reusable left-side panel for the blog hero: a list of series
// entries (currently just Homelab). Each entry reads as one line:
// a numbered index (same convention as "Build Log 01" elsewhere),
// the series name, then its title in a lighter, italic weight.
export function BlogHeroPanel({ entries }: BlogHeroPanelProps) {
  return (
    <div className="lg:flex-1 order-2 lg:order-1 flex flex-col justify-start lg:justify-center items-center lg:items-stretch text-center lg:text-left px-8 sm:px-16 pt-4 pb-10 lg:py-0">
      <p className="hidden lg:block [font-family:var(--font-accent)] text-3xl tracking-widest uppercase text-cream/90 mb-4">
        Blog
      </p>
      <div className="flex flex-col gap-8 items-center lg:items-start">
        {entries.map((entry, i) => (
          <Link key={entry.href} href={entry.href} className="group flex items-baseline gap-4 w-fit mx-auto lg:mx-0">
            <span className="font-mono text-xs sm:text-sm tracking-widest text-zinc-300">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="font-sans tracking-tight leading-[1.3] text-zinc-300 group-hover:text-white transition-colors duration-300">
              <span className="text-xl sm:text-2xl font-normal">{entry.name}:</span>{" "}
              <span className="text-xl sm:text-2xl font-light italic">{entry.title}</span>
            </h2>
          </Link>
        ))}
      </div>
    </div>
  )
}
