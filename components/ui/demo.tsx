"use client"

import { useEffect, useRef } from "react"
import { MeshGradient } from "@paper-design/shaders-react"
import { TextScramble } from "@/components/ui/text-scramble"
import { QuoteRotator } from "@/components/ui/quote-rotator"

function SpotlightCursor() {
  const spotRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: -1000, y: -1000 })
  const pos = useRef({ x: -1000, y: -1000 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", onMove)

    const loop = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.08
      pos.current.y += (mouse.current.y - pos.current.y) * 0.08

      if (spotRef.current) {
        spotRef.current.style.background = `radial-gradient(600px circle at ${pos.current.x}px ${pos.current.y}px, rgba(220,205,185,0.07) 0%, rgba(190,175,155,0.03) 40%, transparent 70%)`
      }

      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return <div ref={spotRef} className="absolute inset-0 pointer-events-none" />
}

export default function LandingPage() {
  return (
    <div className="w-full h-screen relative overflow-hidden" style={{ backgroundColor: "#141008" }}>
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={["#141008", "#2a1f14", "#4a3828", "#e8ddd0"]}
        speed={0.5}
      />

      <SpotlightCursor />

      {/* Top-left name — decodes on load, loops to stay alive */}
      <div className="absolute top-8 left-10 pointer-events-none">
        <TextScramble
          text="Kye Mora"
          autoStart
          autoStartDelay={600}
          loop
          loopDelay={3000}
          resolvedClassName="text-cream/40"
          className="text-xs"
        />
      </div>

      {/* Top-right nav — plain text, clean wayfinding */}
      <nav className="absolute top-8 right-10 flex items-center gap-8">
        {["Work", "About", "Contact"].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className="font-mono text-xs tracking-widest text-cream/30 uppercase hover:text-cream/70 transition-colors duration-300"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Center — rotating quotes + CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-12">
          <QuoteRotator />
          <a href="#work">
            <TextScramble text="View Work" resolvedClassName="text-cream/50" />
          </a>
        </div>
      </div>

      {/* Bottom-left descriptor */}
      <div className="absolute bottom-8 left-10 pointer-events-none">
        <span className="font-mono text-xs tracking-widest text-cream/25 uppercase">
          Creative Developer
        </span>
      </div>

      {/* Bottom-right scroll hint */}
      <div className="absolute bottom-8 right-10 pointer-events-none">
        <span className="font-mono text-xs tracking-widest text-cream/20 uppercase">
          Scroll
        </span>
      </div>

      {/* Fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #141008)" }}
      />
    </div>
  )
}
