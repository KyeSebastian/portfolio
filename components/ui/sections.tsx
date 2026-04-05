"use client"

import { StackedCardsInteraction, type ProjectCardData } from "@/components/ui/stacked-cards-interaction"

const BG = "#141008"

// ─── Work ────────────────────────────────────────────────────────────────────

const projects: ProjectCardData[] = [
  {
    title:       "Project One",
    category:    "Full Stack",
    year:        "2024",
    description: "A brief one-line description of what this project was and why it mattered.",
    image:       "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
    githubUrl:   "https://github.com/KyeSebastian",
  },
  {
    title:       "Project Two",
    category:    "Design & Development",
    year:        "2024",
    description: "A brief one-line description of what this project was and why it mattered.",
    image:       "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
    githubUrl:   "https://github.com/KyeSebastian",
  },
  {
    title:       "Project Three",
    category:    "Creative Direction",
    year:        "2023",
    description: "A brief one-line description of what this project was and why it mattered.",
    image:       "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=60",
    liveUrl:     "https://kyemora.com",
  },
]

const stack: { category: string; items: string[] }[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express", "PostgreSQL", "REST APIs"],
  },
  {
    category: "Tooling",
    items: ["Git", "Figma", "VS Code", "Vercel"],
  },
  {
    category: "Learning",
    items: ["Three.js", "Python", "AWS"],
  },
]

export function WorkSection() {
  return (
    <section
      id="work"
      style={{ backgroundColor: "rgba(20,16,8,0.55)" }}
      className="px-10 sm:px-20 py-40"
    >
      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-20 lg:gap-0">

        {/* Left — project cards */}
        <div className="flex-1 flex flex-col">
          <p className="font-mono text-xs tracking-widest text-cream/25 uppercase mb-3">
            Selected Work
          </p>
          <p className="text-2xl font-light text-cream/35 mb-8">
            Hover to explore
          </p>
          <StackedCardsInteraction cards={projects} />
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-cream/5 mx-16 self-stretch" />

        {/* Right — tech stack */}
        <div className="flex-1 flex flex-col">
          <p className="font-mono text-xs tracking-widest text-cream/25 uppercase mb-3">
            Tech Stack
          </p>
          <p className="text-2xl font-light text-cream/35 mb-12">
            Tools I reach for without thinking twice
          </p>

          <div className="flex flex-col gap-8">
            {stack.map((group) => (
              <div key={group.category}>
                <p className="font-mono text-xs tracking-widest text-cream/20 uppercase mb-4">
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1.5 text-xs font-mono text-cream/45 border border-cream/10 hover:border-cream/25 hover:text-cream/65 transition-all duration-300 cursor-default"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

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
      style={{ backgroundColor: "rgba(20,16,8,0.55)" }}
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
      style={{ backgroundColor: "rgba(20,16,8,0.55)" }}
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
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

          {/* CV Download */}
          <a
            href="/cv.pdf"
            download
            className="group flex items-center gap-3 border border-cream/15 hover:border-cream/35 px-5 py-2.5 transition-colors duration-300 w-fit"
          >
            <span className="font-mono text-xs tracking-widest text-cream/40 group-hover:text-cream/70 uppercase transition-colors duration-300">
              Download CV
            </span>
            <svg
              width="10" height="12" viewBox="0 0 10 12" fill="none"
              className="text-cream/30 group-hover:text-cream/60 transition-colors duration-300"
            >
              <path d="M5 0v8M1 5l4 4 4-4M0 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
      style={{ backgroundColor: "rgba(20,16,8,0.55)" }}
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
