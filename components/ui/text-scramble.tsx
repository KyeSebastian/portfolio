"use client"

import { useState, useCallback, useRef, useEffect } from "react"

const CHARS = "abcdefghijklmnopqrstuvwxyz"

interface TextScrambleProps {
  text: string
  className?: string
  resolvedClassName?: string
  scrambleClassName?: string
  autoStart?: boolean
  autoStartDelay?: number
  loop?: boolean
  loopDelay?: number
}

export function TextScramble({
  text,
  className = "",
  resolvedClassName = "text-foreground",
  scrambleClassName = "font-mono tracking-widest uppercase",
  autoStart = false,
  autoStartDelay = 400,
  loop = false,
  loopDelay = 2500,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(autoStart ? "" : text)
  const [isHovering, setIsHovering] = useState(false)
  const [isScrambling, setIsScrambling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const loopRef = useRef<NodeJS.Timeout | null>(null)
  const frameRef = useRef(0)

  const scramble = useCallback(() => {
    setIsScrambling(true)
    frameRef.current = 0
    const duration = text.length * 3

    if (intervalRef.current) clearInterval(intervalRef.current)
    if (loopRef.current) clearTimeout(loopRef.current)

    setDisplayText(
      text.split("").map((c) => (c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)])).join("")
    )

    intervalRef.current = setInterval(() => {
      frameRef.current++

      const progress = frameRef.current / duration
      const revealedLength = Math.floor(progress * text.length)

      const newText = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " "
          if (i < revealedLength) return text[i]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join("")

      setDisplayText(newText)

      if (frameRef.current >= duration) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplayText(text)
        setIsScrambling(false)
        if (loop) {
          loopRef.current = setTimeout(scramble, loopDelay)
        }
      }
    }, 30)
  }, [text, loop, loopDelay])

  // Fire once on mount if autoStart
  useEffect(() => {
    if (!autoStart) return
    const t = setTimeout(scramble, autoStartDelay)
    return () => {
      clearTimeout(t)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (loopRef.current) clearTimeout(loopRef.current)
    }
  }, [autoStart, autoStartDelay, scramble])

  const handleMouseEnter = () => {
    if (autoStart && !isScrambling) return // name doesn't re-scramble on hover
    setIsHovering(true)
    scramble()
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  return (
    <span
      className={`group relative inline-flex flex-col cursor-pointer select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={`relative ${scrambleClassName}`}>
        {(displayText || text).split("").map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-all duration-150 ${
              isScrambling && char !== text[i] ? "text-primary scale-110" : resolvedClassName
            }`}
            style={{ transitionDelay: `${i * 10}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      {/* Animated underline, only shown on hover-interactive instances */}
      {!autoStart && (
        <span className="relative h-px w-full mt-2 overflow-hidden">
          <span
            className={`absolute inset-0 bg-foreground transition-transform duration-500 ease-out origin-left ${
              isHovering ? "scale-x-100" : "scale-x-0"
            }`}
          />
          <span className="absolute inset-0 bg-border" />
        </span>
      )}

      {/* Subtle glow on hover, only on interactive instances */}
      {!autoStart && (
        <span
          className={`absolute -inset-4 rounded-lg bg-primary/5 transition-opacity duration-300 -z-10 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </span>
  )
}
