"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TextScramble } from "@/components/ui/text-scramble"
import { QuoteRotator } from "@/components/ui/quote-rotator"

// ── Spotlight ────────────────────────────────────────────────────────────────
function SpotlightCursor() {
  const spotRef = useRef<HTMLDivElement>(null)
  const mouse   = useRef({ x: -1000, y: -1000 })
  const pos     = useRef({ x: -1000, y: -1000 })
  const raf     = useRef<number>(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener("mousemove", onMove)

    const loop = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.08
      pos.current.y += (mouse.current.y - pos.current.y) * 0.08
      if (spotRef.current)
        spotRef.current.style.background = `radial-gradient(600px circle at ${pos.current.x}px ${pos.current.y}px, rgba(220,205,185,0.07) 0%, rgba(190,175,155,0.03) 40%, transparent 70%)`
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

// ── Fade transition overlay ───────────────────────────────────────────────────
type Phase = "idle" | "closing" | "opening"

function FadeOverlay({ phase, onClosed }: { phase: Phase; onClosed: () => void }) {
  const show = phase !== "idle"

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="fade"
          className="fixed inset-0 pointer-events-none"
          style={{ backgroundColor: "#141008", zIndex: 100 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "closing" ? 1 : 0 }}
          transition={{
            duration: phase === "closing" ? 0.5 : 0.6,
            ease: phase === "closing" ? [0.4, 0, 1, 1] : [0, 0, 0.2, 1],
          }}
          onAnimationComplete={() => { if (phase === "closing") onClosed() }}
        />
      )}
    </AnimatePresence>
  )
}

// ── Landing page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [phase, setPhase] = useState<Phase>("idle")
  const hasUnlocked = useRef(false)

  const unlock = useCallback(() => {
    hasUnlocked.current = true
    document.documentElement.style.overflow = ""
    document.body.style.overflow = ""
  }, [])

  // Scroll gate — lock body scroll while at hero, permanently release after first "View Work"
  useEffect(() => {
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    const onScroll = () => {
      if (!hasUnlocked.current && window.scrollY === 0) {
        document.documentElement.style.overflow = "hidden"
        document.body.style.overflow = "hidden"
      }
    }
    window.addEventListener("scroll", onScroll)
    return () => {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  // View Work — trigger split, scroll, then open
  const handleViewWork = useCallback(() => {
    if (phase !== "idle") return
    unlock()
    setPhase("closing")
  }, [phase, unlock])

  // Called when panels have fully closed (meeting in middle)
  const handleClosed = useCallback(() => {
    // Instant scroll while screen is covered
    document.getElementById("work")?.scrollIntoView({ behavior: "instant" as ScrollBehavior })
    // Brief pause so scroll settles, then open the curtain
    setTimeout(() => setPhase("opening"), 80)
  }, [])

  // After opening animation finishes, reset
  const handleOpened = useCallback(() => {
    setPhase("idle")
  }, [])

  const navigateTo = useCallback((id: string) => {
    unlock()
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 10)
  }, [unlock])

  return (
    <>
      <FadeOverlay
        phase={phase}
        onClosed={handleClosed}
      />

      <div className="w-full h-screen relative overflow-hidden">
        <SpotlightCursor />

        {/* Top-left name */}
        <div className="absolute top-8 left-10 pointer-events-none">
          <TextScramble
            text="Kye Mora"
            autoStart
            autoStartDelay={600}
            loop
            loopDelay={3000}
            resolvedClassName="text-cream/55"
            className="text-xs"
          />
        </div>

        {/* Top-right nav */}
        <nav className="absolute top-8 right-10 flex items-center gap-8">
          {["About", "Blog", "Contact"].map((label) => (
            <button key={label} onClick={() => navigateTo(label.toLowerCase())}>
              <TextScramble
                text={label}
                autoStart
                autoStartDelay={600}
                loop
                loopDelay={3000}
                resolvedClassName="text-cream/55"
                className="text-xs"
              />
            </button>
          ))}
        </nav>

        {/* Center — quotes + CTA */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-12">
            <QuoteRotator />
            <button onClick={handleViewWork}>
              <TextScramble text="View Work" resolvedClassName="text-cream/55" />
            </button>
          </div>
        </div>

        {/* Bottom-left descriptor */}
        <div className="absolute bottom-8 left-10 pointer-events-none">
          <span className="font-mono text-xs tracking-widest text-cream/25 uppercase">
            Creative Developer
          </span>
        </div>

        {/* Fade into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(20,16,8,0.6))" }}
        />
      </div>
    </>
  )
}
