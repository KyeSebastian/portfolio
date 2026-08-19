"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState, useRef, useEffect, useCallback } from "react"

export interface ProjectCardData {
  image:       string
  title:       string
  description: string
  category:    string
  year:        string
  liveUrl?:    string
  githubUrl?:  string
  badgeLabel?: string
}

const ProjectCard = ({
  card,
  className,
}: {
  card:       ProjectCardData
  className?: string
}) => {
  const href   = card.liveUrl ?? card.githubUrl ?? "#"
  const isLive = !!card.liveUrl
  const label  = card.badgeLabel ?? (isLive ? "Demo" : "GitHub")
  const badgeColorClass =
    label === "Blog"
      ? "text-green-400 border-green-400/30"
      : isLive
        ? "text-amber-400 border-amber-400/30"
        : "text-blue-400 border-blue-400/30"

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block overflow-hidden rounded-2xl cursor-pointer",
        "border border-cream/8 bg-[#1a1209]",
        "hover:border-cream/20 transition-colors duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden w-[calc(100%-0.75rem)] mx-1.5 mt-1.5 rounded-xl bg-[#0d0b08] flex items-center justify-center">
        <img
          src={card.image}
          alt={card.title}
          className="object-contain w-full h-full"
        />
        <span className={`absolute top-2.5 right-2.5 font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-black/80 backdrop-blur-sm border ${badgeColorClass}`}>
          {label}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-4 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl font-light text-cream/85 leading-snug">
            {card.title}
          </h2>
          <span className="font-mono text-xs text-cream/20 shrink-0">{card.year}</span>
        </div>
        <p className="font-mono text-xs tracking-widest text-cream/30 uppercase">
          {card.category}
        </p>
        <p className="text-sm text-cream/85 leading-relaxed mt-1">
          {card.description}
        </p>
      </div>
    </a>
  )
}

function MobileCarousel({ cards }: { cards: ProjectCardData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / cards.length
    setActiveIndex(Math.round(el.scrollLeft / cardWidth))
  }, [cards.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [onScroll])

  const scrollTo = (i: number) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / cards.length
    el.scrollTo({ left: cardWidth * i, behavior: "smooth" })
  }

  return (
    <div className="lg:hidden w-full pt-4 pb-8">
      {/* Scroll track */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {/* Leading spacer so first card isn't flush to edge */}
        <div className="shrink-0 w-2" />
        {cards.map((card, i) => (
          <div key={i} className="snap-center shrink-0 w-[82vw] max-w-[340px]">
            <ProjectCard card={card} className="w-full" />
          </div>
        ))}
        {/* Trailing spacer */}
        <div className="shrink-0 w-2" />
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width:           i === activeIndex ? "16px" : "6px",
              height:          "6px",
              backgroundColor: i === activeIndex
                ? "rgba(232,221,208,0.6)"
                : "rgba(232,221,208,0.18)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

const BASE_OFFSETS = [
  { x:   0, rotate:  0, zIndex: 10 },
  { x: -44, rotate: -6, zIndex:  4 },
  { x:  44, rotate:  6, zIndex:  3 },
]

export function StackedCardsInteraction({
  cards,
}: {
  cards: ProjectCardData[]
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const limited = cards.slice(0, 3)

  return (
    <>
      {/* Mobile: horizontal swipe carousel */}
      <MobileCarousel cards={limited} />

      {/* Desktop: stacked fan */}
      <div className="hidden lg:flex relative w-full items-center justify-center pt-4 pb-20">
        <div className="relative w-[380px] h-[480px]">
          {limited.map((card, i) => {
            const base     = BASE_OFFSETS[i] ?? { x: 0, rotate: 0, zIndex: 3 }
            const isActive = activeIndex === i

            return (
              <motion.div
                key={i}
                className="absolute cursor-pointer"
                style={{ zIndex: isActive ? 20 : base.zIndex, willChange: "transform" }}
                animate={{
                  x:      base.x,
                  rotate: isActive ? 0 : base.rotate,
                  y:      isActive ? -24 : 0,
                  scale:  isActive ? 1.03 : 1,
                }}
                transition={{
                  type:      "spring",
                  stiffness: 220,
                  damping:   24,
                }}
                onHoverStart={() => setActiveIndex(i)}
                onHoverEnd={()   => setActiveIndex(null)}
              >
                <ProjectCard card={card} className="w-[380px] h-[480px]" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </>
  )
}
