"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TextScramble } from "@/components/ui/text-scramble"
import { QuoteRotator } from "@/components/ui/quote-rotator"
import SiteNav from "@/components/ui/site-nav"

// Spotlight
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
        spotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div
      ref={spotRef}
      className="absolute pointer-events-none"
      style={{
        width:      "600px",
        height:     "600px",
        top:        "-300px",
        left:       "-300px",
        background: "radial-gradient(circle, rgba(220,205,185,0.07) 0%, rgba(190,175,155,0.03) 40%, transparent 70%)",
        willChange: "transform",
      }}
    />
  )
}

// Fade transition overlay
type Phase = "idle" | "closing" | "opening"

function FadeOverlay({ phase, onClosed, onOpened }: { phase: Phase; onClosed: () => void; onOpened: () => void }) {
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
          onAnimationComplete={() => {
            if (phase === "closing") onClosed()
            else if (phase === "opening") onOpened()
          }}
        />
      )}
    </AnimatePresence>
  )
}

// Landing page
export default function LandingPage() {
  const [phase, setPhase] = useState<Phase>("idle")
  const heroRef = useRef<HTMLDivElement>(null)
  const unlockedRef = useRef(false)
  const targetSection = useRef<string>("work")

  // Block wheel/touch scroll on the hero div only, does NOT touch body/html overflow
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const blockWheel = (e: WheelEvent) => {
      if (!unlockedRef.current) e.preventDefault()
    }
    const blockTouch = (e: TouchEvent) => {
      if (!unlockedRef.current) e.preventDefault()
    }

    hero.addEventListener("wheel", blockWheel, { passive: false })
    hero.addEventListener("touchmove", blockTouch, { passive: false })
    return () => {
      hero.removeEventListener("wheel", blockWheel)
      hero.removeEventListener("touchmove", blockTouch)
    }
  }, [])

  const unlock = useCallback(() => {
    unlockedRef.current = true
  }, [])

  // Fade + scroll to a section
  const fadeNavigate = useCallback((sectionId: string) => {
    if (phase !== "idle") return
    targetSection.current = sectionId
    unlock()
    setPhase("closing")
  }, [phase, unlock])

  const handleClosed = useCallback(() => {
    document.getElementById(targetSection.current)?.scrollIntoView({ behavior: "instant" as ScrollBehavior })
    setTimeout(() => setPhase("opening"), 80)
  }, [])

  // Direct scroll, no fade, no body lock to fight
  const scrollTo = useCallback((id: string) => {
    unlockedRef.current = true
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }, [])

  return (
    <>
      <FadeOverlay
        phase={phase}
        onClosed={handleClosed}
        onOpened={() => setPhase("idle")}
      />

      <div ref={heroRef} className="w-full h-[100dvh] relative overflow-hidden">
        <SpotlightCursor />
        <SiteNav onNavigate={unlock} />

        {/* Top-center: name + title */}
        <div className="absolute top-20 sm:top-8 left-0 right-0 flex flex-col items-center gap-2 sm:gap-3 px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-light tracking-tight text-cream/90">
            Kye Mora
          </h1>
          <span className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-white text-center">
            CS grad, Security+ certified, aspiring network engineer
          </span>
        </div>

        {/* Center: quotes + CTA */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="flex flex-col items-center gap-12">
            <QuoteRotator />
            <button onClick={() => fadeNavigate("work")} className="cursor-pointer">
              <TextScramble
                text="View Work"
                autoStart
                autoStartDelay={600}
                loop
                loopDelay={3000}
                resolvedClassName="text-cream/55"
                className="text-sm"
              />
            </button>
          </div>
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
