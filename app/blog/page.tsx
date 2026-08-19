import Link from "next/link"
import HalftonePortrait from "@/components/ui/halftone-portrait"
import { BlogHeroPanel } from "@/components/ui/blog-hero-panel"

export const metadata = {
  title: "Break It Until It Works - Kye Mora",
  description: "A home lab build log. Every mistake kept in.",
}

export default function BlogHeroPage() {
  return (
    <main className="relative min-h-[100dvh] flex flex-col lg:flex-row bg-[#1e1610]">
      {/* Signature-style name, overlaid top-left on the photo/panel corner at every breakpoint */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:left-6 z-50 font-mono text-xs tracking-widest uppercase text-white hover:text-cream/70 transition-colors duration-200"
      >
        Kye Mora
      </Link>

      {/* Mobile only: header row right under the photo, arrow far left, BLOG centered on the same line */}
      <div className="order-2 lg:hidden grid grid-cols-3 items-center px-6 pt-3">
        <Link
          href="/"
          aria-label="Back"
          className="justify-self-start font-mono text-2xl tracking-widest text-white hover:text-cream/70 transition-colors duration-200"
        >
          &larr;
        </Link>
        <p className="col-start-2 justify-self-center [font-family:var(--font-accent)] text-xl tracking-widest uppercase text-cream/90">
          Blog
        </p>
      </div>

      <BlogHeroPanel
        entries={[
          { name: "Homelab", title: "Break It Until It Works", href: "/blog/home-lab" },
        ]}
      />

      <div className="lg:flex-1 order-1 lg:order-2 h-[45vh] lg:h-[100dvh]">
        <HalftonePortrait src="/photos/13340035.jpeg" alt="Kye Mora" className="w-full h-full" />
      </div>
    </main>
  )
}
