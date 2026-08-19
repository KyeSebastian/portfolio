"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface FlipCardProps {
  front: string
  back: string
  alt: string
  frontPosition?: string
  backPosition?: string
}

function FlipCard({ front, back, alt, frontPosition = "center", backPosition = "center", flipDelay = 0 }: FlipCardProps & { flipDelay?: number }) {
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  // Track whether the user has manually interacted (disables the 15s timer)
  const interactedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isMobile = useCallback(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    []
  )

  // Desktop: flip once card scrolls into view
  useEffect(() => {
    if (isMobile()) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setFlipped(true), flipDelay)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [isMobile])

  // Mobile: auto-flip after 15s if user hasn't tapped
  useEffect(() => {
    if (!isMobile()) return

    timerRef.current = setTimeout(() => {
      if (!interactedRef.current) setFlipped(true)
    }, 15000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isMobile])

  const handleClick = useCallback(() => {
    interactedRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
    setFlipped((f) => !f)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (!isMobile()) setFlipped(true)
  }, [isMobile])

  const handleMouseLeave = useCallback(() => {
    if (!isMobile()) setFlipped(false)
  }, [isMobile])

  return (
    <div
      ref={cardRef}
      className="relative w-full aspect-square cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          willChange: "transform",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={front} alt={alt} className="w-full h-full object-cover" style={{ objectPosition: frontPosition }} />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={back} alt={`${alt} - back`} className="w-full h-full object-cover" style={{ objectPosition: backPosition }} />
        </div>
      </div>
    </div>
  )
}

const PHOTOS: FlipCardProps[] = [
  { front: "/photos/IMG_9540.jpeg",                              back: "/photos/13340035.jpeg",                                   alt: "Kye" },
  { front: "/photos/new.jpeg",  frontPosition: "88% center",    back: "/photos/IMG_9720_Original.jpeg",                          alt: "Kye" },
  { front: "/photos/560CCCB7-D212-4300-AAE1-19DF04C7DF89_Original.jpeg", back: "/photos/IMG_0913.jpeg",                         alt: "Photo" },
  { front: "/photos/FullSizeRender.jpeg",                       back: "/photos/IMG_1135.jpeg",                                   alt: "Photo" },
]

export default function PhotoFlipGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 w-full h-full">
      {PHOTOS.map((card, i) => (
        <FlipCard key={card.front} {...card} flipDelay={i * 150} />
      ))}
    </div>
  )
}
