"use client"

import { useState, useEffect } from "react"
import { TextEffect } from "@/components/ui/text-effect"

// Swap these for your own quotes
const QUOTES = [
  { text: "Can you stay true to what you said you're gonna do, long after the mood you said it in is gone?" },
  { text: "Change can take place in an instant if you are willing to flip the switch" },
  { text: "You are only responsible for the effort not the outcome" },
  { text: "If you're worth more, get more" },
  { text: "Nothing changes if nothing changes" },
  { text: "Success is not driven by anything other than consistency" },
  { text: "Never make the same mistake twice" },
  { text: "Be more interested than interesting" },
  { text: "One percent better every day" },
  { text: "The way you speak to yourself matters" },
  { text: "The mindset you carry shapes the life you create" },
  { text: "Growth comes with learning to be uncomfortable" },
]

const INTERVAL_MS = 8000

const blurSlideVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
    exit: {
      transition: { staggerChildren: 0.02, staggerDirection: 1 },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(10px) brightness(0%)",
      y: 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px) brightness(100%)",
      transition: { duration: 0.4 },
    },
    exit: {
      opacity: 0,
      y: -24,
      filter: "blur(10px) brightness(0%)",
      transition: { duration: 0.3 },
    },
  },
}

export function QuoteRotator() {
  const [index, setIndex] = useState(0)
  const [trigger, setTrigger] = useState(true)

  const advance = (next?: number) => {
    setTrigger(false)
    setTimeout(() => {
      setIndex((i) => next ?? (i + 1) % QUOTES.length)
      setTrigger(true)
    }, 400)
  }

  useEffect(() => {
    const t = setInterval(() => advance(), INTERVAL_MS)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8 text-center max-w-2xl px-8">

      {/* Quote */}
      <div
        onClick={() => advance()}
        className="cursor-pointer select-none min-h-[10rem] sm:min-h-[6rem] flex items-center justify-center"
        title="Click for next quote"
      >
        <TextEffect
          per="word"
          variants={blurSlideVariants}
          trigger={trigger}
          className="text-2xl sm:text-4xl lg:text-5xl font-light leading-snug tracking-tight text-cream/55"
        >
          {QUOTES[index].text}
        </TextEffect>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center gap-2">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            onClick={() => advance(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width:           i === index ? "16px" : "4px",
              height:          "4px",
              backgroundColor: i === index
                ? "rgba(232,221,208,0.5)"
                : "rgba(232,221,208,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  )
}
