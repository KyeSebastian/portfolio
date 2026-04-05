const BG = "#141008"

// ─── Work ────────────────────────────────────────────────────────────────────

const projects = [
  {
    name: "Project One",
    category: "Design & Development",
    year: "2024",
    description: "A brief one-line description of what this project was and why it mattered.",
  },
  {
    name: "Project Two",
    category: "Full Stack",
    year: "2024",
    description: "A brief one-line description of what this project was and why it mattered.",
  },
  {
    name: "Project Three",
    category: "Creative Direction",
    year: "2023",
    description: "A brief one-line description of what this project was and why it mattered.",
  },
]

export function WorkSection() {
  return (
    <section
      id="work"
      style={{ backgroundColor: BG }}
      className="px-10 sm:px-20 py-40"
    >
      <p className="font-mono text-xs tracking-widest text-cream/25 uppercase mb-20">
        Selected Work
      </p>

      <div className="flex flex-col">
        {projects.map((p, i) => (
          <div
            key={i}
            className="group flex flex-col sm:flex-row sm:items-baseline justify-between py-10 border-t border-cream/8 cursor-pointer"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl sm:text-4xl font-light text-cream/80 group-hover:text-cream/95 transition-colors duration-500">
                {p.name}
              </h2>
              <p className="font-mono text-xs tracking-widest text-cream/30 uppercase">
                {p.category}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:max-w-xs sm:text-right">
              <p className="text-sm text-cream/35 leading-relaxed">{p.description}</p>
              <p className="font-mono text-xs text-cream/20 mt-2">{p.year}</p>
            </div>
          </div>
        ))}
        {/* closing border */}
        <div className="border-t border-cream/8" />
      </div>
    </section>
  )
}

// ─── About ───────────────────────────────────────────────────────────────────

const tools = ["TypeScript", "React", "Next.js", "Node.js", "Figma", "Tailwind CSS"]

export function AboutSection() {
  return (
    <section
      id="about"
      style={{ backgroundColor: BG }}
      className="px-10 sm:px-20 py-40 border-t border-cream/5"
    >
      <p className="font-mono text-xs tracking-widest text-cream/25 uppercase mb-20">
        About
      </p>

      <div className="flex flex-col sm:flex-row gap-20 sm:gap-32">
        <div className="flex-1 max-w-lg">
          <p className="text-xl sm:text-2xl font-light text-cream/70 leading-relaxed">
            I build digital experiences that sit at the intersection of design and
            engineering. I care about how things feel as much as how they work.
          </p>
          <p className="text-sm text-cream/35 leading-loose mt-8">
            Based somewhere comfortable. Available for the right projects.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-widest text-cream/25 uppercase mb-4">
            Tools
          </p>
          {tools.map((t) => (
            <span key={t} className="font-mono text-xs text-cream/40 tracking-wide">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export function ContactSection() {
  return (
    <section
      id="contact"
      style={{ backgroundColor: BG }}
      className="px-10 sm:px-20 py-40 border-t border-cream/5"
    >
      <p className="font-mono text-xs tracking-widest text-cream/25 uppercase mb-20">
        Contact
      </p>

      <div className="flex flex-col gap-12">
        <a
          href="mailto:hello@kyemora.com"
          className="text-3xl sm:text-5xl font-light text-cream/60 hover:text-cream/90 transition-colors duration-500 w-fit"
        >
          hello@kyemora.com
        </a>

        <div className="flex items-center gap-8">
          <a
            href="https://github.com/KyeMora"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs tracking-widest text-cream/25 uppercase hover:text-cream/60 transition-colors duration-300"
          >
            GitHub
          </a>
          <a
            href="#"
            className="font-mono text-xs tracking-widest text-cream/25 uppercase hover:text-cream/60 transition-colors duration-300"
          >
            LinkedIn
          </a>
          <a
            href="#"
            className="font-mono text-xs tracking-widest text-cream/25 uppercase hover:text-cream/60 transition-colors duration-300"
          >
            Twitter
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer
      style={{ backgroundColor: BG }}
      className="px-10 sm:px-20 py-12 border-t border-cream/5 flex items-center justify-between"
    >
      <span className="font-mono text-xs text-cream/20 tracking-widest uppercase">
        Kye Mora
      </span>
      <span className="font-mono text-xs text-cream/15 tracking-widest">
        © {new Date().getFullYear()}
      </span>
    </footer>
  )
}
