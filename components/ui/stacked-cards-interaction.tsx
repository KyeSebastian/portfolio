"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"

export interface ProjectCardData {
  image:       string
  title:       string
  description: string
  category:    string
  year:        string
  liveUrl?:    string
  githubUrl?:  string
}

const ProjectCard = ({
  card,
  className,
}: {
  card:       ProjectCardData
  className?: string
}) => {
  const href = card.liveUrl ?? card.githubUrl ?? "#"
  const isLive = !!card.liveUrl

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block w-[320px] h-[400px] overflow-hidden rounded-2xl cursor-pointer",
        "border border-cream/8 bg-[#1a1209]",
        "hover:border-cream/20 transition-colors duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden w-[calc(100%-0.75rem)] mx-1.5 mt-1.5 rounded-xl">
        <img
          src={card.image}
          alt={card.title}
          className="object-cover w-full h-full"
        />
        {/* Live / GitHub badge */}
        <span className="absolute top-2.5 right-2.5 font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-cream/50">
          {isLive ? "Live" : "GitHub"}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl font-light text-cream/80 leading-snug">
            {card.title}
          </h2>
          <span className="font-mono text-xs text-cream/20 shrink-0">{card.year}</span>
        </div>
        <p className="font-mono text-xs tracking-widest text-cream/30 uppercase">
          {card.category}
        </p>
        <p className="text-sm text-cream/40 leading-relaxed mt-1">
          {card.description}
        </p>
      </div>
    </a>
  )
}

export function StackedCardsInteraction({
  cards,
  spreadDistance = 44,
  rotationAngle  = 6,
  animationDelay = 0.06,
}: {
  cards:          ProjectCardData[]
  spreadDistance?: number
  rotationAngle?:  number
  animationDelay?: number
}) {
  const [hovering, setHovering] = useState(false)
  const limited = cards.slice(0, 3)

  return (
    <div className="relative w-full flex items-center justify-center py-20">
      <div className="relative w-[320px] h-[400px]">
        {limited.map((card, i) => {
          const isFirst = i === 0
          let xOffset   = 0
          let rotation  = 0

          if (limited.length > 1) {
            if (i === 1) { xOffset = -spreadDistance; rotation = -rotationAngle }
            if (i === 2) { xOffset =  spreadDistance; rotation =  rotationAngle }
          }

          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ zIndex: isFirst ? 10 : 5 - i }}
              initial={{ x: 0, rotate: 0 }}
              animate={{
                x:      hovering ? xOffset : 0,
                rotate: hovering ? rotation : 0,
              }}
              transition={{
                duration: 0.45,
                ease:     "easeInOut",
                delay:    i * animationDelay,
                type:     "spring",
                stiffness: 180,
                damping:   22,
              }}
              {...(isFirst && {
                onHoverStart: () => setHovering(true),
                onHoverEnd:   () => setHovering(false),
              })}
            >
              <ProjectCard card={card} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
